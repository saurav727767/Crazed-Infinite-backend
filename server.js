const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const Video = require("./models/video");
const Short = require("./models/Short");
const Poster = require("./models/Poster");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/crazed")
.then(()=>console.log("MongoDB Connected"));

// User model
const User = mongoose.model("User", {
  email: { type: String, unique: true },
  password: String
});

const ADMIN_EMAIL = "admin@crazedinfinite.com";

// REGISTER
app.post("/register", async (req,res)=>{
  const {email,password} = req.body;
  const old = await User.findOne({email});
  if(old) return res.json({error:"Email already registered"});
  const hash = await bcrypt.hash(password,10);
  await User.create({email,password:hash});
  res.json({message:"Registered successfully"});
});

// LOGIN
app.post("/login", async (req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user) return res.json({error:"User not found"});
  const ok = await bcrypt.compare(password,user.password);
  if(!ok) return res.json({error:"Wrong password"});
  const token = jwt.sign({email},"SECRET123");
  res.json({token});
});

// ADMIN CHECK
function isAdmin(req,res,next){
  try{
    const decoded = jwt.verify(req.headers.authorization,"SECRET123");
    if(decoded.email !== ADMIN_EMAIL)
      return res.status(403).send("Not admin");
    next();
  }catch{
    res.status(401).send("Invalid token");
  }
}

// VIDEOS
app.post("/admin/video",isAdmin, async(req,res)=>{
  await Video.create(req.body);
  res.json({message:"Video added"});
});
app.get("/videos", async(req,res)=>{
  res.json(await Video.find());
});

// SHORTS
app.post("/admin/short",isAdmin, async(req,res)=>{
  await Short.create(req.body);
  res.json({message:"Short added"});
});
app.get("/shorts", async(req,res)=>{
  res.json(await Short.find());
});

// POSTERS
app.post("/admin/poster",isAdmin, async(req,res)=>{
  await Poster.create(req.body);
  res.json({message:"Poster added"});
});
app.get("/posters", async(req,res)=>{
  res.json(await Poster.find());
});

// TEST
app.get("/test",(req,res)=>res.send("Backend working"));

app.listen(5000,()=>console.log("Server running on http://localhost:5000"));


app.get("/videos/search/:key", async (req, res) => {
  const key = req.params.key;
  const data = await Video.find({
    title: { $regex: key, $options: "i" }
  });
  res.json(data);
});
app.put("/video/view/:id", async (req, res) => {
  await Video.findByIdAndUpdate(req.params.id, {
    $inc: { views: 1 }
  });
  res.json({ message: "View counted" });
});
app.put("/video/like/:id", async (req, res) => {
  await Video.findByIdAndUpdate(req.params.id, {
    $inc: { likes: 1 }
  });
  res.json({ message: "Liked" });
});
app.put("/short/like/:id", async (req, res) => {
  await Short.findByIdAndUpdate(req.params.id, {
    $inc: { likes: 1 }
  });
  res.json({ message: "Liked" });
});
