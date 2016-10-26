var mongoose = require ('mongoose'),
  Schema = mongoose.Schema;
mongoose.connect('mongodb://127.0.0.1/dataSkripsi', function(err){
  if(err){
    console.log("Koneksi gagal  :" +err)
  }else{
    console.log("Koneksi Sukses")
  }
});

var skripsis = new mongoose.Schema({
  jdlSkripsis  : { type: String },
  thnSkripsis  : { type: String },
  namaMhs      : { type: String },
  nimMhs       : { type: Number },
  jurMhs       : { type: String },
  jenjangMhs   : { type: String },
  abstrak      : { type: String },
  keyword      : { type: String },
  modified     : { type: Date,default:Date.now }
  //**ujiCoba

});
module.exports = mongoose.model('skripsis', skripsis);