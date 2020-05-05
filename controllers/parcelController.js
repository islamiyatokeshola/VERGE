const moment = require("moment");
const queries = require("../query");
const db = require("../database");



async function createNewParcel(user_id, body) {
    const d = new Date();
    const created_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
    const status = "pending"

    const { price, weight, location, destination, sender_name, sender_note } = body;
    const queryObj = {
        text: queries.addNewParcel,
        values: [user_id, price, weight, location, destination, sender_name, sender_note, status, created_at, created_at],
    };

    try {
        const { rowCount } = await db.query(queryObj);
        if (rowCount == 0) {
            return Promise.reject({
                status: "error",
                code: 500,
                message: "Could not place order",
            });
        }
        if (rowCount > 0) {
            return Promise.resolve({
                status: "success",
                code: 201,
                message: "Order created successfully",
            });
        }
    } catch (e) {
        console.log(e);
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error creating order",
        });
    }
}

async function getSpecificUserParcel(user_id, id){
    const queryObj ={
        text: queries.getSpecificUser,
        values:[user_id, id]
    };
    try{
        const {rows, rowCount} = await db.query(queryObj);
        if(rowCount > 0){
           return Promise.resolve({
               status:"success",
               code:200,
               message:"this is your placed order",
               data: rows
           })
        }
        if(rowCount === 0){
            return Promise.reject({
                status:"error",
                code:400,
                message:"could not get sender",
            })
        }
    }catch(e){
        return Promise.reject({
            status:"Error",
            code: 500,
            message: "Error finding sender"
        });
    }
};

async function getUserParcelByid(user_id){
    const queryObj = {
        text: queries.getUserOrderById,
        values:[user_id]
    }
    try{
        const {rows, rowCount } =await db.query(queryObj);
        if(rowCount == 0 ){
            return Promise.reject({
                status: "error",
                code:500,
                message:"Order not find"
            });
        }
        if(rowCount > 0){
            return Promise.resolve({
                status: "success",
                code:200,
                message:"this is your order",
                data : rows
            });
        }
    }catch(e){
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error finding sender"
        })
    }
}

async function deleteUserParcelById(user_id, id){
    const queryObj = {
        text: queries.deleteUserOrderById,
        values:[user_id, id]
    }
    try{
        const { rowCount } = await db.query(queryObj);
        if(rowCount === 0 ){
            return Promise.reject({
                status: "error",
                code:500,
                message:"Order could not be found"
            });
        }
        if(rowCount > 0){
            return Promise.resolve({
                status: "success",
                code:200,
                message:"Order Cancelled successfully",
            });
        }
    }catch(e){
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error Cancelling Order"
        })
    }
}

async function updateOrderDestination(user_id, id, body){
    const { destination } = body;
    const d = new Date();
    const updated_at = moment(d).format("YYYY-MM-DD HH:mm:ss");
    const queryObj = {
        text: queries.updateOrderDestinationById,
        values:[ destination, user_id, updated_at, id]
    }
    try{
        const { rows, rowCount } = await db.query(queryObj);
        if(rowCount === 0 ){
            return Promise.reject({
                status: "error",
                code:500,
                message:"order id could not be found"
            });
        }
        if(rowCount > 0 && rows[0].status == "pending"){
            return Promise.resolve({
                status: "success",
                code:200,
                message:"destination Updated successfully",
            });
        }
        if(rowCount > 0){
            return Promise.reject({
                status: "error",
                code:200,
                message:"destination cannot be Updated",
            });
        }
    }catch(e){
        console.log(e)
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error updating destination"
        })
    }
};

async function checkStatus( user_id, id){
    const queryObj = {
        text: queries.getStatus,
        values: [user_id, id],
    };
    try {
        const { rows } = await db.query(queryObj);
        if ( rows[0].status == "pending") {
            return Promise.resolve();
        }
        if ( rows[0].status !== "pending") {
            return Promise.reject({
                status: "error",
                code: 409,
                message: "Order has been shipped"
            });
        }
    } catch (e) {
        return Promise.reject({
            status: "error",
            code: 500,
            message: "Error finding Order",
        });
    }
}

module.exports = {
    createNewParcel,
    getSpecificUserParcel,
    getUserParcelByid,
    deleteUserParcelById,
    updateOrderDestination,
    checkStatus
}