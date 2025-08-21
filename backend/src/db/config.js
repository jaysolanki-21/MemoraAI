const mongoose = require('mongoose');

const connectDb = () =>{
    mongoose.connect(process.env.MONGODB_URI)
}

module.exports = connectDb;
