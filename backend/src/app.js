const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// const routes = require("./routes/auth.routes");


// app.use("/api/v1", routes);


const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const discussionRoutes =require("./routes/discussion.routes")

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", postRoutes);
app.use("/api/v1/discussions",discussionRoutes);

app.get("/",(req,res) =>{
    res.send(`<h1>backend of devhub</h1>`)
})


module.exports = app;