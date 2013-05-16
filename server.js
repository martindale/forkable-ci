
var connection = require("ssh2")
  , express    = require("express")
  , app        = express();

app.use(express.logger());
app.use(express.bodyParser());

app.post('/github_webhook', function(req, res) {
    console.log("req.params = " + JSON.stringify(req.params));
    console.log("req.body = " + JSON.stringify(req.body));

    //var push = JSON.parse(req.params.payload);
    //console.log(req.params.payload);
    res.send("OK");
});

app.get('/', function(request, response) {
  response.send('Hello World!');
});

app.get('/uptime', function(request, response) {

var uptime_r = "";
var c = new connection();

c.on('connect', function() {
  console.log("connect");
});

c.on('ready', function() {
  console.log('ready');
  c.exec('uptime', function(err, stream) {
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
  host: "tomango.asmallorange.com",
  username: "brianpm1",
  privateKey: require('fs').readFileSync("/Users/brian/.ssh/aso_id_dsa"),
  passphrase: ""
});

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

