const express = require("express");
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
require('dotenv').config();

const initWebRoutes = require('./routes/web');

let app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let server = http.createServer(app);

app.use("/", initWebRoutes());

let port = process.env.PORT || 1212;

server.listen(port, ()=>{
    console.log(`app is running at port: http://localhost:${port}`);
})