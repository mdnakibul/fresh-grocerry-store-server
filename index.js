const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId
const port = 5000

const app = express();
app.use(bodyParser.json());
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mymds.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db("freshGroceryStore").collection("products");
  const ordersCollection = client.db("freshGroceryStore").collection("orders");
  // perform actions on the collection object

  //   Add Products 

  app.post('/addProduct', (req, res) => {
    const products = req.body
    console.log('req');
    res.send('some')
    productsCollection.insertOne(products)
      .then(result => {
        console.log(result.insertedCount)
      }).catch(error => {
        console.log(error.message);
      })
  })
  console.log('Database Connected');


  // Load Products 

app.get('/products',(req,res)=>{
  productsCollection.find({})
  .toArray((err,documents)=>{
    res.send(documents)
  })
})

// Load a single Product 

app.get('/product/:id',(req,res)=>{
  console.log(req.params);
  productsCollection.find({_id : ObjectId(req.params.id)})
  .toArray((err,document)=>{
    res.send(document);
  })
})

// Load Product By Keys 

app.post('/productsByKeys', (req, res) => {
  const productKeys = req.body;
  productsCollection.find({key: { $in: productKeys} })
  .toArray( (err, documents) => {
      res.send(documents);
  })
})

// Place Order 

app.post('/addOrder', (req, res) => {
  const order = req.body
  console.log('req');
  ordersCollection.insertOne(order)
    .then(result => {
      res.send(true)
    }).catch(error => {
      console.log(error.message);
    })
})

// Show Oders 

app.get('/orders',(req,res)=>{
  ordersCollection.find({email : req.query.email})
  .toArray((err,documents)=>{
    res.send(documents);

  //   let totalPrice = 0;
  //   for (let i = 0; i < documents.length; i++) {
  //     const element = documents[i];
  //     totalPrice = Number(element.price) + totalPrice;
  // }
  // console.log(totalPrice);
  })
})

});



// Home Page 
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port)