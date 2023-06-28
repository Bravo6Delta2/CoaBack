import mongo from "../mongodb.js"
import {ObjectId} from "mongodb";


const buy = async (req,res) => {
    const userId =  res.locals.authenticated._id
    let db = await mongo.connectToDb()
    let user = await db.collection('user').findOne({_id: new ObjectId(userId)})

    if (user.money < req.body.numberOfStocks * req.body.price) {
        res.status = 200
        res.json({
            message: "Insufficient funds"
        })
        return
    }

    let jj = user.money - (req.body.numberOfStocks * req.body.price)
    await db.collection('user').updateOne({_id: new ObjectId(userId)}, {$set:{money: jj}})
    let bu = {
        numberOfStocks: req.body.numberOfStocks,
        price: req.body.price,
        symbol: req.body.symbol,
        name: req.body.description,
        userId: userId,
        buy: req.body.buy
    }

    await db.collection('stocks').insertOne(bu)

    res.status = 200
    res.json({
        message: "Successfully bought"
    })

}

const sell = async (req,res) => {
    const userId =  res.locals.authenticated._id
    let db = await mongo.connectToDb()

    let s = await db.collection('stocks').find({userId: userId}).toArray()

    let p = calculatePortfolio(s)

    if (req.body.numberOfStocks > p[req.body.symbol].totalQuantity) {
        res.status = 200
        res.json({
            message: "Insufficient stocks"
        })
        return
    }

    let bu = {
        numberOfStocks: req.body.numberOfStocks,
        price: req.body.price,
        symbol: req.body.symbol,
        name: req.body.description,
        userId: userId,
        buy: req.body.buy
    }

    await db.collection('stocks').insertOne(bu)
    let user = await db.collection('user').findOne({_id: new ObjectId(userId)})

    await db.collection('user').updateOne({_id: new ObjectId(userId)}, {$set:{money: user.money + (req.body.numberOfStocks * req.body.price)}})

    res.status = 200
    res.json({
        message: "Successfully sold"
    })
}

const portfolio = async (req, res) => {
    const userId =  res.locals.authenticated._id
    let db = await mongo.connectToDb()

    let s = await db.collection('stocks').find({userId: userId}).toArray()
    let user = await db.collection('user').findOne({_id: new ObjectId(userId)})

    let p = calculatePortfolio(s)

    let arr = [];

    for (let key in p) {
        if (p.hasOwnProperty(key)) {
            arr.push( {
                symbol: key,
                numberOfStocks: p[key].totalQuantity,
                totalValue: p[key].total,
                averagePrice: p[key].averagePrice
            });
        }
    }

    res.status = 200
    res.json({
        user: user,
        portfolio: arr
    })
}

function calculatePortfolio(stocks) {
    const portfolio = {};

    for (const stock of stocks) {
        const { symbol, buy, numberOfStocks, price } = stock;

        if (buy === true) {
            if (portfolio[symbol]) {
                // If the stock is already in the portfolio, update the quantity and average price
                const { totalQuantity, averagePrice, total } = portfolio[symbol];
                const newQuantity = totalQuantity + numberOfStocks;
                const newTotalValue = total + price * numberOfStocks;
                const newAveragePrice = newTotalValue / newQuantity;
                portfolio[symbol] = { totalQuantity: newQuantity, averagePrice: newAveragePrice, total: newTotalValue };
            } else {
                // If it's a new stock, add it to the portfolio
                portfolio[symbol] = { totalQuantity: numberOfStocks, averagePrice: price, total: numberOfStocks*price };
            }
        } else if (buy === false) {
            if (portfolio[symbol]) {
                // If the stock is in the portfolio, deduct the sold quantity
                const { totalQuantity, averagePrice, total } = portfolio[symbol];
                const newTotalValue = total - price * numberOfStocks;
                const newQuantity = totalQuantity - numberOfStocks;

                if (newQuantity > 0) {
                    // If there are remaining stocks after selling, update the portfolio
                    portfolio[symbol] = { totalQuantity: newQuantity, averagePrice, total: newTotalValue };
                } else {
                    // If all stocks are sold, remove the stock from the portfolio
                    delete portfolio[symbol];
                }
            }
        }
    }

    return portfolio;
}

function calculatePortfolio1(stocks) {
    const portfolio = [];

    for (const stock of stocks) {
        const { symbol, buy, numberOfStocks, price } = stock;

        const existingStock = portfolio.find((item) => item.symbol === symbol);

        if (buy === true) {
            if (existingStock) {
                // If the stock is already in the portfolio, update the quantity and average price
                existingStock.quantity += numberOfStocks;
                existingStock.totalValue += price * numberOfStocks;
                existingStock.averagePrice = existingStock.totalValue / existingStock.quantity;
            } else {
                // If it's a new stock, add it to the portfolio
                portfolio.push({ symbol, numberOfStocks, totalValue: price * numberOfStocks, averagePrice: price });
            }
        } else if (buy === false) {
            if (existingStock) {
                // If the stock is in the portfolio, deduct the sold quantity
                existingStock.quantity -= numberOfStocks;

                if (existingStock.quantity <= 0) {
                    // If all stocks are sold, remove the stock from the portfolio
                    portfolio.splice(portfolio.indexOf(existingStock), 1);
                }
            }
        }
    }

    return portfolio;
}


export default {
    buy,
    sell,
    portfolio
}
