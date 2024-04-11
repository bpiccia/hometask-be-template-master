const { Contract, Job, Profile } = require('../model')
const { Op } = require("sequelize");
const AppError = require ('../utils/appError')
const catchAsync = require('../utils/catchAsync');

exports.addBalance = catchAsync(async (req, res, next) => {
    const {userId:id} = req.params
    const {amount = 0} = req.body

    // if (id !== req.profile.id){
    //     return next(new AppError(`Unauthorized`, 401));
    // }

    const [profile, jobs] = await Promise.all([
        Profile.findOne({
            where: {
                id,
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
    console.log(pendingJobsBalance)

    // This condition didn't make sense, but implemented as requested.
    if (amount > (0.25 * pendingJobsBalance)) {
        return next(new AppError(`Amount added (${amount}) surpasses maximum of 25% of pending job costs (${pendingJobsBalance}).`, 400));
    }

    await Profile.update(
        {
            balance: profile.balance + amount
        },
        {
            where: {
                id
            }
        }
    )

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