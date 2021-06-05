const express = require('express')
const app = express()
const port = 5000
const cors = require('cors');
const ObjectID = require('mongodb').ObjectID;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://todo-mern:todo-mern@cluster0.17hrv.mongodb.net/todo-mern?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const todosCollection = client.db("todo-mern").collection("todos");

    app.get('/todos', (req, res) => {
        todosCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.post('/addTodo', (req, res) => {
        const todo = req.body;
        todosCollection.insertOne(todo)
        .then(result => {
            res.send({count: result.insertedCount})
        }) 
    });

    app.delete('/delete/:id', (req, res) => {
        const id = req.params.id;
        todosCollection.deleteOne({_id: ObjectID(id)})
        .then(result => {
            res.send({count: result.deletedCount});
        })
    });

    // app.patch('/update/:id', (req, res) => {
    //     const id = req.params.id;
    //     const todo = req.body;
    //     todosCollection.updateOne({_id: ObjectID(id)}, {
    //         $set: {title: todo.title, description: todo.description}
    //     })
    //     .then(result => {
    //         res.send({count: result.modifiedCount});
    //     })
    // })

    app.patch('/update/:id', (req, res) => {
        const id = req.params.id;
        const todo = req.body;
        todosCollection.updateMany({title: 'title1'}, {
            $set: {title: todo.title, description: todo.description}
        })
        .then(result => {
            res.send({count: result.modifiedCount});
        })
    })

});

app.listen(port);