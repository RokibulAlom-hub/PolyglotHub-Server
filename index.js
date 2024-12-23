require('dotenv').config()
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 7000
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jds8f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const tutorialsColloction =  client.db('LanguagePortal').collection('alltutorials');

    // create tutorials
    app.post('/add-tutorials',async(req,res) => {
      const tutorials = req.body;
      const result = await tutorialsColloction.insertOne(tutorials)
      res.send(result)
    })
    // get all tutuors
    app.get('/get-all-tutors',async(req,res) => {
      const tutors = req.body;
      const result = await tutorialsColloction.find(tutors).toArray();
      res.send(result);
    })
    // getting tutorials by email
    app.get('/myTutorials',async(req,res)=>{
      const email = req.query.email;
      const query = {email: email};
      const result =await tutorialsColloction.find(query).toArray();
      res.send(result)
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) => {
    res.send("yahoo my server is working")
})
app.listen(port,() => {
    console.log(`the port is running on ${port}`)
    
})