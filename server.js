
var connection = require("ssh2")
  , express    = require("express")
  , request    = require("request")
  , app        = express()
  , mongoose   = require("mongoose");

app.use(express.logger());

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.use(express.methodOverride())
app.use(express.cookieParser()); // config.sessions.key
app.use(express.bodyParser());
app.use(express.errorHandler());

// TODO: schema for currently deployed branch (rather than real-time check?)
// schema for past test results?
mongoose.connect( process.env.MONGOLAB_URI || "mongodb://localhost/forkable-ci" );

// github webhooks
// on pull request do ???
// auto run tests on staging server and push results back as a comment to pull request?
app.post('/github_webhook', function(req, res) {
    console.log("req.body = " + JSON.stringify(req.body));

    res.send("OK");
});

var github_token = process.env.GITHUB_TOKEN;

app.get('/', function(req, res) {
    // GET /repos/:owner/:repo/pulls
    request({
      method: 'GET',
      uri: 'https://api.github.com/repos/coursefork/forkshop/pulls',
      encoding: 'utf-8',
      followRedirect: false,
      headers: {
        'Authorization': 'token ' + github_token,
        'User-Agent': 'forkable ci'
      }
    }, function(err, response, body) {
      // need to know which branch is active on staging
      var pull_requests = JSON.parse(body);

      // display all pull requests and their state
      res.render('index', {
        title : "Coursefork Pull Requests",
        pull_requests : pull_requests
      });
    });
});

app.post('/checkout_branch', function(req, res) {
  var pr = req.body.pr;
  // ssh to staging
  // exec grunt branch --pr=req.params.pr
  console.log('pr = ' + pr);

  var c = new connection();

  c.on('ready', function() {
    c.exec("cd /usr/local/node/forkable-ci && grunt checkout_branch --pr " + pr, function(err, stream) {
      if (err) throw err;

      stream.on('data', function(data, extended) {
        console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ') + data);
        // what to do with output?
      });
      stream.on('exit', function(code, signal) {
        c.end();
      });
    });
  });

  c.on('close', function() {
    // render new page?
    res.json({
      status: "ok"
    });
  });

  c.connect({
    host       : process.env.REMOTE_HOST,
    username   : process.env.REMOTE_USER,
    privateKey : process.env.SSH_PRIVATE_KEY,
    passphrase : process.env.SSH_PASSPHRASE
  });
});

app.get('/check_branch', function(req, res) {
  var branch_r = "";
  var c = new connection();

  c.on('ready', function() {
    c.exec("cd /usr/local/node/forkshop && git branch", function(err, stream) {
      if (err) throw err;

      stream.on('data', function(data, extended) {
        console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ') + data);
        branch_r += data;
      });
      stream.on('exit', function(code, signal) {
        c.end();
      });
    });
  });

  c.on('close', function() {
    res.send(branch_r);
  });

  c.connect({
    host       : process.env.REMOTE_HOST,
    username   : process.env.REMOTE_USER,
    privateKey : process.env.SSH_PRIVATE_KEY,
    passphrase : process.env.SSH_PASSPHRASE
  });
});

// testing ssh stuff
app.get('/uptime', function(request, response) {

  var uptime_r = "";
  var c = new connection();

  c.on('connect', function() {
    console.log("connect");
  });

  c.on('ready', function() {
    console.log('ready');
    c.exec("uptime", function(err, stream) {
      if (err) throw err;
      stream.on('data', function(data, extended) {
        console.log((extended === 'stderr' ? 'STDERR: ' : 'STDOUT: ') + data);
        uptime_r += data;
      });
      stream.on('end', function() {
        console.log("stream eof");
      });
      stream.on('close', function() {
        console.log("stream close");
      });
      stream.on('exit', function(code, signal) {
        console.log("stream exit code = " + code + " signal = " + signal);
        c.end();
      });
    });
  });

  c.on('error', function(err) {
    console.log("error " + err);
  });
  c.on('end', function() {
    console.log("end");
  });
  c.on('close', function() {
    console.log("close");
    response.send(uptime_r);
  });

  c.connect({
    host       : process.env.REMOTE_HOST,
    username   : process.env.REMOTE_USER,
    privateKey : process.env.SSH_PRIVATE_KEY,
    passphrase : process.env.SSH_PASSPHRASE
  });
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});

