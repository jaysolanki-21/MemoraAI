const mongoose = require('mongoose');

const connectDb = () =>{
    mongoose.connect(process.env.MONGODB_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        tls: true,
        tlsAllowInvalidCertificates: false
    })
}

module.exports = connectDb;
