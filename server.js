if(process.env.NODE_ENV !== "production"){
  require('dotenv').config(); 
}
const express = require("express");
const app = require("./Backend/app");
const connectDB = require('./Backend/config/databaseConnect');
const PORT = process.env.PORT || 3000;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running at ${process.env.BACKEND_URL}`);
});
