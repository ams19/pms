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


/* GET add view all password page. */
router.get('/',checkloginuser, function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var user=usermodule.findOne({username:loginuser});
    var image;
    user.exec((err,data)=>{
      if(err) throw error;
      image=data.profileimage;
    });
    //console.log(image);
    var passdetails=passdetailsmodule.find();
    passdetails.exec((err,data)=>{
      if(err) throw error;
      else{
        res.render('viewallpasswords', { title: 'Password List' ,loginuser:loginuser,success:'',data:image,records:data,user:loginuser});
      }
    });
  });
  
  /* GET all password page when edit button pressed. */
  var id1;
  router.get('/edit/:id',checkloginuser ,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    id1=req.params.id;
    var passedit=passdetailsmodule.findById(id1);
    var addpass=passwordcategorymodule.find();
    var user=usermodule.findOne({username:loginuser});
    var image;
    user.exec((err,data)=>{
      if(err) throw error;
      image=data.profileimage;
    });
    passedit.exec((err,data)=>{
      if(err) throw error;
      else{
        addpass.exec((err,data1)=>{
        if(err) throw error;
        else{
          res.render('editpassdetails', { title: 'Edit Password',loginuser:loginuser,errors:'',success:'',data:image,records:data,records1:data1});
        }
        });
      }
    });
  });
  
  /* POST all password page when edit button pressed. */
  router.post('/edit/',checkloginuser ,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var newname=req.body.passcat;
    var newdetails=req.body.passdetails;
    var passedit=passdetailsmodule.findByIdAndUpdate(id1,{passname:newname,passdetails:newdetails});
    var addpass=passwordcategorymodule.find();
    var passupdated=passdetailsmodule.findById(id1);
    var user=usermodule.findOne({username:loginuser});
    var image;
    user.exec((err,data)=>{
      if(err) throw error;
      image=data.profileimage;
    });
    addpass.exec((err,data1)=>{
      if(err) throw error;
      else{
        passupdated.exec((err,data2)=>{
          if(err) throw error;
          else{
            if(newname=='choosepasswordcategory'){
              res.render('editpassdetails', { title: 'Edit Password',loginuser:loginuser,data:image,errors:'Choose a Valid Password Category!',success:'',records:data2,records1:data1 });
              }
            else{
              passedit.exec((err,data)=>{
                if(err) throw error;
                else{
                  passupdated.exec((err,data2)=>{
                    if(err) throw error;
                    else{
                      res.render('editpassdetails', { title: 'Edit Password',data:image,loginuser:loginuser,errors:'',success:'Updated Successfully!',records:data2,records1:data1 });
                    }
                  });
                }
                  });
            }
          }
        });
      }
    });
  });
  
  /* GET all password page when delete button pressed. */
  var id1;
  router.get('/delete/:id',checkloginuser ,function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    id1=req.params.id;
    var passdelete=passdetailsmodule.findByIdAndDelete(id1);
    passdelete.exec((err,data)=>{
      if(err) throw error;
      else{
          var passdetails=passdetailsmodule.find();
          passdetails.exec((err,data1)=>{
            if(err) throw error;
            else{
              //res.render('viewallpasswords', { title: 'Password List',loginuser:loginuser,success:'Deleted Successfully!',records:data1});
              res.redirect('/view-all-passwords');
            }
          });
        }
    });
  });
  
  

  module.exports = router;