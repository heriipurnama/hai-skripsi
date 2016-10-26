
var http           = require('http')
var express        = require('express')
var bodyParser     = require('body-parser')
var cookieParser   = require('cookie-parser')
var methodOverride = require('method-override')
var session        = require('express-session')
var serveStatic    = require('serve-static')
var argv           = require('optimist').argv
var mongoose       = require('mongoose');

// create a seneca instance
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

app.get('/aku', function(req, res){
  res.render('index',{})
})


app.get('/', function(req, res){
    skripses.find({},function(err,result){
      skripses.count({},function(err,jml){ 
        if (result){
          res.render('indexCari',{locals:{skripses:result,jmlh:jml}}) ;
        } 
      })
    })
})


//app.get('/cari2',function(req,res){
  //res.render('indexCari')
//})


//**pencarian berdasarkan kata atau key-word untuk nama
app.post('/', function(req,res){
//console.log(req.body.q);
    skripses.find({jdlSkripsis: new RegExp (req.body.q,"i")}, //pencariaan berdasarkan kemiripan kalimat case-Insensitive
        function(err, result){
    //res.render('indexCari',{locals:{skripses:result}});
    skripses.count({},
        function(err,jml){ 
            if (result){
               res.render('indexCari',{locals:{skripses:result,jmlh:jml}}) ;
            } 
   
          }
        )
  })
  }
);


seneca.client({port:10201,pin:{role:'user',cmd:'*'}})
seneca.client({port:10202,pin:{role:'offer',cmd:'*'}})
seneca.client({port:10203})
seneca.client({port:102031212})




var server = http.createServer(app)
server.listen( options.main ? options.main.port : 3000 )

