import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from 'dotenv'
import connectDB from "./db.js"
import userRoute from './routes/user.route.js'
import companyRoute from './routes/company.route.js'
dotenv.config({})


const app = express()



// middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

const corseOptions= {
    origin:'http//localhost:5173',
    credentials:true
}

app.use(cors(corseOptions))



// api's
app.use("/api/v1/user", userRoute)
app.use("/api/v1/company",companyRoute)

const port = process.env.PORT || 3000
connectDB().then(()=>{
    app.listen(port ,()=>{
        console.log(`APP IS LISTENING ON PORT ${port}`)
    })
}).catch((error)=>{
    console.log(error)
})