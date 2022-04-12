const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
const connectionString = 'mongodb+srv://TodoAppMahdi:TodoAppAsst123@todoapp.kym6d.mongodb.net/TodoApp?retryWrites=true&w=majority'
const express = require('express');
const bodyparser = require("body-parser");
const app = express();
app.set('view engine', 'ejs')
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('now listening to port 8000');
})

const getStatus = (task) => {
  return task.isComplete ? 'Complete' : 'In Progress';
}

const whenFirstLoaded = (collection, response) => {
  return collection.find().toArray()
    .then(tasks => {
    response.render('index.ejs', {
      tasks: tasks,
      getStatus: getStatus
    });
    })
    .catch(e => console.error(e));
}

// const client =  new MongoClient(connectionString, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     serverApi: ServerApiVersion.v1,
//   });
// client.connect((err) => {
//     if (err) {
//       console.log("Error: " + err.errmsg);
//     } else {
//       console.log("Connection to database working.");
//     }
//     client.close();
// });
  
// app.get("/", async (req, res) => {
//     client.connect( async (err) => {
//         const collection = client.db().collection('tasks');
//         const tasks = await collection.find().toArray();// get all json objects in the collection
//         console.log("All documents=:"+tasks)
//         client.close();
//         return res.render("index", { tasks:tasks, getStatus: getStatus });// render the ejs file named 'index' and pass the object users
//       });
    
//   });

// app.get("/task", async (req, res) => {
//     client.connect( async (err) => {
//       res.redirect('/')
//       });
//   });

// // Create a user based on client's input and store it in the database
// app.post('/task',async (req,res)=>{
//     // Create the user JSON object that will be stored in the database
//     const task ={
//         Description:req.body.Description||1,
//         isComplete: false
//     }
//     client.connect( async (err) => {
//         const result = await client.db().collection('tasks').insertOne(task);
//         console.log(`Task inserted with id = ${result.insertedId}`);
//         client.close();
//         res.redirect("/");// this will call the app.get('/') function
//       });

// });

// app.delete('/task/:id', async (req, res) =>  {
//   client.connect(async (err) => {
//     console.log(req.params)
//     const id = ObjectId(req.params.id.trim())
//     console.log(id)
//     await client.db().collection('tasks').deleteOne({ _id: id }).catch(e => console.error(e))
//     client.close();
//   })
// })

// app.put('/task/toggle/:id', async (req, res) => {
//  client.connect( async (err) => {
//     console.log(req.params.id)
//     const id = ObjectId(req.params.id.trim())
//     console.log(id)
//     const task = async () => await client.db().collection('tasks').findOne({ _id: id }).then( await client.db().collection('tasks').updateOne({ _id: id }, {$set: {isComplete: !task.isComplete}}))
//     client.close()
//   })
 
// })


MongoClient.connect(connectionString)
  .then(client => {
    console.log('Connected Successfully!');
    const db = client.db();
    const tasksCollection = db.collection('tasks');
    app.get('/', async (req, res) => {
      return whenFirstLoaded(tasksCollection, res);
    })
    app.get('/task', async (req, res) => {
      whenFirstLoaded(tasksCollection, res);
    })
    app.post('/task', async (req, res) => {
      req.body['isComplete'] = false;
      tasksCollection.insertOne(req.body).then(() => whenFirstLoaded(tasksCollection, res));
    })
    app.delete(`/task/:id`, async (req, res) => {
      console.log(`req: ${req}`)
      const id = ObjectId(req.params.id.trim());
      return await tasksCollection.deleteOne({ _id: id })
        .then(result => {
          if (result.deletedCount === 0) {
            res.send('Task not found')
          } else {
            whenFirstLoaded(tasksCollection, res)
          }
        }).catch(e => console.error(e))
    })
    app.put('/task/toggle/:id', async (req, res) => {
      const id = new ObjectId(req.params.id.trim());
      return tasksCollection.find({ _id: id }).toArray().then(async (tasks) => {
        if (tasks.length > 0) {
          const task = tasks[0];
          return tasksCollection.updateOne({ _id: id }, { '$set': { isComplete: !task.isComplete } })
            .then((result) => {
              return whenFirstLoaded(tasksCollection, res);
            })
        }
      })
    })
  })
