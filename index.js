require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 7000;
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://polyglothub-54ecc.web.app",
      "https://polyglothub-54ecc.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// middelware for verify token
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ messeage: "Unauthorized access" });
  }
  // verify token
  jwt.verify(token, process.env.Access_Token_Secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ messeage: "Unauthorized access" });
    }
    req.trueUser = decoded;
    // console.log(decoded);

    next();
  });
};
// cookie option
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jds8f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const tutorialsColloction = client
      .db("LanguagePortal")
      .collection("alltutorials");
    const bookedColloction = client
      .db("LanguagePortal")
      .collection("allbookings");
    const languageColloction = client
      .db("LanguagePortal")
      .collection("categorys");
    //  generate jwt token
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const jwttoken = jwt.sign(user, process.env.Access_Token_Secret, {
        expiresIn: "5h",
      });
      res.cookie("token", jwttoken, cookieOptions).send({ success: true });
    });
    // jwt token delete
    app.post("/jwt-logout", async (req, res) => {
      res.clearCookie("token", cookieOptions).send({ success: true });
    });
    // create tutorials
    app.post("/add-tutorials", async (req, res) => {
      const tutorials = req.body;
      const result = await tutorialsColloction.insertOne(tutorials);
      res.send(result);
    });
    // get all tutuors
    app.get("/get-all-tutors", async (req, res) => {
      const search = req.query.search;
      const language = req.query.language;
      // console.log(search, language);

      let query = {};
      if (language) query.language = language;
      if (search) {
        query.language = {
          $regex: search, // Use the search term in the regex
          $options: "i", // Case-insensitive search
        };
      }
      // const tutors = req.body;
      const result = await tutorialsColloction.find(query).toArray();
      res.send(result);
    });
    // get single tutorilas by id
    app.get("/single-tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tutorialsColloction.findOne(query);
      res.send(result);
    });
    // update single id
    app.patch("/update/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      const tutorData = req.body;
      const updateData = {
        $set: tutorData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await tutorialsColloction.updateOne(
        query,
        updateData,
        options
      );
      res.send(result);
    });
    // delete tutuorials by id
    app.delete("/tutorials-delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tutorialsColloction.deleteOne(query);
      res.send(result);
    });
    // getting tutorials by email
    app.get("/myTutorials", async (req, res) => {
      const email = req.query.email;
      // if (req.trueUser?.email !== req.query?.email) {
      //   return res.status(403).send({ messeage: "forbidden" });
      // }
      const query = { email: email };
      const result = await tutorialsColloction.find(query).toArray();
      res.send(result);
    });
    // adding booking
    app.post("/add-booking", async (req, res) => {
      const booking = req.body;
      const result = await bookedColloction.insertOne(booking);
      res.send(result);
    });
    // get the bookinglist by id
    app.get("/my-bookings", async (req, res) => {
      const email = req.query.email;
      const query = { loggedInEmail: email };
      const result = await bookedColloction.find(query).toArray();
      res.send(result);
    });
    // get category
    app.get("/get-language", async (req, res) => {
      const language = req.body;
      const result = await languageColloction.find(language).toArray();
      res.send(result);
    });
    // update reveiew by id
    app.patch("/update/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const querytwo = { tutorialsId: id };
      const updateReveiw = {
        $inc: { review: 1 },
      };
      const result = await tutorialsColloction.updateOne(query, updateReveiw);
      const resultone = await bookedColloction.updateOne(
        querytwo,
        updateReveiw
      );
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("yahoo my server is working");
});
app.listen(port, () => {
  console.log(`the port is running on ${port}`);
});
