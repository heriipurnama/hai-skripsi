require('seneca')()
  .use('user')
  .use('data-editor')
  //.use('admin')
  .listen(10201)
  .ready(function(){
    this.act({role:'user',cmd:'register',nick:'admin',name:'admin',password:'admin',active:true,admin:true})
    this.act({role:'user',cmd:'register',nick:'heriipurnama',name:'heriipurnama',password:'herii',active:true,admin:true})
    this.act({role:'user',cmd:'register',nick:'tiaafri',name:'tiaafri',password:'1234',active:true,admin:true})
  })