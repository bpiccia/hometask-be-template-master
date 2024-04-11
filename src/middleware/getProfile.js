const AppError = require ('../utils/appError')

const getProfile = async (req, res, next) => {
    const {Profile} = req.app.get('models')
    const profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}})
    if(!profile) 
        return next(new AppError(`Not authorized`, 401));
    req.profile = profile
    next()
}
module.exports = {getProfile}