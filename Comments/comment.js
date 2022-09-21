const comment = require('../models/Comment')
const cloudinary = require("../middleware/cloudinary");
const comment = require("../models/Comment");
module.exports = {
    getProfile: async (req,res)=>{
        try{
            const comment = await comment.find({user:req.user.id})
            res.render('profile.ejs', {comments: comment, user: req.user})
        }catch(err){
            console.log(err)
        }
    },
    getFeed: async (req,res)=>{
        try{
            const comment = await Comment.find()
                .sort({ createdAt: 'desc' })
                .lean()
            res.render('feed.ejs', {comments: comment})
        }catch(err){
            console.log(err)
        }
    },
    getComment: async (req,res)=>{
        try{
            const comment = await Comment.findById(req.params.id)
            res.render('comment.ejs', {comments: comment, user: req.user})
        }catch(err){
            console.log(err)
        }
    },
    createComment: async (req, res)=>{
        try{
            await Comment.create({
                title: req.body.title, 
                image: '/uploads/' + req.file.filename, 
                caption: req.body.caption,
                likes: 0,
                user: req.user.id
            })
            console.log('Comment has been added!')
            res.redirect('/profile')
        }catch(err){
            console.log(err)
        }
    },
    likeComment: async (req, res)=>{
        try{
            await Comment.findOneAndUpdate({_id:req.params.id},
                {
                    $inc : {'likes' : 1}
                })
            console.log('Likes +1')
            res.redirect(`/comment/${req.params.id}`)
        }catch(err){
            console.log(err)
        }
    },
    deleteComment: async (req, res)=>{
        try{
            console.log(req.params)
            await Comment.findOneAndDelete({_id:req.params.id})
            console.log('Deleted Comment')
            res.redirect('/profile')
        }catch(err){
            res.redirect('/profile')
  getProfile: async (req, res) => {
    try {
      const comment = await Comment.find({ user: req.user.id });
      res.render("profile.ejs", { comments: comments, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const comments = await Comment.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { comments: comments });
    } catch (err) {
      console.log(err);
    }
  },
  getComment: async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      res.render("comment.ejs", { comment: comment, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createComment: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      console.log(result);
      await Comment.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Comment has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likeComment: async (req, res) => {
    try {
      await Comment.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/comment/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deleteComment: async (req, res) => {
    try {
      console.log(req.params);
      await Comment.findOneAndDelete({ _id: req.params.id });
      console.log("Deleted Comment");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
}    
  },
};
 11  
middleware/cloudinary.js
@@ -0,0 +1,11 @@
const cloudinary = require("cloudinary").v2;

require("dotenv").config({ path: "./config/.env" });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports = cloudinary;
 23  
middleware/multer.js
@@ -1,11 +1,14 @@
const multer = require("multer");
module.exports = {
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "/src/post-images");
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname);
    },
  }),
};
const path = require("path");

module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});
  4  
models/Comment.js
@@ -9,6 +9,10 @@ const CommentSchema = new mongoose.Schema({
    type: String,
    require: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  caption: {
    type: String,
    required: true,
 79  
package-lock.json
"license": "MIT",
  "dependencies": {
    "bcrypt": "^5.0.1",
    "cloudinary": "^1.25.1",
    "connect-mongo": "^3.2.0",
    "dotenv": "^8.2.0",
    "ejs": "^3.1.6",
 4  
routes/comment.js
@@ -1,8 +1,6 @@
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });
const { storage } = require("../middleware/multer");
const upload = require("../middleware/multer");
const commentsController = require("../controllers/comment");
const { ensureAuth, ensureGuest } = require("../middleware/auth");
