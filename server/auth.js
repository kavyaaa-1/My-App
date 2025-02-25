import express, { json } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import client from "./redisClient.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router(); //mini app

router.post("/login", async(req, res) => {
  const {username, password} = req.body;

  try{
    const userData = await client.get(`user:${username}`);
    if(!userData) return res.status(401).json({message:"User not found"});
    const user = JSON.parse(userData);
    if(!bcrypt.compareSync(password, user.password)){
      return res.status(401).json({message: "Invalid password"});
    }
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {expiresIn: "15d"});
    res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.json({ message: "Login successful", username });

  }catch(err){
    res.status(500).json({ error: "Error in login", details: err });
  }
});

router.get("/check-auth", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ loggedIn: false });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ loggedIn: false });
      res.json({ loggedIn: true, username: user.username });
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

export default router;