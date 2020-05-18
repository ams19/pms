var express = require('express');
var router = express.Router();
var bcrypt=require("bcryptjs")
var jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
var usermodule=require("../modules/user");
var passwordcategorymodule=require("../modules/password_category");
var passdetailsmodule=require("../modules/passdetails");
var multer=require("multer");


//to clear cache to stop back button
router.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});



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


/* GET add new category page. */
router.get('/',checkloginuser, function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var image;
    var user=usermodule.findOne({username:loginuser});
      user.exec((err,data)=>{
        if(err) throw error;
        // console.log(data.profileimage)
        image=data.profileimage; 
        // console.log(image); 
        res.render('addnewcategory', { title: 'New Category',data:image,loginuser:loginuser,errors:'',success:'' });
      });
   
  });
  
  /* POST add new category page. */
  router.post('/',checkloginuser, check('cname','Enter a valid password category name').isLength({ min: 1 }), function(req, res, next) {
    var loginuser=localStorage.getItem("loginuser");
    var image;
    var user=usermodule.findOne({username:loginuser});
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      user.exec((err,data)=>{
        if(err) throw error;
        image=data.profileimage;
      res.render('addnewcategory', { title: 'New Category',data:image,loginuser:loginuser,errors:errors.mapped(),success:''});
      });
    }
    else{
      var passcatname=req.body.cname;
      if(passcatname==""){
        res.render('addnewcategory', { title: 'New Category',data:image,loginuser:loginuser,errors:'Please add a valid category name!',success:''});  
      }
      var passdetails=new passwordcategorymodule({
        username:loginuser,
        passname:passcatname
      });
      passdetails.save((err,data)=>{
        if(err)throw error;
        else{
          user.exec((err,data)=>{
            if(err) throw error;
            image=data.profileimage;
            res.render('addnewcategory', { title: 'New Category',data:image,loginuser:loginuser,errors:'',success:'Category Added Successfully!'});  
          });
         
        }
      });
     
    }
   
  });
  
  

  module.exports = router;