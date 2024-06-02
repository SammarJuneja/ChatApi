const express = require("express");
const app = express();
const { port } = require('./config.js');
const connectDB = require('./Database/index.js');
connectDB();

app.use(express.json());

const Routes = require('./Routes');

app.use('/api/v2', Routes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(port, () => {
  console.log(`Server is up and running on http://localhost:${port}/`)
})