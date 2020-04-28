const moment = require("moment");
const queries = require("../query");
const db = require("../database");
const {
    hashPassword,
    generateUserToken,
} = require("../validation")

async function createNewAdmin(body) {
    const d = new Date();
    const created_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
    const { email, password, first_name, last_name, state } = body;
    const is_admin = true;
    const hashedPassword = hashPassword(password)
    const queryObj = {
        text: queries.addNewUser,
        values: [email, hashedPassword, first_name, last_name, state, created_at, is_admin],
    };

    try {

        const { rowCount, rows } = await db.query(queryObj);
        const response = rows[0];
        const tokens = generateUserToken(response.id, response.first_name, response.last_name, response.email, response.is_admin, response.state);
        const data = {
            token: tokens,
            response
        }
        if (rowCount == 0) {
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Could not create user",
            });
        }
        if (rowCount > 0) {
            return Promise.resolve({
                status: "success",
                code: 201,
                message: "User created successfully",
                data
            });
        }
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error creating user",
        });
    }
}

async function changeOrderStatus(user_id, id, body) {
    const { status } = body
    const queryObj = {
        text: queries.updateOrderStatusById,
        values: [status, user_id, id]
    }
    try {
        const { rowCount } = await db.query(queryObj);
        if (rowCount === 0) {
            return Promise.reject({
                status: "error",
                code: 500,
                message: "order id could not b found"
            });
        }
        if (rowCount > 0) {
            return Promise.resolve({
                status: "success",
                code: 200,
                message: "Status Updated successfully",
            });
        }
    } catch (e) {
        console.log(e)
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error updating status"
        })
    }
}

async function changeOrderlocation(user_id, id, body) {
    const { location } = body
    const queryObj = {
        text: queries.updateOrderlocationById,
        values: [location, user_id, id]
    }
    try {
        const { rowCount } = await db.query(queryObj);
        if (rowCount === 0) {
            return Promise.reject({
                status: "error",
                code: 500,
                message: "order id could not b found"
            });
        }
        if (rowCount > 0) {
            return Promise.resolve({
                status: "success",
                code: 200,
                message: "location Updated successfully",
            });
        }
    } catch (e) {
        console.log(e)
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error updating location"
        })
    }
}
async function getAllParcel() {
    const queryObj = {
        text: queries.getAllUserOrder
    };
    try {
        const { rows } = await db.query(queryObj);
        return Promise.resolve({
            status: "success",
            code: 200,
            message: "Successfully fetch all Parcel",
            data: rows
        });
    } catch (e) {
        return Promise.reject({
            status: "Error",
            code: 500,
            message: "Error fetching all parcels"
        })
    }
}

async function isAdmin(id) {
    const queryObj = {
        text: queries.findUserById,
        values: [id],
    };
    try {
        const { rows } = await db.query(queryObj);
        if (rows[0].is_admin == false) {
            return Promise.resolve();
        }
        if (rows[0].is_admin == true) {
            return Promise.reject({
                status: "erorr",
                code: 409,
                message: "You are not an Authorized User",
            });
        }
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error finding user",
        });
    }
}

module.exports = {
    createNewAdmin,
    changeOrderStatus,
    changeOrderlocation,
    getAllParcel,
    isAdmin
}