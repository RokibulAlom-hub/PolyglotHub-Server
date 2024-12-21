require('dotenv').config()
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 7000
const app = express();

app.use(cors());
app.use(express.json());



app.get('/', (req,res) => {
    res.send("yahoo my server is working")
})
app.listen(port,() => {
    console.log(`the port is running on ${port}`)
    
})