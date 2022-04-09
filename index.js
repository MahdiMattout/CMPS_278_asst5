const { MongoClient } = require("mongodb");
const connectionString = 'mongodb+srv://TodoAppMahdi:TodoAppAsst123@todoapp.kym6d.mongodb.net/TodoApp?retryWrites=true&w=majority'
const express = require('express');
const fs = require('fs');
const app = express();

const whenFirstLoaded = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });
  fs.readFile('./index.html', null, (err, data) => {
    if (err) {
      response.writeHead(404);
      response.write('File not found');
    } else {
      response.write(data);
    }
    response.end();
  })
}

const main = async () => {
  const client = new MongoClient(connectionString);
  try {
    await client.connect();
    // await listDatabases(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

// const listDatabases = async client => {
//   const list = await client.db().admin().listDatabases();
//   list.databases.forEach(db => {
//     console.log(` - ${db.name}`)
//   })
// }

main().catch(console.error)

app.listen(8000);

