const { Contract, Job, Profile, sequelize } = require('../model')
const { Op } = require("sequelize");
const AppError = require ('../utils/appError')
const catchAsync = require('../utils/catchAsync');

exports.getUnpaidJobs = catchAsync(async (req, res, next) => {
    const jobs = (await Job.findAll({
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
                    {ContractorId: req.profile.id},
                ],
                status: 'in_progress'
            }
        }
    })) ?? []

    res.status(200).json ({
        status: "success",
        data: {
            jobs
        }
    })
})

exports.payJob = catchAsync(async (req, res, next) => {
    const {job_id: id} = req.params;
    
    const job = await Job.findOne({
        where: {
            paid: {
                [Op.not]: true
            },
            id,
        },
        include: {
            model: Contract,
            as: 'Contract',
            attributes: ['id', 'contractorId', 'clientId'],
            where: {
                ClientId: req.profile.id
            },
            include: [
                {
                    model: Profile,
                    as: 'Contractor',
                    attributes: ['id', 'balance'],
                },
                {
                    model: Profile,
                    as: 'Client',
                    attributes: ['id', 'balance'],
                }
            ]
        }
    })

    if (!job) {
        return next(new AppError(`No Job pending payment for ID='${id}'`, 404));
    }

    // console.log(job)

    const { Contract: {ContractorId, ClientId}} = job

    const [client, contractor] = await Promise.all ([
        Profile.findOne({id: ClientId}),
        Profile.findOne({id: ContractorId})
    ])

    if (client.balance < job.price){
        return next(new AppError(`Not enough balance to pay for job ID='${id}'`, 400));
    }

    const t = await sequelize.transaction();

    try {
        await Promise.all ([
            client.decrement('balance', {
                by: job.price,
                transaction: t,
            }),
            contractor.increment('balance', {
                by: job.price,
                transaction: t,
            }),
            Job.update(
                {
                    paid: true,
                    paymentDate: new Date(),
                },
                {
                    where: {
                        id
                    },
                    transaction: t
                }
            )
        ]);
        await t.commit()
    } catch (error) {
        await t.rollback()
        throw error
    }

    const updatedJob = await Job.findOne({
        where: {
            id,
        },
        attributes: ['id', 'description', 'price', 'paid', 'paymentDate'],
        include: {
            model: Contract,
            as: 'Contract',
            attributes: ['id'],
            where: {
                ClientId: req.profile.id
            },
            include: [
                {
                    model: Profile,
                    as: 'Client',
                    attributes: ['id', 'balance'],
                }
            ]
        }
    })

    res.status(200).json ({
        status: "success",
        data: {
            job: updatedJob
        }
    })
})