var express = require('express');
var router = express.Router();
var bcrypt=require("bcryptjs")
var jwt = require('jsonwebtoken');
var multer=require("multer");
var path=require("path"); 
const { check, validationResult } = require('express-validator');
var usermodule=require("../modules/user");
var passwordcategorymodule=require("../modules/password_category");
var passdetailsmodule=require("../modules/passdetails");


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

/* GET home page. */
router.get('/', function(req, res, next) {
  var loginuser=localStorage.getItem("loginuser");
  if(loginuser){
    res.redirect("/dashboard");
  }
  else{
    res.render('login', { title: 'Password Management System',fail:"",success:""});
  }
});


/* POST home page. */
router.post('/', function(req, res) {
  var username=req.body.uname;
  var password=req.body.password;
  var userexist=usermodule.findOne({username:loginuser});
  var loginuser=localStorage.getItem("loginuser");
  var userexist=usermodule.findOne({username:username});
  userexist.exec((err,data)=>{
    if(err) throw error;
    if(data){
     
      if(bcrypt.compareSync(password,data.password)){
        var getUserID=data._id;
        var token = jwt.sign({ userID: getUserID }, 'loginToken');
        localStorage.setItem('userToken', token);
        localStorage.setItem('loginuser', username);
        var loginuser=localStorage.getItem("loginuser");
        var userpass=passdetailsmodule.find();
        userpass.exec((err,passdata)=>{
          var usercat=passwordcategorymodule.find();
          usercat.exec((err,catdata)=>{
              res.render('sidebar', { title: 'dashboard',fail:'',success:'',nopass:passdata,nopasscat:catdata,data:data,loginuser:loginuser});
          });
         });
      }
      else
      {
        res.render('login', { title: 'Password Management System' ,fail:"Invalid Username or Password!",success:""});
      } 
    }
    else
    {
      res.render('login', { title: 'Password Management System' ,fail:"Invalid Username or Password!",success:""});
    }
  });
 
});


/* GET signup page. */
router.get('/signup',function(req, res, next) {
  var loginuser=localStorage.getItem("loginuser");
  if(loginuser){
    res.redirect("/dashboard");
  }
  else{
    res.render('signup', { title: 'Enter Your Details',fail:"",success:""});
  }
});

/* POST signup page. */
router.post('/signup',upload,checkemail,checkusername,check('email','Invalid Email Id!').isEmail(),
check('password','Password must be atleast 4 characters long!').isLength({ min: 4 }),function(req, res) {

  //getting data input from form
  var username=req.body.uname;
  var email=req.body.email;
  var password=req.body.password;
  var conpassword=req.body.conpassword;
  var image;
  if(req.file){
    image=req.file.filename;
  }
  else{
    image='defaultpic.jpeg_1589400845174.jpeg';
  }
  
  //validating
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var errobj=errors.mapped();
    if(errobj.email&&errobj.password){
      var errormsg=errobj.email.msg+'  '+errobj.password.msg;
    }
    else if(errobj.email){
      var errormsg=errobj.email.msg;
    }
    else if(errobj.password){
      var errormsg=errobj.password.msg;
    }
    return res.render('signup', { title: 'Enter Your Details',fail:errormsg,success:""});
  }
  //saving data on database
  else if(conpassword!=password){
    res.render('signup', { title: 'Enter Your Details',fail:"Your passwords do not match.",success:""});
  }
  else
  {
  
    password=bcrypt.hashSync(req.body.password,10);
    //creating a user record to send to database
    var userdetails=new usermodule({
      username:username,
      email:email,
      password:password,
      profileimage:image
    });
    if(emailflag==false&&usernameflag==false){
      userdetails.save((err,data)=>{
     if(err) throw error;
     res.render('signup', { title: 'Enter Your Details' ,fail:"", success:" You are registered successfully."});
   });
   }
  }
  emailflag=false;
  usernameflag=false;
});

/* LOGOUT from dashboard page. */
router.get('/logout', checkloginuser,function(req, res, next) {
  localStorage.removeItem("userToken");
  localStorage.removeItem("loginuser");
  res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  res.redirect("/");
});

/* LOGOUT from dashboard page. */
router.get('/newhome', checkloginuser,function(req, res, next) {
  res.render("newhome");
});


module.exports = router;
