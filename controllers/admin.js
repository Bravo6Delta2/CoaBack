import mongo from "../mongodb.js"
import yup from "yup"
import jwt from "jsonwebtoken"
const secretKey = "AAAAAAAAA"

const loginAdmin = async (req,res) => {
    let form = yup.object({
        password: yup.string().required()
    })

    let valid = form.isValid(req.body)
    if (!valid) {
        res.json({
            message: "Invalid Admin Credentials"
        })
        res.code = 200
        return
    }
    let db= await mongo.connectToDb()

    let data = await db.collection('admin').find({password: req.body.password}).toArray()

    if (data.length === 0) {
        res.json({
            message: "Invalid Admin Credentials"
        })
        res.code = 200
        return
    }

    let token = jwt.sign({id: data._id}, secretKey, {expiresIn: "4h"})

    res.json({
        message: "Logged in",
        token: token
    })
    res.code = 200
}

const getEarnedById = async (req,res) => {
    let id = req.params.id

    let db = await mongo.connectToDb()

    let data = await db.collection('rent').find({
        carId: id ,
        end: {
            $gte: new Date(`${new Date().getFullYear()}-01-01`),
            $lte: new Date(`${new Date().getFullYear()}-12-31`)
        }
    }).toArray()

    let rez = [0,0,0,0,0,0,0,0,0,0,0,0]
    for (const el of data) {
        let index = el.end.getMonth()
        rez[index] += el.price
    }

    res.json({
        message: "GG",
        data: rez
    })
    res.code = 200
}

const getCarz = async  (req,res) => {

    let db = await mongo.connectToDb()

    let data = await db.collection('car').find().project({manufacturer:1, model:1, plateNumber:1, year:1}).toArray()

    res.json({
        message: 'GG',
        data: data
    })
    res.code = 200
}

export default {
    loginAdmin,
    getEarnedById,
    getCarz
}