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


//* GET add new password page. */
router.get('/', checkloginuser,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var addpass=passwordcategorymodule.find();
    var user=usermodule.findOne({username:loginuser});
    var image;
    user.exec((err,data)=>{
      if(err) throw error;
      image=data.profileimage;
    });
    addpass.exec((err,data)=>{
      if(err) throw error;
      else{
        res.render('addnewpassword', { title: 'New Password',loginuser:loginuser,errors:'',data:image,records:data ,success:''});
      }
    });
  });
  
  /* POST add new password page. */
  router.post('/', checkloginuser,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    console.log(loginuser);
    if(req.body.passcat&&req.body.passdetails){
      var getpasscat=req.body.passcat;
      var getpassdetails=req.body.passdetails;
      var user=usermodule.findOne({username:loginuser});
      var image;
      user.exec((err,data)=>{
        if(err) throw error;
        image=data.profileimage;  
      });
      var addpass=new passdetailsmodule({
        username:loginuser,
        passname:getpasscat,
        passdetails:getpassdetails
      });
      addpass.save((err,data)=>{
        if(err) throw error;
        else{
          var addpass=passwordcategorymodule.find();
          addpass.exec((err,data1)=>{
            if(err) throw error;
            else{
              if(getpasscat=='choosepasswordcategory'){
                res.render('addnewpassword', { title: 'New Password',loginuser:loginuser,data:image,records:data1,success:'',errors:'Choose a Valid Password Category!' });
              }
              else{
                res.render('addnewpassword', { title: 'New Password',loginuser:loginuser,data:image,records:data1,success:'Password Details Added Successfully',errors:'' });
              }
            
            }
          });
            //res.render('addnewpassword', { title: 'New Password',loginuser:loginuser,records:data ,success:'Password Details Added Successfully'}); 
          }
        });
      }
      else
      {
        var addpass=passwordcategorymodule.find();
          addpass.exec((err,data1)=>{
            if(err) throw error;
               res.render('addnewpassword', { title: 'New Password',loginuser:loginuser,
               data:image,records:data1,success:'',errors:'Please Fill the details!' });
          });
      }
    
  });
  
  
  

  module.exports = router;