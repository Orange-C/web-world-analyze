var app = require('koa')();
var router = require('koa-router')();
var cors = require('koa-cors');
var bodyParser = require('koa-bodyparser');
var request = require('request');
var cheerio = require('cheerio');

app.use(cors());
app.use(bodyParser());

router.get('/', function *(next) {
  this.body = 'el psy';
});

router.post('/analyze', function *(next) {
  let msg = this.request.body.url;

  let options = {
    url: msg
  };
  let result = {};
  yield result = sendReq(options).then((res) => {
    this.body = {
      dom: res
    };
  }).catch((err) => {
    this.body = {
      err
    };
  });
  yield next;
});

function sendReq(options) {
  return new Promise(function(resolve, reject) {
    request(options, function(err, res, body){
      if(err) {
        console.log('---')
        console.log(err);
        reject(err);
      }
      if(!err && res.statusCode == 200) {
        let $ = cheerio.load(res.body);
        let result = [];
        analyzeHTML($('body')[0], result, 0);
        resolve(result);
      }
    })
  })
}

function analyzeHTML(node, arr, depth) {
  let child = node.children;
  for(let i = 0;i < child.length;i++) {
    if(child[i].name && child[i].type !== 'script') {
      let tempObj = {
        name: child[i].name,
        children: [],
      };
      if(depth <= 2 && child[i].children && child[i].children.length > 0) {
        analyzeHTML(child[i], tempObj.children, depth + 1);
      }
      arr.push(tempObj);
    }
  }
}
 
app
  .use(router.routes())
  .use(router.allowedMethods());
  
app.listen(4000);

console.log('Server at Localhost:4000');