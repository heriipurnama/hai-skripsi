
//**pendefinisian varibel menggunakan modul**
var http           = require('http');
var express        = require('express');
var bodyParser     = require('body-parser');
var cookieParser   = require('cookie-parser');
var methodOverride = require('method-override');
var session        = require('express-session');
var serveStatic    = require('serve-static');
var argv           = require('optimist').argv;
var mongoose       = require('mongoose');
var validation = require('validator');
var xlsx          = require('excel');

var formidable = require('formidable');
var util = require('util');
var fs = require('fs');

var skripsis = require ('../model/db.js');
var skripses = require ('../model/db.js');
var data = require ('../model/db.js');


//**menciptakan seneca instance
var seneca = require('seneca')()

//var routes = require('./routes/index');

// load configuration for plugins
// top level properties match plugin names
// copy template config.template.js to config.mine.js and customize

var options = seneca.options('config.mine.js')


// use the user and auth plugins
// the user plugin gives you user account business logic
seneca.use('user')
//seneca.use('data-editor')
//seneca.use('admin')
//seneca.use('mongo-store')
      
// the auth plugin handles HTTP authentication
seneca.use('auth',{
  redirect:{
    login: {
      win:  '/tampil',
      fail: '/login#failed'
    },
    register: {
      win:  '/akun',
      fail: '/#failed'
    }
  }
})
//seneca.use('auth')

seneca.use('../lib/api.js')

//seneca.use('admin')


// use the express module in the normal way
var app = express()
app.enable('trust proxy')

app.use(cookieParser())
app.use(express.query())
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride())
app.use(bodyParser.json())
//app.use(expressValidator);


app.use(session({secret:'seneca'}))

//app.use(serveStatic(__dirname + '/public'))
//app.use( express.static('./public') )
app.use(serveStatic('./public'))

// add seneca middleware
app.use( seneca.export('web') )


// some express views
//app.set('views'+'/views');
//app.set('view engine', 'jade');

app.engine('ejs',require('ejs-locals'))
//app.set('views', __dirname + '/views')
app.set('views'+ './views')
app.set('view engine','ejs')



app.get('/login', function(req, res){
  res.render('login.ejs',{})
})
app.get('/', function(req, res){
    res.render('vi.ejs',{})
})


app.get('/akun', function(req, res){
  res.render('account.ejs',{locals:{user:req.seneca.user, message: " " }})
})



//upload-file
app.post('/upload',function(req,res){
       var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      fs.rename(files.upload.path, './data/data.xlsx');
        skripses.find({}, function(err, result){
            skripses.count({},function(err,jml){
                skripses.count({jurMhs:"Teknik Informatika"},function(err,jmti){
                    skripses.count({jurMhs:"Sistem Informasi"},function(err,jmsi){
                        skripses.count({jurMhs:"Manajemen Informatika"},function(err,jmmi){
                            skripses.count({jurMhs:"Komputerisasi Akuntansi"},function(err,jmka){
                                skripses.count({jurMhs:"Teknik Komputer"},function(err,jmtk){
                                    if (result){
                                        res.render('dataSkripsi',{locals:{skripses:result, user:req.seneca.user,jmlh:jml,jmlhti:jmti,jmlhsi:jmsi,jmlhmi:jmmi,jmlhka:jmka,jmlhtk:jmtk}})
                                    }
                                })
                            })
                        })
                    })
                })
            })
        })
    });

  return;

  })

  

 //Fungsi Untuk export xlsx file ke json
function convertToJson(array){
    var frist    = array[0].join();
    var headers  = frist.split(',');
    var jsonData = [];
    for (var i = 1, length = array.length; i < length; i++){
        var myRow = array[i].join();
        var row   = myRow.split(',');
        var data  = {};

        for (var x=0; x < row.length; x++) {
            data[headers[x]] = row[x];
        }
        jsonData.push(data);
    }
    return jsonData;
};
//End Fungsi Untuk export xlsx file ke json

app.get('/export', function(req, res){
  //  if(req.session.admin){
        xlsx('./data/data.xlsx', function(er, dtm){
            if(er) throw  er;
            var exportkeJson = JSON.stringify(convertToJson(dtm));
            var mhsJson = JSON.parse(exportkeJson);
            for(var ar = 0; ar < mhsJson.length; ar++){
                new data(mhsJson[ar]).save(function(er){
                    if(er) throw e;
                });
            }
  skripses.find({}, function(err, result){
    skripses.count({},function(err,jml){
      skripses.count({jurMhs:"Teknik Informatika"},function(err,jmti){ 
         skripses.count({jurMhs:"Sistem Informasi"},function(err,jmsi){ 
           skripses.count({jurMhs:"Manajemen Informatika"},function(err,jmmi){ 
            skripses.count({jurMhs:"Komputerisasi Akuntansi"},function(err,jmka){
             skripses.count({jurMhs:"Teknik Komputer"},function(err,jmtk){ 
                  if (result){
                    res.render('dataSkripsi',{locals:{skripses:result, user:req.seneca.user,jmlh:jml,jmlhti:jmti,jmlhsi:jmsi,jmlhmi:jmmi,jmlhka:jmka,jmlhtk:jmtk}})
                } 
              })
            })
          }) 
        }) 
      }) 
    })
  })
        });
});

//End proses*/


seneca.client({port:10201,pin:{role:'user',cmd:'*'}})
seneca.client({port:10202,pin:{role:'offer',cmd:'*'}})
seneca.client({port:10203})
//seneca.client({port:102031212})
//seneca.use('user')
seneca.use('data-editor')
//seneca.use('web')
//seneca.use('admin')
//app.use( seneca.export('web') )






//masukkan data
app.post("/data", function(req, res){
  var jdlSkripsis = req.body.jdlSkripsis;
//  var nimMhs      = req.body.nimMhs;

    skripsis.findOne({jdlSkripsis:jdlSkripsis},
      function(err,result){
        //console.log(req.body);
          if (result) {
              res.render('account.ejs',{locals:{user:req.seneca.user, message: "** judul skripsi sudah ada..." }})
          }     
          else{
            var r = req.body;
              new  skripsis({
                jdlSkripsis  : r.jdlSkripsis,
                thnSkripsis  : r.thnSkripsis,
                namaMhs      : r.namaMhs,
                nimMhs       : r.nimMhs,
                jurMhs       : r.jurMhs,
                jenjangMhs   : r.jenjangMhs,
                abstrak      : r.abstrak,
                keyword      : r.keyword
              }).save(function(err){
                  if(err) res.json(err);
                 res.redirect('/tampil');
                });
   
         }
      }
  )
});

/*app.use(session({
  secret : 'sembarang',
  proxy  : true,
  resave : true,
  saveUninitialized : true
}));
//app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res, next){
  var err   = req.session.error,
      msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if(err) res.locals.message = err;
  if(msg) res.locals.message = msg;
  next();
});


  /*var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      fs.rename(files.upload.path, './data/data.xlsx');
      //res.writeHead(200, {'content-type': 'text/html'});
      //res.write('Received upload: <a href="/view">View PDF</a>');
      res.end();
    });

    return;

*/

app.post('/cariData', function(req,res){
//console.log(req.body.q);
    skripses.find({namaMhs: new RegExp (req.body.q,"i")}, //pencariaan berdasarkan kemiripan kalimat case-Insensitive
    function(err, result){
    //res.render('indexCari',{locals:{skripses:result}});
     skripses.count({},function(err,jml){
      skripses.count({jurMhs:"Teknik Informatika"},function(err,jmti){ 
         skripses.count({jurMhs:"Sistem Informasi"},function(err,jmsi){ 
           skripses.count({jurMhs:"Manajemen Informatika"},function(err,jmmi){ 
            skripses.count({jurMhs:"Komputerisasi Akuntansi"},function(err,jmka){
             skripses.count({jurMhs:"Teknik Komputer"},function(err,jmtk){ 
                  if (result){
                    res.render('dataSkripsi',{locals:{skripses:result, user:req.seneca.user,jmlh:jml,jmlhti:jmti,jmlhsi:jmsi,jmlhmi:jmmi,jmlhka:jmka,jmlhtk:jmtk}})
                } 
              })
            })
          }) 
        }) 
      }) 
    })
  })
  });

///



//**lihat data
app.get('/tampil', function(req,res, next){
  skripses.find({}, function(err, result){
    skripses.count({},function(err,jml){
      skripses.count({jurMhs:"Teknik Informatika"},function(err,jmti){ 
         skripses.count({jurMhs:"Sistem Informasi"},function(err,jmsi){ 
           skripses.count({jurMhs:"Manajemen Informatika"},function(err,jmmi){ 
            skripses.count({jurMhs:"Komputerisasi Akuntansi"},function(err,jmka){
             skripses.count({jurMhs:"Teknik Komputer"},function(err,jmtk){ 
                  if (result){
                    res.render('dataSkripsi',{locals:{skripses:result, user:req.seneca.user,jmlh:jml,jmlhti:jmti,jmlhsi:jmsi,jmlhmi:jmmi,jmlhka:jmka,jmlhtk:jmtk}})
                } 
              })
            })
          }) 
        }) 
      }) 
    })
  })
});


//locals:{user:req.seneca.user}}

//**menggatur parameter
app.param('nimMhs', function(req,res, next, nimMhs){
 // console.log(req.body);
  skripses.find({nimMhs : nimMhs}, function(err, docs){
    req.skripses = docs[0];
    next();
  });
});

app.param('_id', function(req,res, next, _id){
 // console.log(req.body);
  skripses.find({_id : _id}, function(err, docs){
    req.skripses = docs[0];
    next();
  });
});

//**ambil data dari dataSkripsi.js
app.get('/:_id/update', function(req,res){
  res.render('update.ejs', {skripses : req.skripses, user:req.seneca.user});
});

//**Proses Update dari dataSkripsi.js
app.post("/:_id", function(req,res){
 var q = req.body;

  // console.log(req.body);
      skripses.update({_id:req.params._id},
        {
            jdlSkripsis  : q.jdlSkripsis,
            thnSkripsis  : q.thnSkripsis,
            namaMhs      : q.namaMhs,
            nimMhs       : q.nimMhs,
            jurMhs       : q.jurMhs,
            jenjangMhs   : q.jenjangMhs,
            abstrak      : q.abstrak,
            keyword      : q.keyword,
            modified     : q.modified

        }, 
          function(err,result){ //kehilangan tanda baca fungtion berakibat FATAL
          // res.redirect('dataSkripsi.ejs',{locals:{skripses:result, user:req.seneca.user}})
          // res.redirect('/account');
         // skripses.find({},function(err, result){ //** pengembalian data ke tampilData
         // res.render('dataSkripsi',{locals:{skripses:result, user:req.seneca.user}})
     // })
          skripses.find({},function(err, result){ //** pengembalian data ke tampilData
            skripses.count({},function(err,jml){
              skripses.count({jurMhs:"Teknik Informatika"},function(err,jmti){ 
                skripses.count({jurMhs:"Sistem Informasi"},function(err,jmsi){ 
                  skripses.count({jurMhs:"Manajemen Informatika"},function(err,jmmi){ 
                    skripses.count({jurMhs:"Komputerisasi Akuntansi"},function(err,jmka){
                      skripses.count({jurMhs:"Teknik Komputer"},function(err,jmtk){ 
                        if (result){
                          res.render('dataSkripsi',{locals:{skripses:result, user:req.seneca.user,jmlh:jml,jmlhti:jmti,jmlhsi:jmsi,jmlhmi:jmmi,jmlhka:jmka,jmlhtk:jmtk}})
                        } 
                      })
                    })
                  }) 
                }) 
              }) 
            })
          })
        }) 
}); 

//**hapus data
app.get('/:_id/delete', function(req, res){
  skripses.remove({_id : req.params._id},
   function(err, result){
     skripses.find({},function(err, result){ //** pengembalian data ke tampilData
       skripses.count({},function(err,jml){
         skripses.count({jurMhs:"Teknik Informatika"},function(err,jmti){ 
           skripses.count({jurMhs:"Sistem Informasi"},function(err,jmsi){ 
             skripses.count({jurMhs:"Manajemen Informatika"},function(err,jmmi){ 
               skripses.count({jurMhs:"Komputerisasi Akuntansi"},function(err,jmka){
                skripses.count({jurMhs:"Teknik Komputer"},function(err,jmtk){ 
                 if (result){
                  res.render('dataSkripsi',{locals:{skripses:result, user:req.seneca.user,jmlh:jml,jmlhti:jmti,jmlhsi:jmsi,jmlhmi:jmmi,jmlhka:jmka,jmlhtk:jmtk}})
                 } 
               })
              })
            }) 
          }) 
        }) 
      })
    })
  })
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});





//ruunnig pada
var server = http.createServer(app)
server.listen( options.main ? options.main.port : 2000 )