const express = require('express')
const app = express()
const port = 5000
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;
const admin = require('firebase-admin');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

var serviceAccount = require("./todo-mern18-firebase-adminsdk-x5z5m-a276ccbc8c.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://todo-mern:todo-mern@cluster0.17hrv.mongodb.net/todo-mern?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const todosCollection = client.db("todo-mern").collection("todos");

    app.get('/todos/:email', (req, res) => {
        const email = req.params.email;
        const bearer = req.headers.bearer;
        if (bearer && bearer.startsWith('Bearer ')) {
            const tokenFromUi = bearer.split(' ')[1];
            admin
                .auth()
                .verifyIdToken(tokenFromUi)
                .then((decodedToken) => {
                    const emailFromFirebase = decodedToken.email;
                    if (email == emailFromFirebase) {
                        todosCollection.find({ email: email }).toArray((err, documents) => {
                            res.send(documents);
                        })
                    }
                    else {
                        res.send({msg: 'you are not authorized'});
                    }
                })
                .catch((error) => {
                    // Handle error
                });
        }
        else {
            res.send({msg: 'you are not authorized'});
        }

    });

    app.post('/addTodo', (req, res) => {
        const todo = req.body;
        todosCollection.insertOne(todo)
            .then(result => {
                res.send({ count: result.insertedCount })
            })
    });

    app.delete('/delete/:id', (req, res) => {
        const id = req.params.id;
        todosCollection.deleteOne({ _id: ObjectID(id) })
            .then(result => {
                res.send({ count: result.deletedCount });
            })
    });

    app.patch('/update/:id', (req, res) => {
        const id = req.params.id;
        const todo = req.body;
        todosCollection.updateOne({ _id: ObjectID(id) }, {
            $set: { title: todo.title, description: todo.description, img: todo.img }
        })
            .then(result => {
                res.send({ count: result.modifiedCount });
            })
    })

});

app.listen(port);