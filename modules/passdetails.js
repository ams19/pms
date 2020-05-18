var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
// mongoose.connect( 'mongodb+srv://ams:123@cluster0-y82sp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true,useFindAndModify:false});
//mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true, useFindAndModify:false});
mongoose.connect('mongodb+srv://ams:123@cluster0-y82sp.mongodb.net/pms?retryWrites=true&w=majority');
var con=mongoose.connection;
var passdetailSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    passname:{
        type:String,
        required:true,  
    },
    passdetails:{
        type:String,
        required:true,
        
    },
   date:{
        type:Date,
        default:Date.now(),
    }
  });

  passdetailSchema.plugin(mongoosePaginate);
  //new modle employee_data is table name employee schema is the schema of table
  var pass_det_model = mongoose.model('password_details',passdetailSchema);

  
  module.exports=pass_det_model;