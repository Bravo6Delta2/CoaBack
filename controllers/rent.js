import yup from "yup"
import {ObjectId} from 'mongodb'
import mongodb from "../mongodb.js";

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

function getNumberOfDays(startDate, endDate) {
    const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round(Math.abs((start - end) / oneDay));
}

const rent = async (req, res) => {
    const userId =  res.locals.authenticated._id

    console.log(userId)

    console.log(new Date())
    const form = yup.object({
        carId: yup.string().required(),
        startDate: yup.date().required(),
        endDate: yup.date().required()
    })
    let valid = await form.isValid(req.body)
    if (!valid) {
        res.json({
            message: "Form is not valid"
        })
        res.code = 200
    }

    const db = await mongodb.connectToDb()
    let data = await db.collection('rent').find({carId: req.body.carId}).toArray()

    if (isDateRangeAvailable(data,new Date(req.body.startDate), new Date(req.body.endDate))) {
        let car = await db.collection('car').findOne({_id: new ObjectId(req.body.carId)})
        let price = getNumberOfDays(req.body.startDate,req.body.endDate) * car.price

         db.collection('rent').insertOne({
            userId: userId,
            carId: req.body.carId,
            start: new Date(req.body.startDate),
            end: new Date(req.body.endDate),
            price: price
        })

        res.json({
            message: "Successful rent"
        })
        res.code = 200
        return
    }

    res.json({
        message: "Date range is unavailable"
    })
    res.code = 200
}



export default {
    rent
}
