var express = require('express');
var router = express.Router();
var bcrypt=require("bcryptjs")
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
var usermodule=require("../modules/user");
var passwordcategorymodule=require("../modules/password_category");
var passdetailsmodule=require("../modules/passdetails");
var multer=require("multer");


router.use(express.static(__dirname+"./public/"));


//multer is a package used to upload files storage is temporary 
//storage so that to hold files untill uploaded

var storage=multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    //making distinct filename for everytime a file is uploaded by attaching the particular time 
    cb(null,file.originalname+"_"+Date.now()+path.extname(file.originalname))
  }
});

var upload=multer({
  storage:storage
}).single('profilepic');




//to clear cache to stop back button
router.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

//webtoken localstorage requirement
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//middleware function to check tokens before opening dashboard page
function checkloginuser(req,res,next){
  var userToken=localStorage.getItem("userToken");
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect("/");
  }
  next();
}


//middleware function to check if email and username already exists when new user is registring
var emailflag=false;
var usernameflag=false;
function checkemail(req,res,next){
  var email=req.body.email;
  var emailexist=usermodule.findOne({email:email});
  emailexist.exec((err,data)=>{
    if(err) throw error;
    if(data){
      emailflag=true;
      res.render('signup', { title: 'Enter Your Details' ,fail:" An account with this email is already registered.",success:""});
    }
    next();
  });
}
function checkusername(req,res,next){
  var username=req.body.uname;
  var userexist=usermodule.findOne({username:username});
  userexist.exec((err,data)=>{
    if(err) throw error;
    if(data){
      usernameflag=true;
      res.render('signup', { title: 'Enter Your Details' ,fail:" This username is already taken.",success:""});
    }
    next();
  });
}


/* GET all category page. */
router.get('/',checkloginuser ,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var getpasscat=passwordcategorymodule.find();
    var user=usermodule.findOne({username:loginuser});
    var image;
    user.exec((err,data)=>{
      if(err) throw error;
      image=data.profileimage;
    });
    getpasscat.exec((err,data)=>{
      if(err) throw error;
      else{
        res.render('viewallcategory', { title: 'Categories',data:image,loginuser:loginuser,records:data,success:'',user:loginuser });
      }
    });
  });
  
  /* GET all category page when delete button pressed. */
  router.get('/delete/:id',checkloginuser ,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var id=req.params.id;
    var user=usermodule.findOne({username:loginuser});
    var image;
    user.exec((err,data)=>{
      if(err) throw error;
      image=data.profileimage;
    });
    var passdelete=passwordcategorymodule.findByIdAndDelete(id);
    passdelete.exec((err,data)=>{
      if(err) throw error;
      else{
        var getpasscat=passwordcategorymodule.find();
        getpasscat.exec((err,data)=>{
          if(err) throw error;
          else{
            res.redirect('/view-all-category');
            //res.render('viewallcategory', { title: 'Categories',loginuser:loginuser,records:data,success:'Deleted Successfully!' });
          }
        });
      }
    });
  });
  
  /* GET all category page when edit button pressed. */
  var id;
  router.get('/edit/:id',checkloginuser ,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    id=req.params.id;
    var passedit=passwordcategorymodule.findById(id);
    var user=usermodule.findOne({username:loginuser});
    var image;
    user.exec((err,data)=>{
      if(err) throw error;
      image=data.profileimage;
    });
    passedit.exec((err,data)=>{
      if(err) throw error;
      else{
        res.render('editpasscat', { title: 'Categories',fail:'',data:image,loginuser:loginuser,errors:'',success:'',records:data });
      }
    });
  });
  
  /* POST all category page when edit button pressed. */
  router.post('/edit',checkloginuser ,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var newname=req.body.cname;
    var user=usermodule.findOne({username:loginuser});
    var image;
    user.exec((err,data)=>{
      if(err) throw error;
      image=data.profileimage;
    });
    if(newname==""){
      var showedit=passwordcategorymodule.findById(id);
      showedit.exec((err,data1)=>{
        if(err) throw error;
        else{
          res.render('editpasscat', { title: 'Categories',data:image,loginuser:loginuser,errors:'',fail:'Please add a valid category name!',success:'',records:data1});
        }
      });
     
    }
    var passedit=passwordcategorymodule.findByIdAndUpdate(id,{passname:newname});
    passedit.exec((err,data)=>{
      if(err) throw error;
      else{
        var showedit=passwordcategorymodule.findById(id);
        showedit.exec((err,data1)=>{
          if(err) throw error;
          else{
            res.render('editpasscat', { title: 'Categories',fail:'',data:image,loginuser:loginuser,errors:'',success:'Category Name Updated Successfully!',records:data1});
          }
        });
      }
    });
  });
  
  
  

  module.exports = router;