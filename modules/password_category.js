var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
// mongoose.connect( 'mongodb+srv://ams:123@cluster0-y82sp.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});
mongoose.connect('mongodb+srv://ams:123@cluster0-y82sp.mongodb.net/pms?retryWrites=true&w=majority');
//mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});
var con=mongoose.connection;

var passcatSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    passname:{
        type:String,
        required:true,
    },
   date:{
        type:Date,
        default:Date.now(),
    }
  });

  passcatSchema.plugin(mongoosePaginate);
  //new modle employee_data is table name employee schema is the schema of table
  var pass_cat_model = mongoose.model('password_category_name',passcatSchema);

  module.exports=pass_cat_model;