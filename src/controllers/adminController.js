const { Contract, Job, Profile, sequelize } = require('../model')
const { Op, QueryTypes } = require("sequelize");
const AppError = require ('../utils/appError')
const catchAsync = require('../utils/catchAsync');

exports.getBestProfession = catchAsync(async (req, res, next) => {
    const { start, end } = req.query;

    const highestEarningProfession = await Profile.findOne({
        attributes: [
            [sequelize.literal(`(
                SELECT 
                    Profile.profession
                FROM Profiles as 'Profile'
                    INNER JOIN Contracts as 'Contract' ON Profile.id = Contract.ContractorId
                    INNER JOIN Jobs as 'Job' ON Contract.id = Job.ContractId
                WHERE
                    Job.paid IS NOT NULL
                    ${start ? 'AND Job.paymentDate > :start' : ''}
                    ${end ? 'AND Job.paymentDate < :end' : ''}
                GROUP BY
                    Profile.profession
                ORDER BY SUM(Job.price) 
                DESC 
                LIMIT 1)`
            ), 'profession'],
        ],
        replacements: {start, end},
        type: sequelize.QueryTypes.SELECT
    });

    if (!highestEarningProfession) {
        return next(new AppError(`No professions were paid during the requested time`, 404));
    }

    res.status(200).json ({
        status: "success",
        data: {
            highestEarningProfession
        }
    }) 
})

exports.getBestClients = catchAsync(async (req, res, next) => {
    const { start, end, limit = 2} = req.query;
    const highestPayingClients = await sequelize.query(
        `SELECT 
            Profile.id,
            CONCAT(Profile.firstName, ' ', Profile.lastName) as 'fullName',
            SUM(Job.price) as 'paid'
        FROM Profiles as 'Profile'
            INNER JOIN Contracts as 'Contract' ON Profile.id = Contract.ClientId
            INNER JOIN Jobs as 'Job' ON Contract.id = Job.ContractId
        WHERE
            Job.paid IS NOT NULL
            ${start ? 'AND Job.paymentDate > :start' : ''}
            ${end ? 'AND Job.paymentDate < :end' : ''}
        GROUP BY
            Profile.id, Fullname
        ORDER BY 
            SUM(Job.price) DESC
        LIMIT
            :limit
        `, 
        {
            replacements: {
                start, end, limit
            },
            type: QueryTypes.SELECT
        }
    )

    if (!highestPayingClients) {
        return next(new AppError(`No clients made payments in the requested time range`, 404));
    }

    res.status(200).json ({
        status: "success",
        data: {
            highestPayingClients
        }
    }) 
})