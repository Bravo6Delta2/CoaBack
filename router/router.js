import express from 'express';
import user from '../controllers/user.js';
import admin from "../controllers/admin.js";
import car from '../controllers/car.js'
import rent from "../controllers/rent.js";
import jwt from "jsonwebtoken";


const secretKey = "AAAAAAAAA"
const router = express.Router();
const authAdmin = (req, res, next) => {
    const token = req.headers.token
    try {
        let data = jwt.verify(token, secretKey)
        if (data.password.password !== "aleksandar") {
            throw "Error"
        }
    }
    catch (error) {
        res.json({
            message: "Invalid Admin Credentials"
        })
        res.code = 200
        return
    }
    next()
}

const authUser = async (req, res, next) => {
    const token = req.headers.token
    try {
        res.locals.authenticated = jwt.verify(token, secretKey)
        next()
    }
    catch (error) {
        console.log(error)
        res.json({
            message: "Invalid User Credentials"
        })
        res.code = 200
    }
}


router.route('/register')
    .post(user.registerUser)

router.route('/login')
    .post(user.loginUser)

router.route('/verifyEmail/:token')
    .get(user.verifyEmail)

router.route('/admin')
    .post(admin.loginAdmin)

router.route('/car/:id')
    .get(car.getCarById)
    .put(authAdmin,car.updateCar)

router.route('/car')
    .post(authAdmin,car.addCar)

router.route('/cars/:page')
    .get(car.getAllCars)

router.route('/rent')
    .post(authUser,rent.rent)

router.route('/admin/earned/:id')
    .get(admin.getEarnedById)

router.route('/rent')
    .get(authUser,rent.rentsByUserId)




export default router