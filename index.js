const express = require("express");
const bodyParser = require("body-parser");
const db = require("./database");
const parcel = require("./route");

let app = express();
let port = 3000;
// db.query('SELECT NOW()',(res, err)=>{
//     console.log(err,res)
//     db.end()
//     });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port, () => {
    console.log("Application Listening on Port 3000")
});

app.get('/', (req, res) => {
    return res.status(200).json({
        message: "welcome to my deliveryApi"
    });
});
app.use("/api/v1", parcel);

module.exports = app