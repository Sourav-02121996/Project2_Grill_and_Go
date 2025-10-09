import express from "express";
console.log("Initializing backend....");
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> {
    console.log("Server is running on local host 3000")
});