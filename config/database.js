const mongoose = require('mongoose');

const dbConnection = ()=> {
    mongoose.connect(process.env.DB_RUI).then((connect)=> {
        console.log(`Database Connection: ${connect.connection.host}`)
    })
    //     .catch((err)=> {
    //     console.log(`Database Error: ${err}`)
    //     process.exit(1)
    // })
}

module.exports = dbConnection;