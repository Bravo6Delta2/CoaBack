import { MongoClient } from "mongodb";

let cachedDb = null

async function connectToDb() {

    if (cachedDb != null)
        return  cachedDb

    const connectionString = "mongodb://127.0.0.1:27017/";
    const opts = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    const client = new MongoClient(connectionString, opts);
    let conn = await client.connect();
    cachedDb =  conn.db("RentCar")

    return cachedDb
}

export default {
    connectToDb
}