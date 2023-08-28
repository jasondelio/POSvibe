const mongoose = require('mongoose');

const connectMongoDB = async() => {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('MongoDB Connection Successfull');
    } catch (err) {
        console.error('Failed to connect to DB', err);
    }
};

module.exports = connectMongoDB;