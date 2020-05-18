var express = require('express');
var router = express.Router();
var bcrypt=require("bcryptjs")
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
var usermodule=require("../modules/user");
var passwordcategorymodule=require("../modules/password_category");
var passdetailsmodule=require("../modules/passdetails");
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

/* GET dashboard page. */
router.get('/', function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var userexist=usermodule.findOne({username:loginuser});
    userexist.exec((err,data)=>{
      if(err) throw error;
      var userpass=passdetailsmodule.find();
      userpass.exec((err,passdata)=>{
        var usercat=passwordcategorymodule.find();
        usercat.exec((err,catdata)=>{
            res.render('sidebar', { title: 'dashboard',fail:'',success:'',nopass:passdata,nopasscat:catdata,data:data,loginuser:loginuser});
        });
       });
    });
  });


 /* GET update dashboard page. */
//  var uflag=false;
//  router.post('/:id', function(req, res, next) {
//     var loginuser=localStorage.getItem("loginuser");
//     var username=req.body.uname;
//     var email=req.body.email;
//     console.log(loginuser)
//     console.log(req.body);
//     console.log(username+' '+email);
    
//     if(loginuser!=username){
//         var alreadyuser=usermodule.findOne({username:username});
//         alreadyuser.exec((err,data)=>{
//             if(data){
//                 uflag=true;
//             }
//         });
//     }

//     var userexist=usermodule.findOne({username:loginuser});
//     userexist.exec((err,data)=>{
//       if(err) throw error;
//       var userpass=passdetailsmodule.find();
//       userpass.exec((err,passdata)=>{
//         var usercat=passwordcategorymodule.find();
//         usercat.exec((err,catdata)=>{
//             if(uflag){
//                 res.render('sidebar', { title: 'dashboard',fail:'This username is already taken!',success:'',nopass:passdata,nopasscat:catdata,data:data,loginuser:loginuser});
//             }
//             else{
//                 res.render('sidebar', { title: 'dashboard',fail:'',success:'Details Updated Successfully!',nopass:passdata,nopasscat:catdata,data:data,loginuser:loginuser});
//             }
//             uflag=false;
//             console.log("here here")
//             //res.render('sidebar', { title: 'dashboard',nopass:passdata,nopasscat:catdata,data:data,loginuser:loginuser});
//         });
//        });
//     });
//   });
  

  
  

  module.exports = router;