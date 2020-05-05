const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt")
const {
    checkIfUserDoesNotExistBefore,
    createNewUser,
    checkIfUserExist
} = require("./controllers/userController")
const {
    createNewParcel,
    getSpecificUserParcel,
    getUserParcelByid,
    deleteUserParcelById,
    updateOrderDestination,
    checkStatus
} = require("./controllers/parcelController");
const {
    createNewAdmin,
    changeOrderStatus,
    changeOrderlocation,
    getAllParcel,
    isAdmin
} = require("./controllers/adminController")
const {
    schema
} = require("./validation")
const { verifySuperAdminToken, verifyUserToken, verifyToken } = require("./verifyToken")
const { 
    getEmails,
    statusMail,
    locationMail
   } = require("./emailController")


router.post(
    "/auth/signup",
    async (req, res, next) => {
        try {
            await schema.user.validateAsync(req.body)
        } catch (error) {
            return res.status(400).json({
                error: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        const { email } = req.body;
        try {
            await checkIfUserDoesNotExistBefore(email);
            const result = await createNewUser(req.body);
            delete result.data.response.password
            delete result.data.response.is_admin
            delete result.data.response.is_super_admin
            delete result.data.response.created_at
            return res.status(201).json(result);
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
);

router.post(
    "/auth/admin/signup", verifySuperAdminToken ,
    async (req, res, next) => {
        try {
            await schema.user.validateAsync(req.body)
        } catch (error) {
            return res.status(400).json({
                error: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        const { email } = req.body;
        try {
            await checkIfUserDoesNotExistBefore(email);
            const result = await createNewAdmin(req.body);
            delete result.data.response.password
            delete result.data.response.is_admin
            delete result.data.response.is_super_admin
            delete result.data.response.created_at
            delete result.data.response.updated_at
            return res.status(201).json(result);
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
);

router.post("/auth/login",
    async (req, res, next) => {
        try {
            await schema.login.validate(req.body)
        } catch (error) {
            return res.status(400).json({
                error: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        const { email, password } = req.body;
        try {
            const result = await checkIfUserExist(email)
            if (bcrypt.compareSync(password, result.response.password)) {
                delete result.response.password
                delete result.response.is_admin
                delete result.response.is_super_admin
                delete result.response.created_at;
                return res.status(200).json({
                    message: "Login successful",
                    result
                })
            } else {
                return res.status(400).json({
                    message: "invalid password"
                })
            }
        } catch (e) {
            return res.status(e.code).json(e)
        }

    }
);
router.post(
    "/parcel", verifyUserToken,
    async (req, res, next) => {
        const value = await schema.parcel.validate(req.body)
        if (value.error) {
            res.status(400).json({
                message: value.error.details[0].message.replace(
                    /[\"]/gi,
                    ""
                )
            })
        }
        next();
    },
    async (req, res) => {
        const user_id = res.locals.user.id
        try {
            await isAdmin(user_id);
            const result = await createNewParcel(user_id, req.body);
            return res.status(201).json(result);
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
)

router.get("/parcel/", verifyUserToken,
    async (req, res) => {
        const user_id = res.locals.user.id;
        try {
            const result = await getUserParcelByid(user_id);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);

router.get("/parcel/:id", verifyUserToken,
    async (req, res, next) => {
        try {
            const { id } = req.params
            await schema.idparam.id.validateAsync(id)
        } catch (error) {
            return res.status(400).json({
                error: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        const user_id = res.locals.user.id;
        const { id } = req.params;
        try {
            const result = await getSpecificUserParcel(user_id, id);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    });

router.put("/parcel/cancel/:id", verifyUserToken,
    async (req, res, next) => {
        try {
            const { id } = req.params
            await schema.idparam.id.validateAsync(id)
        } catch (error) {
            return res.status(400).json({
                error: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        const user_id = res.locals.user.id
        try {
            await checkStatus(user_id, id)
            const result = await deleteUserParcelById(user_id, id);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);

router.put("/parcel/destination/change/:id", verifyUserToken,
    async (req, res, next) => {
        try {
            const { id } = req.params
            await schema.idparam.id.validateAsync(id)
        } catch (error) {
            return res.status(400).json({
                error: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        const user_id = res.locals.user.id;
        const { id } = req.params;
        try {
            const result = await updateOrderDestination(user_id, id, req.body);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);

router.put("/parcel/status/change/:id",verifyToken,
    async (req, res, next) => {
        try {
            const { id } = req.params
            await schema.idparam.id.validateAsync(id)
            await schema.status.validateAsync(req.body)

        } catch (error) {
            return res.status(400).json({
                error: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        try {
            const result = await changeOrderStatus(id, req.body);
            const email = await getEmails(result.data.user_id)
            await  statusMail(email,result.data.status)
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);

router.put("/parcel/location/change/:id",verifyToken,
    async (req, res, next) => {
        try {
            const { id } = req.params
            await schema.idparam.id.validateAsync(id)
        } catch (error) {
            return res.status(400).json({
                error: error.details[0].message.replace(/[\"]/gi, "")
            })
        }
        next();
    },
    async (req, res) => {
        const { id } = req.params;
        try {
            const result = await changeOrderlocation(id, req.body);
            const email = await getEmails(result.data.user_id)
            await locationMail(email,result.data.location)
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);
router.get("/parcels/all", verifyToken,
    async (req, res) => {
        try {
            const result = await getAllParcel();
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);

module.exports = router;