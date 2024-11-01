const jwt = require('jsonwebtoken')

const User = require('../models/user');


const auth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decode._id, Action: true });
        if (!user) {
            return res.status(401).send({ status: 401, success: false, message: 'Invalid Authentication' })
        }

        req.token = token
        req.user = user

        next()

    } catch (error) {
        console.log(error.message ? error.message : error)
        return res.status(401).send({ status: 401, success: false, message: 'Invalid Authentication' })

    }
}

module.exports = auth