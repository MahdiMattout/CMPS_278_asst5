const { MongoClient, ObjectId } = require("mongodb");
const connectionString = 'mongodb+srv://TodoAppMahdi:TodoAppAsst123@todoapp.kym6d.mongodb.net/TodoApp?retryWrites=true&w=majority'
const express = require('express');
const app = express();
app.set('view engine', 'ejs')


const getStatus = (task) => {
  return task.isComplete ? 'Complete' : 'In Progress';
}

const whenFirstLoaded = (collection, response) => {
  return collection.find().toArray().then(tasks => {
    response.render('index.ejs', {
      tasks: tasks,
      getStatus: getStatus
    });
  });
}

MongoClient.connect(connectionString)
  .then(client => {
    console.log('Connected Successfully!');
    const db = client.db();
    const tasksCollection = db.collection('tasks');
    app.get('/', (req, res) => {
      return whenFirstLoaded(tasksCollection, res);
    })
    app.get('/task', (req, res) => {
      return whenFirstLoaded(tasksCollection, res)
    })
    app.post('/task', (req, res) => {
      req.body['isComplete'] = false;
      tasksCollection.insertOne(req.body).then(() => whenFirstLoaded(tasksCollection, res))
    })

    app.delete('/task/:id', (req, res) => {
      const id = ObjectId(req.params.id);
      return tasksCollection.deleteOne({ _id: id })
        .then(result => {
          if (result.deletedCount === 0) {
            res.send('Task not found')
          } else {
            return whenFirstLoaded(tasksCollection, res);
          }
        })
    })
})

app.listen(8000);

