import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        // {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        //     useCreateIndex: true,
        //     useFindAndModify: false
        // }

        console.log('Mongo connected successfully: ');
    } catch (error) {
        console.error('MongoDB connection failed: ' + error.message);
        process.exit(1);
    }
}

export default connectDB;