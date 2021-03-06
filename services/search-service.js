var http           = require('http')
var express        = require('express')
var bodyParser     = require('body-parser')
var cookieParser   = require('cookie-parser')
var methodOverride = require('method-override')
var session        = require('express-session')
var serveStatic    = require('serve-static')
var argv           = require('optimist').argv
var mongoose       = require('mongoose');


var seneca = require('seneca')()
var skripses = require ('../model/db.js')

//var routes = require('./routes/index');

// load configuration for plugins
// top level properties match plugin names
// copy template config.template.js to config.mine.js and customize

var options = seneca.options('config.mine.js')


// use the user and auth plugins
// the user plugin gives you user account business logic
seneca.use('user')

seneca.use('../lib/api.js')



// use the express module in the normal way
var app = express()
app.enable('trust proxy')

app.use(cookieParser())
app.use(express.query())
app.use(bodyParser.urlencoded({extended: true}))
app.use(methodOverride())
app.use(bodyParser.json())

// Use in-memory sessions so OAuth will work
// In production, use redis or similar
app.use(session({secret:'seneca'}))

//app.use(serveStatic(__dirname + '/public'))
//app.use( express.static('./public') )
app.use(serveStatic('./public'))

// add seneca middleware
app.use( seneca.export('web') )


//app.set('views'+'/views');
//app.set('view engine', 'jade');

// some express views
app.engine('ejs',require('ejs-locals'))
//app.set('views', __dirname + '/views')
app.set('views'+ './views')
app.set('view engine','ejs')


// when rendering the account page, use the req.seneca.user object
// to get user details. This is automatically set up by the auth plugin

app.get('/account', function(req, res){
  res.render('account.ejs',{locals:{user:req.seneca.user}})
})


/*app.get('/cariData', function(req, res){
  var d = req.body.q;
    skripses.find({},function(err,result){
      skripses.count({},function(err,jml){ 
        if (result){
          res.render('indexCari.ejs',{locals:{message:"",data:d,skripses:result,jmlh:jml}}) ;
        } 
      })
    })
})
*/

app.get('/cariData', function(req, res){
  var d = req.body.q;
    skripses.find({},function(err,result){
      skripses.count({},function(err,jml){ 
        if (result){
          res.render('indexCari.ejs',{locals:{message:"",data:d,skripses:result,jmlh:jml}}) ;
        } 
      })
    })
})

//result == hasil

//**pencarian berdasarkan kata atau key-word untuk nama
app.post('/sederhana', function(req,res){
//console.log(req.body.q);
var d = req.body.q;
    skripses.find({abstrak: new RegExp (req.body.q,"i")}, //pencariaan berdasarkan kemiripan kalimat case-Insensitive
      function(err, result){
        skripses.count({abstrak: new RegExp (req.body.q,"i")},
          function(err,jml){ 
            if (result){
              res.render('indexCari',{locals:{message:"Pencarian Dengan kata kunci",data:d,skripses:result,jmlh:jml}}) ;
            } 
          }
        )
    })
});

app.post('/advance', function(req,res){
//console.log(req.body.q);
  var d = req.body.j;
    skripses.find({jdlSkripsis: new RegExp (req.body.j,"i")}, //pencariaan berdasarkan kemiripan kalimat case-Insensitive
      function(err, result){
        skripses.count({jdlSkripsis: new RegExp (req.body.j,"i")},
          function(err,jml){ 
            if (result){
              res.render('indexCari',{locals:{message:"Pencarian Dengan kata kunci",data:d,skripses:result,jmlh:jml}}) ;
            } 
          }
        )
    })
});


app.param('_id', function(req,res, next, _id){
 // console.log(req.body);
  skripses.find({_id : _id}, function(err, docs){
    req.skripses = docs[0];
    next();
  });
});

app.get('/:_id/detail',function(req,res){
 res.render('detail.ejs', 
    {skripses : req.skripses});
});


//seneca.client({port:10201,pin:{role:'user',cmd:'*'}})
//seneca.client({port:10202,pin:{role:'offer',cmd:'*'}})
//seneca.client({port:10203})
//seneca.client({port:102031212})




var server = http.createServer(app)
server.listen( options.main ? options.main.port : 2001 )

