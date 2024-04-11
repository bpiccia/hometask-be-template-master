const { Contract, Job, Profile, sequelize } = require('../model')
const { Op } = require("sequelize");
const AppError = require ('../utils/appError')
const catchAsync = require('../utils/catchAsync');

exports.addBalance = catchAsync(async (req, res, next) => {
    const {userId:id} = req.params
    const {amount = 0} = req.body

    const [profile, jobs] = await Promise.all([
        Profile.findOne({
            where: {
                id,
                type: 'client',
            }
        }),
        Job.findAll({
            where: {
                paid: {
                    [Op.not]: true
                },
            },
            include: {
                model: Contract,
                as: 'Contract',
                where: {
                    [Op.or]: [
                        {ClientId: req.profile.id},
                    ]
                }
            }
        })
    ])

    if (id != req.profile.id || !profile){
        return next(new AppError(`Profile not found`, 404));
    }

    const pendingJobsBalance = jobs.reduce((total, job) => total + job.price, 0)

    // This condition didn't make sense, but implemented as requested.
    if (amount > (0.25 * pendingJobsBalance)) {
        return next(new AppError(`Amount added (${amount}) surpasses maximum of 25% of pending job costs (${pendingJobsBalance}).`, 400));
    }
    
    const t = await sequelize.transaction();

    try {
        // Avoid concurrency
        await profile.increment('balance', {
            by: amount,
            transaction: t
        })

        await t.commit();
    } catch (error) {
        await t.rollback();
        throw error
    }
    
    const updatedProfile = await Profile.findOne({
        where: {id}
    })

    res.status(200).json ({
        status: "success",
        data: {
            updatedProfile
        }
    })

    
})