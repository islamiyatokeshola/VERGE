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
    getUserParcelBysenderName,
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
const { verifyToken, verifyUserToken } = require("./verifyToken")


router.post(
    "/auth/signup",
    async (req, res, next) => {
        try {
            const value = await schema.user.validate(req.body)
            if (value.error) {
                return res.json({
                    message: value.error.details[0].message
                })
            }
        } catch (e) {
            console.log(e)
        }
        next();
    },
    async (req, res) => {
        const { email } = req.body;
        try {
            await checkIfUserDoesNotExistBefore(email);
            const result = await createNewUser(req.body);
            return res.status(201).json(result);
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
);

router.post(
    "/auth/admin/signup",
    async (req, res, next) => {
        try {
            const value = await schema.user.validate(req.body)
            if (value.error) {
                return res.json({
                    message: value.error.details[0].message
                })
            }
        } catch (e) {
            console.log(e)
        }
        next();
    },
    async (req, res) => {
        const { email } = req.body;
        try {
            await checkIfUserDoesNotExistBefore(email);
            const result = await createNewAdmin(req.body);
            return res.status(201).json(result);
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
);

router.post("/auth/login",
    async (req, res, next) => {
        const value = await schema.login.validate(req.body)
        if (value.error) {
            res.json({
                message: value.error.details[0].message
            })
        }
        next();
    },
    async (req, res) => {
        const { email, password } = req.body;
        try {
            const result = await checkIfUserExist(email)
            console.log(result)
            if (bcrypt.compareSync(password, result.response.password)) {
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
            return res.status(e.code).json(e.message)
        }

    }
);

router.post(
    "/parcel/:user_id",
    async (req, res, next) => {
        const value = await schema.parcel.validate(req.body)
        if (value.error) {
            res.json({
                message: value.error.details[0].message
            })
        }
        next();
    },
    async (req, res) => {
        const { user_id } = req.params;
        try {
            await isAdmin(user_id);
            const result = await createNewParcel(user_id, req.body);
            return res.status(201).json(result);
        } catch (e) {
            return res.status(e.code).json(e);
        }
    }
);

router.get("/parcel", async (req, res) => {
    const { user_id, id } = req.query;
    try {
        const result = await getUserParcelBysenderName(user_id, id);
        return res.status(200).json(result)
    } catch (e) {
        return res.status(e.code).json(e)
    }
});

router.get("/parcel/:user_id",
    async (req, res, next) => {
        const { user_id } = req.params
        const value = await schema.idparams.user_id.validate(user_id)
        if (value.error) {
            res.json({
                message: value.error.details[0].message
            })
        }
        next();
    },
    async (req, res) => {
        const { user_id } = req.params;
        try {
            const result = await getUserParcelByid(user_id);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);

router.delete("/parcel/cancel/:user_id/:id",
    async (req, res, next) => {
        const { user_id } = req.params
        const value = await schema.idparams.user_id.validate(user_id)
        if (value.error) {
            res.json({
                message: value.error.details[0].message
            })
        }
        next();
    },
    async (req, res) => {
        const { user_id, id } = req.params;
        try {
            await checkStatus(user_id, id)
            const result = await deleteUserParcelById(user_id, id);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);
router.put("/parcel/destination/change/:user_id/:id",
    async (req, res, next) => {
        const { user_id } = req.params
        const value = await schema.idparams.user_id.validate(user_id)
        if (value.error) {
            res.json({
                message: value.error.details[0].message
            })
        }
        next();
    },
    async (req, res) => {
        const { user_id, id } = req.params;
        try {
            const result = await updateOrderDestination(user_id, id, req.body);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);

router.put("/parcel/status/change/:user_id/:id", verifyToken,
    async (req, res, next) => {
        const { user_id } = req.params
        const value = await schema.idparams.user_id.validate(user_id)
        if (value.error) {
            res.json({
                message: value.error.details[0].message
            })
        }
        next();
    },
    async (req, res) => {
        const { user_id, id } = req.params;
        try {
            const result = await changeOrderStatus(user_id, id, req.body);
            return res.status(200).json(result)
        } catch (e) {
            return res.status(e.code).json(e)
        }
    }
);

router.put("/parcel/location/change/:user_id/:id", verifyToken,
    async (req, res, next) => {
        const { user_id } = req.params
        const value = await schema.idparams.user_id.validate(user_id)
        if (value.error) {
            res.json({
                message: value.error.details[0].message
            })
        }
        next();
    },
    async (req, res) => {
        const { user_id, id } = req.params;
        try {
            const result = await changeOrderlocation(user_id, id, req.body);
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