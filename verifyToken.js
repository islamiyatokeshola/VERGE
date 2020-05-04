const jwt = require("jsonwebtoken");
const dotenv = require("dotenv")

dotenv.config()

const verifyToken = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.status(403).send({
            status: "forbidden",
            code: 403,
            message: "Token not Provided"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            first_name: decoded.first_name,
            last_name: decoded.last_name,
            is_admin: decoded.is_admin,
            is_super_admin: decoded.is_super_admin,
            state: decoded.state
        }
        if (decoded.is_admin == false) {
            return res.status(400).send({
                status: "Error",
                code: 400,
                message: "User not Allowed"
            })
        }
        res.locals.user = req.user
        next();
    } catch (error) {
        console.log(error)
        res.status(400).send({
            status: "Error",
            code: 400,
            message: "Authorization Failed"
        })
    }
}

const verifySuperAdminToken = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.status(403).send({
            status: "forbidden",
            code: 403,
            message: "Token not Provided"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            first_name: decoded.first_name,
            last_name: decoded.last_name,
            is_admin: decoded.is_admin,
            is_super_admin: decoded.is_super_admin,
            state: decoded.state
        }
        if (decoded.is_super_admin == false) {
            return res.status(400).send({
                status: "Error",
                code: 400,
                message: "User not Allowed"
            })
        }
        res.locals.user = req.user
        next();
    } catch (error) {
        console.log(error)
        res.status(400).send({
            status: "Error",
            code: 400,
            message: "Authorization Failed"
        })
    }
}

const verifyUserToken = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.status(403).send({
            status: "forbidden",
            code: 403,
            message: "Token not Provided"
        })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            first_name: decoded.first_name,
            last_name: decoded.last_name,
            is_admin: decoded.is_admin,
            is_super_admin: decoded.is_super_admin,
            state: decoded.state
        }
        if (decoded.is_admin !== false) {
            return res.status(400).send({
                status: "Error",
                code: 400,
                message: "User not Allowed"
            })
        }
        res.locals.user = req.user
        next();
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            status: "Error",
            code: 400,
            message: "Authorization Failed"
        })
    }
}

module.exports = {
    verifyToken,
    verifySuperAdminToken,
    verifyUserToken
};