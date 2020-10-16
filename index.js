const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const fd = require('fs-extra')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zvck.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 3001

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('icons'));
app.use(fileUpload());





const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const orderCollection = client.db("creativeAgency").collection("orderCollection");
  const serviceCollection = client.db("creativeAgency").collection("serviceCollection");
  const reviewCollection = client.db("creativeAgency").collection("reviewCollection");
  const adminCollection = client.db("creativeAgency").collection("adminCollection");

  app.post("/addOrder",(req,res)=>{
    const newOrder = req.body;
    orderCollection.insertOne(newOrder)
    .then(result => {
      res.send(result.insertedCount>0);
    })
  })


  app.get('/customer',(req,res)=>{
    orderCollection.find({customerEmail:req.query.email})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })


  app.get('/allOrders',(req,res)=>{
    orderCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })


  app.patch('/update/:id',(req,res) =>{
    orderCollection.updateOne({_id:ObjectId(req.params.id)},
    {
      $set: {'status' : req.body.orderStatus}

    })
    .then(result => {
      console.log(result)
      res.send(result.modifiedCount>0);
    })
  })


  app.post("/addService",(req,res)=>{
    const file = req.files.file;
    const name = req.body.name;
    const description =req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');
      var image = {
        contentType: file.mimetype,
        size : file.size,
        img: Buffer.from(encImg, 'base64')
      };
      serviceCollection.insertOne({name,description,image})
      .then(result => {
        res.send(result.insertedCount>0);
      })
  })

  app.get('/services',(req,res)=>{
    serviceCollection.find({})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })

  app.post("/addReview",(req,res)=>{
    const newReview = req.body;
    reviewCollection.insertOne(newReview)
    .then(result => {
      res.send(result.insertedCount>0);
    })
  })

  app.get('/customerReview',(req,res)=>{
    reviewCollection.find({}).limit(6)
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })


  app.post("/addAdmin",(req,res)=>{
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin)
    .then(result => {
      res.send(result.insertedCount>0);
    })
  })


  app.post('/isAdmin',(req,res)=>{
    const email = req.body.email
    adminCollection.find({email:email})
    .toArray((err,admin)=>{
      res.send(admin.length>0);
    })
  })

});
app.get('/', (req, res) => {
    res.send('Hello World!');
    console.log("db connected")
  })
  
app.listen(process.env.PORT || port);
