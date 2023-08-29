import express from "express";
import http from "http";
import logger from "morgan";
import cors from "cors"
import bodyParser from 'body-parser';
const app = express();
import router from "./router/router.js"

app.use(bodyParser.json());
app.use(logger("short"));
app.use(cors());
app.use('/',router)

app.get('/images/:image',async (req,res)=>{
    res.sendFile("C:\\Users\\User\\WebstormProjects\\CoaBack\\images\\"+req.params.image)
    res.code = 200
})



http.createServer(app).listen(3001);
