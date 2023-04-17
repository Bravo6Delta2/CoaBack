import mongo from "../mongodb.js"
import yup from "yup"

const loginAdmin = async (req,res) => {
    let form = yup.object({
        password: yup.string().required()
    })

    let valid = await form.isValid(req.body)

    if (!valid) {
        res.json({
            message: "Invalid Admin Credentials"
        })
        res.code = 200
        return
    }

    res.json({
        message: "Logged in"
    })
    res.code = 200
}

export default {
    loginAdmin
}