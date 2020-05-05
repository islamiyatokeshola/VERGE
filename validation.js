const bcrypt = require("bcrypt");
const joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv")

dotenv.config();

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const hashPassword = password => bcrypt.hashSync(password, salt);

const generateUserToken = (id, first_name, last_name, email, is_admin, is_super_admin, state) => {
    const key = process.env.SECRET_KEY;
    const token = jwt.sign({ id, email, first_name, last_name, is_admin, is_super_admin, state }, key, { expiresIn: '1h' });
    return token;
}

const schema = {
    user: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        first_name: joi.string().max(100).required(),
        last_name: joi.string().max(100).required(),
        state: joi.string().max(30).required()
    }),
    login: joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
    }),
    parcel: joi.object({
        price: joi.number(),
        weight: joi.string().required(),
        location: joi.string().required(),
        destination: joi.string().required(),
        sender_name: joi.string().required(),
        sender_note: joi.string()
    }),
    idparam: {
        id: joi.number().required()
    },
    idparams: {
        user_id: joi.number().required()
    },
    status: joi.object({
        status: joi.string().valid('pending', 'shipped', 'delivered')
    })
}


module.exports = {
    hashPassword,
    generateUserToken,
    schema
};