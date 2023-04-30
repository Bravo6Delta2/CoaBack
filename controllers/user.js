import mongo from "../mongodb.js"
import yup from "yup"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer";

const secretKey = "AAAAAAAAA"
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'eryn.dibbert11@ethereal.email',
        pass: 'y3aCgYBS4ucPWTky5T'
    }
});

const formRegister  = yup.object({
    email: yup.string().email().required(),
    password: yup.string().length(64).required(),
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    phoneNumber: yup.string().required()
})

const registerUser = async (req,res) => {
    let valid = await formRegister.isValid(req.body)

    if (!valid) {
        res.json({
            message: "Form is not valid"
        })
        res.code = 200
        return
    }

    let db = await mongo.connectToDb()
    try {
        let l = await  db.collection('user').find({email:req.body.email}).toArray()
        if (l.length > 0 ) {
            res.json({
                message: "email used"
            })
            res.code = 200
            return
        }

        let token = jwt.sign(req.body,secretKey,{expiresIn: "4h"})

        let link = "http://localhost:3001/verifyEmail/" + token

        let info = await transporter.sendMail({
            from: "eryn.dibbert11@ethereal.email",
            to: req.body.email,
            subject: "Email Verification",
            text: link,
            html: ""
        })
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res.json({
            message:"Verification email sent"
        })
        res.code = 200
        return
    }
    catch (e) {
        console.log(e)
        res.json({
            message:"cant add user"
        })
        res.code = 200
    }

    res.json({
        message:"xd"
    })
    res.code = 200
}

const loginUser = async (req,res) => {

    let form = yup.object({
        email: yup.string().email().required(),
        password: yup.string().length(64).required()
    })

    let valid = await form.isValid(req.body)

    if (!valid) {
        res.json({
            message: "Form is not valid"
        })
        res.code = 200
        return
    }

    let db = await mongo.connectToDb()

    let user = await db.collection('user').find({email: req.body.email, password: req.body.password}).toArray()

    if (user.length > 0) {
        let token = jwt.sign({_id: user[0]._id, name: user[0].firstName},secretKey, {expiresIn: "4h"})
        res.json({
            message:"Logged in",
            token: token
        })
        res.code = 200
        return
    }

    res.json({
        message:"False Credentials"
    })
    res.code = 200
}

const verifyEmail = async (req,res) => {
    const token = req.params.token

    try {
        let data = jwt.verify(token,secretKey)
        let valid = await formRegister.isValid(data)

        if (!valid) {
            res.json({
                message: "xd"
            })
            res.code = 200
            return
        }

        let db = await mongo.connectToDb()
        await db.collection('user').insertOne(data)

        res.json({
            message: "User Added"
        })
        res.code = 200
    }
    catch (e) {
        res.json({
            message: "Link expired"
        })
    }
}
export default
{   registerUser,
    loginUser,
    verifyEmail
}