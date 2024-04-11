const { Contract } = require('../model')
const { Op } = require("sequelize");
const AppError = require ('../utils/appError')
const catchAsync = require('../utils/catchAsync');

exports.getContract = catchAsync(async (req, res, next) => {
    const {id} = req.params
    const contract = await Contract.findOne({
        where: {
            id,
            [Op.or]: [
                //I added a where clause here instead of giving 401 if Ids don't match, so the unauthorized person doesn't know if there is an item with that ID or if he lacks access. Security measure.
                {ClientId: req.profile.id},
                {ContractorId: req.profile.id},
            ]
        }
    })

    if (!contract) {
        return next(new AppError(`No contract found with with ID='${id}'`, 404));
    }
    
    res.status(200).json ({
        status: "success",
        data: {
            contract
        }
    })
});

exports.getNonTerminatedContracts = catchAsync(async (req, res, next) => {
    const contracts = (await Contract.findAll({
        where: {
            status: {
                [Op.ne]: 'terminated',
            },
            [Op.or]: [
                //I added a where clause here instead of giving 401 if Ids don't match, so the unauthorized person doesn't know if there is an item with that ID or if he lacks access. Security measure.
                {ClientId: req.profile.id},
                {ContractorId: req.profile.id},
            ] 
        }
    })) ?? []

    // Here I will return empty array with success if no contracts are found, standarized
    res.status(200).json ({
        status: "success",
        data: {
            contracts
        }
    })
})