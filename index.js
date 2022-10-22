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
let productsCollection, ordersCollection
const mongoConnect = async () => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('Database connected')
    productsCollection = await client.db("freshGroceryStore").collection("products");
    ordersCollection = await client.db("freshGroceryStore").collection("orders");

  } catch (e) {
    console.error('mongo connection error', e);
  }
}


// perform actions on the collection object

//   Add Products 

app.post('/addProduct', (req, res) => {
  const products = req.body
  console.log('product add data', products);
  productsCollection.insertOne(products)
    .then(result => {
      console.log('product add response from mongoDB', result)
      res.status(200).json({
        success: true,
        message: 'Product added successfully',
        data: result.ops
      })
    }).catch(error => {
      console.log('product add error', error.message);
      res.status(500).json({
        success: false,
        message: 'There was a server side error',
        error: error
      })
    })
})


// Load Products 

app.get('/products', (req, res) => {
  productsCollection.find({})
    .toArray((err, documents) => {
      if (err) {
        console.log('get products error', err)
        res.status(500).json({
          success: false,
          message: 'There was a server side error',
          error: err
        })
      } else {
        console.log('get products data', documents)
        res.send(documents)
      }
    })
})

// Load a single Product 

app.get('/product/:id', (req, res) => {
  console.log('get product by id params', req.params);
  productsCollection.find({ _id: ObjectId(req.params.id) })
    .toArray((err, document) => {
      if (err) {
        console.log('product get by id error', err)
        res.status(500).json({
          success: false,
          message: 'There was a server side error',
          error: err
        })
      } else {
        console.log('get product by id data', document)
        res.send(document);
      }

    })
})

// Load Product By Keys 

app.post('/productsByKeys', (req, res) => {
  const productKeys = req.body;
  console.log('get product by key body', productKeys)
  productsCollection.find({ key: { $in: productKeys } })
    .toArray((err, documents) => {
      if (err) {
        console.log('get product by key error', err)
        res.status(500).json({
          success: false,
          message: 'There was a server side error',
          error: err
        })
      } else {
        console.log('get product by key data', documents)
        res.send(documents);
      }

    })
})

// Place Order 

app.post('/addOrder', (req, res) => {
  const order = req.body
  console.log('add order body', order);
  ordersCollection.insertOne(order)
    .then(result => {
      console.log('add order data', result)
      res.send(true)
    }).catch(error => {
      console.log('add order error', error)
      console.log(error.message);
    })
})

// Show Oders 

app.get('/orders', (req, res) => {
  console.log('get orders body', req.query.email)
  ordersCollection.find({ email: req.query.email })
    .toArray((err, documents) => {
      if (err) {
        console.log('get all orders error', err)
        res.status(500).json({
          success: false,
          message: 'There was a server side error',
          error: err
        })
      } else {
        res.send(documents);
      }
    })
})

// Delete Product

app.delete('/delete/:id', (req, res) => {
  console.log('delete product params', req.params.id)
  productsCollection.deleteOne({ _id: ObjectId(req.params.id) })
    .then(result => {
      res.send(result.deletedCount > 0);
      console.log('delete product result', result);
    })
    .catch(error => {
      console.log('delete product by id error', err)
      res.status(500).json({
        success: false,
        message: 'There was a server side error',
        error: err
      })
      console.log('delete product by id error', error);
    })
})


mongoConnect().catch(console.error);

// Home Page 
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port, (err) => {
  if (err) {
    console.log('error in running the server', err)
  } else {
    console.log('app is listening to the port', port)
  }
})