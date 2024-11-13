import mongoose from 'mongoose'

const connectDB  = async (req,res)=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log("MONGODB CONNECTION SUCCESSFULL!")
    } catch (error) {
        console.log("MONGODB CONNECTION FAILED" ,error)       
    }
}


export default connectDB