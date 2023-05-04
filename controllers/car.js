import mongo from "../mongodb.js"
import yup from "yup"
import { ObjectId } from 'mongodb'

function isDateRangeAvailable(unavailableDateRanges, startDate, endDate) {
    for (let i = 0; i < unavailableDateRanges.length; i++) {
        const unavailableStartDate = unavailableDateRanges[i].start
        const unavailableEndDate = unavailableDateRanges[i].end

        if ((startDate >= unavailableStartDate && startDate <= unavailableEndDate) ||
            (endDate >= unavailableStartDate && endDate <= unavailableEndDate) ||
            (startDate <= unavailableStartDate && endDate >= unavailableEndDate)) {
            return false;
        }
    }
    return true;
}

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
    let data1 = await db.collection('rent').find({carId: id}).project({_id:0, start: 1, end:1}).toArray()

    if (data == null) {
        res.json({
            message: "Car doesnt exist"
        })
        res.code = 404
        return
    }

    res.json({
        message: "GG",
        data: data,
        dates: data1
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
    let offset = pageNumber > 0 ? ( ( pageNumber - 1 ) * size ) : 0

    let db = await mongo.connectToDb()

    let ff = {}
    if (req.query.filter) {
        let json = JSON.parse(req.query.filter)

        if (json.manufacturer.length !== 0) {
            ff.manufacturer = json.manufacturer
        }
        if (json.startPrice !== 0 && json.endPrice !== 0) {
           ff.price = { $gt: json.startPrice, $lt: json.endPrice }
        }
        if (json.startPrice !== 0 && json.endPrice === 0) {
            ff.price = { $gt: json.startPrice}
        }
    }


    let data = await db.collection('car').find(ff).skip(offset).limit(size).toArray()
    let next = await db.collection('car').find(ff).skip(offset+size).limit(size).toArray()

    if (req.query.start && req.query.end) {
        let ss =  new Date(req.query.start)
        let ee = new Date(req.query.end)
        let dd = []
        for (const el of data) {

            console.log(el._id.toHexString())

            let data1 = await db.collection('rent').find({carId: el._id.toHexString()}).toArray()

            if (isDateRangeAvailable(data1, ss , ee)) {
                dd.push(el._id)
            }
        }
        console.log(dd)
        data = data.filter(item => dd.includes(item._id))
    }

    let hasNext = false
    if (next.length > 0) {
        hasNext = true
    }

    res.json({
        message: "GG",
        data: data,
        hasNext: hasNext
    })

    res.code = 200
}

export default {
    getCarById,
    addCar,
    updateCar,
    getAllCars
}