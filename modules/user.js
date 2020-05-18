var mongoose = require('mongoose');
// mongoose.connect( 'mongodb+srv://ams:123@cluster0-y82sp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});
//mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});

mongoose.connect('mongodb+srv://ams:123@cluster0-y82sp.mongodb.net/pms?retryWrites=true&w=majority');
var con=mongoose.connection;
var userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    email:{
        type:String,
        required:true,
        index:{
            unique:true,
        }
    },
    password:{
        type:String,
        required:true,
       
    },
    profileimage:{
        type:String,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now(),
    }
  });

  //new modle employee_data is table name employee schema is the schema of table
  var usermodel = mongoose.model('users', userSchema);

  module.exports=usermodel;




  