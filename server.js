/*******************************************************************************
 * Community Service Tracker:  A draft community service application to track
 * volunteer hours, put together for the purpose of guiding Liam in developing
 * his own Rotary Club project along similar lines.
 *
 * server.js : Implements a node.js / express server with some basic (but not
 * comprehensive) security features as explained within.
 *
 * Tym MacLeod 2021.
 ******************************************************************************/

////////////////////////////////////////////////////////////////////////////////
// IMPORT THIRD PARTY MODULES
////////////////////////////////////////////////////////////////////////////////

// TODO: Need to address / update numerous deprecated modules.

// For assertion testing, such as the equality of data values.
let assert = require("assert");

// To screen for overly large request bundles.
let bodyParser = require("body-parser");

// To fork separate Node.js processes.
let cp = require("child_process");

// To specify directives for content sources (googleapis, bootstrapcdn, etc.).
let csp = require("helmet-csp");

// For access to express itself.
let express = require("express");

// For mitigation of http header hacks.
let helmet = require("helmet");

// To automatically log all http requests.
let logger = require("morgan");

// To write full-path file names easily.
let path = require("path");

// For mitigation of unsophisticated DoS attacks.
let RateLimit = require("express-rate-limit");

// To measure response time for performance monitoring.
let responseTime = require("response-time");

// For loading envirtonmental variables from a .env file into process.env.
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

////////////////////////////////////////////////////////////////////////////////
// IMPORT ROUTE MODULES
////////////////////////////////////////////////////////////////////////////////

let users = require("./routes/users");
let sessions = require("./routes/sessions");
let projects = require("./routes/projects");

////////////////////////////////////////////////////////////////////////////////
// CREATE EXPRESS APP
////////////////////////////////////////////////////////////////////////////////

let app = express();
// In case server running on AWS behind Nginx load balancing / Elastic Beanstalk.
app.enable("trust proxy");

////////////////////////////////////////////////////////////////////////////////
// BIND MIDDLEWARE
////////////////////////////////////////////////////////////////////////////////

// Make a rate limiter of 100 requests per 3 minutes / full speed until then.
let limiter = new RateLimit({
  windowMs: 3 * 60 * 1000, // pertinent timeframe of 3 minutes
  max: 100, // 100 request-limit in that 3 minutes
  delayMs: 0, // full speed until limit is reached
});
// Use the rate limiter -- i.e., bind the middleware at front here.
app.use(limiter);

// Use helmet's defaults as a starting point for security mitigation.
app.use(helmet());
// Use helmet's content source module on top of that.
app.use(
  csp({
    // Specify directives for various content sources.
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "ajax.googleapis.com",
        "maxcdn.bootstrapcdn.com",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "maxcdn.bootstrapcdn.com"],
      fontSrc: ["'self'", "maxcdn.bootstrapcdn.com"],
      imgSrc: ["*"],
    },
  })
);

// Adds an X-Response-Time header to responses to measure response times.
app.use(responseTime());

// Logs all HTTP requests with styling specified by the "dev" option.
app.use(logger("dev"));

// Use bodyParser to screen for suspicious sized JSON body requests.
app.use(bodyParser.json({ limit: "100kb" })); // TODO: Resolve deprecation.

// Respond to GET requests made to the homepage by serving the built index.html.
app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/public", "index.html"));
});

// Use express's built-in middleware to serve static content from the build.
app.use(express.static(path.join(__dirname + "/public")));

////////////////////////////////////////////////////////////////////////////////
// FORK A PROCESS
////////////////////////////////////////////////////////////////////////////////

// Fork a child process for any necessary background processing.
let node2 = cp.fork("./worker/app_FORK.js");
node2.on("exit", function (code) {
  console.log("Worker crashed and was restarted.", code);
  node2 = undefined;
  // Restart the child process, unless it was a test run (via mocha).
  if (!server.testrun) {
    node2 = cp.fork("./worker/app_FORK.js");
  }
});

////////////////////////////////////////////////////////////////////////////////
// MAKE MONGO_DB DATA LAYER CONNECTION
////////////////////////////////////////////////////////////////////////////////

// Connect to / initialize MongoDB.
let db = {};
let MongoClient = require("mongodb").MongoClient;
// Connect to the server; note that this is an asynchronous call. So, the code
// will proceed ahead while waiting to make the connection. That is why we
// create the db object here, and then use it below in the middwware injection.
MongoClient.connect(
  process.env.MONGODB_CONNECT_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, client) {
    assert.equal(null, err); // TODO: Resolve deprecation.
    db.client = client;
    // TODO: Change db and collection.
    db.collection = client.db("newswatcherdb").collection("newswatcher");
    console.log("Connected to MongoDB server.");
  }
);

////////////////////////////////////////////////////////////////////////////////
// DEAL WITH SHUTDOWNS AND RESTARTS
////////////////////////////////////////////////////////////////////////////////

// If there is a process shutdown, close down child process and db properly.
process.on("SIGINT", function () {
  console.log("Closing MongoDB connection due to termination of app.");
  db.client.close();
  console.log("Killing child process due to termination of app.");
  node2.kill();
  console.log("Exiting process due to termination of app.");
  process.exit(0);
});

// If there is an app restart, close down child process and db properly.
process.on("SIGUSR2", function () {
  console.log("Closing MongoDB connection due to restart of app.");
  db.client.close();
  console.log("Killing child process due to restart of app.");
  node2.kill();
  console.log("Killing process due to restart of app.");
  process.kill(process.pid, "SIGUSR2");
});

////////////////////////////////////////////////////////////////////////////////
// SHARE OBJECTS
////////////////////////////////////////////////////////////////////////////////

// Inject the db and node2 objects into the request (make them available for
// use) by adding them as properties on the request object.
app.use(function (req, res, next) {
  req.db = db;
  req.node2 = node2;
  next();
});

////////////////////////////////////////////////////////////////////////////////
// ESTABLISH EXPRESS ROUTE HANDLERS
////////////////////////////////////////////////////////////////////////////////

// Use the "restful" API routes.
app.use("/api/users", users);
app.use("/api/sessions", sessions);
app.use("/api/projects", projects);

////////////////////////////////////////////////////////////////////////////////
// DEAL WITH INVALID URLS
////////////////////////////////////////////////////////////////////////////////

// At this point, anything that hasn't been handled is presumed to be an error.
app.use(function (req, res, next) {
  let err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// If in development mode, log a stacktrace for easier debugging.
if (app.get("env") === "development") {
  app.use(function (err, req, res, next) {
    // NOTE: The following "comment" allows an "exception" to usual eslint rule.
    // eslint-disable-line no-unused-lets
    res.status(err.status || 500).json({ message: err.toString(), error: err });
    console.log(err);
  });
}

// If in production mode, then don't expose stacktraces to users.
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(err.status || 500).json({ message: err.toString(), error: {} });
});

////////////////////////////////////////////////////////////////////////////////
// LISTEN FOR HTTP REQUESTS
////////////////////////////////////////////////////////////////////////////////

app.use(express.static(__dirname + "/public"));

app.set("port", process.env.PORT || 3000);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

let server = app.listen(app.get("port"), function () {
  console.log("Express server listening on port " + server.address().port);
});

server.db = db;
server.node2 = node2;
console.log(`Worker ${process.pid} started`);

if (!process.env.RUN_CLUSTERED) {
  module.exports = server;
}
