const { Contract } = require('../model')
const AppError = require ('../utils/appError')
const catchAsync = require('../utils/catchAsync');

exports.getContract = catchAsync(async (req, res, next) => {
    const {id} = req.params
    console.log(`id: ${id}`)
    const contract = await Contract.findOne({
        where: {
            id
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