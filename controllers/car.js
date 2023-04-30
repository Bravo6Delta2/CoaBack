import mongo from "../mongodb.js"
import yup from "yup"
import { ObjectId } from 'mongodb'
import mongodb from "../mongodb.js";

const carForm = yup.object({
    plateNumber: yup.string().length(7).required(),
    model: yup.string().required(),
    manufacturer: yup.string().required(),
    year: yup.number().integer().positive(),
    color: yup.string().required(),
    price: yup.number().positive().required(),
    type: yup.string().required()
})

const getCarById = async (req,res) => {
    const id = req.params.id
    const db = await  mongo.connectToDb()

    let data = await db.collection('car').findOne({_id: new ObjectId(id )})

    if (data == null) {
        res.json({
            message: "Car doesnt exist"
        })
        res.code = 404
        return
    }

    res.json({
        message: "GG",
        data: data
    })
    res.code = 200

}

const addCar = async (req,res) => {

    if (!await carForm.isValid(req.body)){
        res.json({
            message: "Form is not valid"
        })
        res.code = 200
        return
    }

    const db = await  mongo.connectToDb()
    await db.collection('car').insertOne(req.body)

    res.json({
        message: "Car added successfully"
    })
    res.cod = 200
}

const updateCar = async (req,res) => {
    let id = req.params.id
    if (!await carForm.isValid(req.body)){
        res.json({
            message: "Form is not valid"
        })
        res.code = 200
        return
    }

    const db = await  mongo.connectToDb()
    let update = { $set: req.body }
    let updateRes = await db.collection('car').updateOne({_id: new ObjectId(id)}, update)

    if (updateRes.modifiedCount === 0) {
        res.json({
            message: "Probably this is id doesnt exist"
        })
        res.code = 200
        return
    }

    res.json({
        message: "Successful update"
    })
    res.code = 200
}

const getAllCars = async (req,res) => {
    let pageNumber = req.params.page
    let size = 16
    let offset =pageNumber > 0 ? ( ( pageNumber - 1 ) * size ) : 0

    let db = await mongodb.connectToDb()

    let data = await db.collection('car').find().skip(offset).limit(size).toArray()

    res.json({
        message: "GG",
        data: data
    })

    res.code = 200
}

export default {
    getCarById,
    addCar,
    updateCar,
    getAllCars
}