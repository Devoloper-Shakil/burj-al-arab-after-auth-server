const express = require('express')
var bodyParser = require('body-parser');
const admin = require('firebase-admin');
require('dotenv').config()
var cors = require('cors')
const app = express()
// app.use(express.urlencoded({ extended: false }))
// app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
// app.use(bodyParser.urlencoded({ extended: false }))




var serviceAccount = require("./config/athu-login-firebase-adminsdk-7kh85-4b56dd2f99.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xcxqb.mongodb.net/burjAlArob?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const collection = client.db("burjAlArob").collection("booking");

  app.post("/addbooking", (req, res) => {
    const newBooking = req.body;
    collection.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 1);
        console.log(result);
      })
  })

  app.get('/booking', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      // console.log(idToken);

      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenUrl = decodedToken.email;
          console.log({ tokenUrl });
          if (tokenUrl === req.query.email) {
            collection.find({ email: req.query.email })
              .toArray((err, document) => {
                res.send(document)
              })
          } else {
            res.status(401).send('un-Authorizitone');
          }

        })
        .catch((error) => {
          res.status(401).send('un-Authorizitone');
        });

    } else {
      res.status(401).send('un-Authorizitone');
    }


    // console.log( req.headers.authorization);
    // collection.find({email:req.query.email})
    // .toArray((err,document)=>{
    //    res.send(document)
  })
})
// console.log("db collection succsess")
//   client.close();
// });


app.listen(5000)
