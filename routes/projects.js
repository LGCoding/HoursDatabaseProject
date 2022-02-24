//
// users.js: A Node.js Module for for management of user settings and CRUD operations.
// There is middleware that makes sure a user is logged in so they can only get their profile.
// A profile is really associated with a user and never goes away,
// so there is no post as it is already there and a delete is also not needed
//

"use strict";
let express = require("express");
let bcrypt = require("bcryptjs");
let async = require("async");
let joi = require("joi"); // For data validation
let authHelper = require("./authHelper");
let ObjectId = require("mongodb").ObjectID;

let router = express.Router();

//
// Create a Project
router.post("/:id", authHelper.checkAuth, function postUser(req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for Project creation");
    err.status = 401;
    return next(err);
  }

  req.db.collection.findOne(
    { type: "USER_TYPE", _id: ObjectId(req.auth.userId) },
    function (err, doc) {
      if (err) {
        err.status = 400;
        return next(err);
      }
      if (doc.role < 1) {
        let err = new Error("Permission level is not high enough");
        err.status = 403;
        return next(err);
      }

      let schema = {
        name: joi.string().alphanum().min(3).max(50).required(),
        comment: joi.string().allow(""),
        startDate: joi.date(),
        endDate: joi.date(),
      };
      joi.validate(req.body, schema, function (err) {
        if (err) {
          let err = new Error(
            "Invalid field: display name 3 to 50 alpanumeric"
          );
          err.status = 400;
          return next(err);
        }

        req.db.collection.findOne(
          // TODO: Make sure database has USER_TYPE in it
          //TODO rethink error codes
          { type: "PROJECT_TYPE", name: req.body.name },
          function (err, doc) {
            if (err) {
              err.status = 400;
              return next(err);
            }

            if (doc) {
              let err = new Error("Project name already exists");
              err.status = 403;
              return next(err);
            }

            let xferProject = {
              type: "PROJECT_TYPE",
              name: req.body.name,
              startDate: req.body.startDate ? req.body.startDate : Date.now(),
              endDate: req.body.endDate ? req.body.endDate : "",
              comment: req.body.comment ? req.body.comment : "",
              isActive: true,
              participants: {},
              //TODO ARE THERE OTHERS?
            };

            req.db.collection.insertOne(
              xferProject,
              function createProject(err, result) {
                if (err) {
                  err.status = 400;
                  return next(err);
                }
                // TODO: If node2 process needs to send an email to project manager, call it here.
                res.status(201).json(result.ops[0]);
              }
            );
          }
        );
      });
    }
  );
});

//Creates an hour
router.post("/:id/:uid/:pid/", authHelper.checkAuth, function (req, res, next) {
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for Hour creation");
    err.status = 401;
    return next(err);
  }
  let schema = {
    date: joi.date().required(),
    hours: joi.number().min(0.5).max(24).required(),
    comment: joi.string().allow(""),
  };
  joi.validate(req.body, schema, function (errr) {
    if (errr) {
      console.log(errr);
      let err = new Error("Invalid field: display name 3 to 50 alpanumeric");
      err.status = 400;
      return next(err);
    }
    req.db.collection.findOneAndUpdate(
      { type: "PROJECT_TYPE", _id: ObjectId(req.params.pid) },
      {
        $set: {
          ["participants." +
          req.params.uid +
          "." +
          getRandomArbitrary(0, 100000000)]: {
            date: req.body.date,
            hours: req.body.hours,
            comment: req.body.comment ? req.body.comment : "",
          },
        },
      },
      function (err, doc) {
        if (err) {
          err.status = 400;
          return next(err);
        }
      }
    );
  });
});

//Deletes a Project
router.delete("/:id/:pid", authHelper.checkAuth, function (req, res, next) {
  // ASKLATER what do here
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for account deletion");
    err.status = 401;
    return next(err);
  }
  req.db.collection.findOne(
    { type: "USER_TYPE", _id: ObjectId(req.auth.userId) },
    function (err, doc) {
      if (err) {
        err.status = 400;
        return next(err);
      }
      if (doc.role < 1) {
        let err = new Error("Permission level is not high enough");
        err.status = 403;
        return next(err);
      }
      req.db.collection.findOne(
        { type: "PROJECT_TYPE", _id: ObjectId(req.params.pid) },
        function (err, doc) {
          if (err) {
            err.status = 400;
            return next(err);
          }
          if (Object.keys(doc.participants).length !== 0) {
            let err = new Error("Can not delete. hours have been done");
            err.status = 405;
            return next(err);
          }
          req.db.collection.deleteOne({ _id: ObjectId(req.params.pid) });
          // req.db.collection.findOneAndDelete(
          //   { type: "PROJECT_TYPE", _id: ObjectId(req.params.pid) },
          //   function (err, result) {
          //     if (err) {
          //       console.log(
          //         "+++POSSIBLE USER DELETION CONTENTION ERROR?+++ err:",
          //         err
          //       );
          //       err.status = 409;
          //       return next(err);
          //     } else if (result.ok != 1) {
          //       console.log(
          //         "+++POSSIBLE USER DELETION CONTENTION ERROR?+++ result:",
          //         result
          //       );
          //       let err = new Error("Project deletion failure");
          //       err.status = 409;
          //       return next(err);
          //     }

          //     res.status(200).json({ msg: "Project Deleted" });
          //   }
          // );
        }
      );
    }
  );
});

//Deletes hours someone has done
router.delete(
  "/:id/:uid/:pid/:hid",
  authHelper.checkAuth,
  function (req, res, next) {
    // ASKLATER what do here
    if (req.params.id != req.auth.userId) {
      let err = new Error("Invalid request for account deletion");
      err.status = 401;
      return next(err);
    }
    console.log("isdsdsdsdfsdgsdsdsdsdsdsdsdsdsdsdsdsdsd");
    req.db.collection.findOneAndUpdate(
      { type: "PROJECT_TYPE", _id: ObjectId(req.params.pid) },
      {
        $unset: {
          ["participants." + req.params.uid + "." + req.params.hid]: "",
        },
      },
      function (err, doc) {
        console.log("isdsdsdsdfsdgsdsdsdsdsdsdsdsdsdsdsdsdsd");
        if (err) {
          err.status = 400;
          return next(err);
        }
      }
    );
  }
);

//gets all project
router.get("/", authHelper.checkAuth, function (req, res, next) {
  req.db.collection
    .find({ type: "PROJECT_TYPE" })
    .toArray(function (err, result) {
      if (err) {
        err.status = 400;
        return next(err);
      }
      let returns = [];
      for (let i in result) {
        returns.push({
          name: result[i].name,
          _id: result[i]._id,
          startDate: result[i].startDate,
          endDate: result[i].endDate,
          isActive: result[i].isActive,
          comment: result[i].comment,
        });
      }
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", 0);
      res.status(201).json(returns);
    });
});

router.get("/all", authHelper.checkAuth, function (req, res, next) {
  req.db.collection
    .find({ type: "PROJECT_TYPE" })
    .toArray(function (err, result) {
      if (err) {
        err.status = 400;
        return next(err);
      }
      let returns = [];
      for (let i in result) {
        returns.push({
          name: result[i].name,
          participants: result[i].participants,
        });
      }
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", 0);
      res.status(201).json(returns);
    });
});

//gets all hours of a person
router.get("/user/:id", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for account fetch");
    err.status = 401;
    return next(err);
  }
  let schema = {
    showInactive: joi.boolean(),
  };

  joi.validate(req.body, schema, function (err) {
    if (err) {
      let err = new Error("Invalid field: display name 3 to 50 alpanumeric");
      err.status = 400;
      return next(err);
    }
    req.db.collection
      .find({ type: "PROJECT_TYPE" })
      .toArray(function (err, result) {
        if (err) {
          err.status = 400;
          return next(err);
        }
        let returns = {};
        for (let i in result) {
          if (result[i].participants[req.params.id]) {
            let temp = result[i].participants[req.params.id];
            for (let j in temp) {
              temp[j].name = result[i].name;
            }
            returns = Object.assign(returns, temp);
          }
        }
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        res.status(200).json(returns);
      });
  });
});

//makes graph
router.patch("/sheet/:id", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for account fetch");
    err.status = 401;
    return next(err);
  }
  let schema = {
    startDate: joi.date(),
    endDate: joi.date(),
    person: joi.string(),
    project: joi.string(),
  };

  joi.validate(req.body, schema, function (err) {
    if (err) {
      let err = new Error("Invalid field: display name 3 to 50 alpanumeric");
      err.status = 400;
      return next(err);
    }
    req.db.collection
      .find({ type: "USER_TYPE" })
      .toArray(function (err, resultn) {
        if (err) {
          err.status = 400;
          return next(err);
        }
        console.log(resultn);
        let users = {};
        for (let i in resultn) {
          users[resultn[i]._id] = resultn[i].name;
        }
        req.db.collection
          .find({ type: "PROJECT_TYPE" })
          .toArray(function (err, result) {
            if (err) {
              err.status = 400;
              return next(err);
            }
            let cellSheet = [];
            cellSheet.push([
              { value: "Project", type: "string" },
              { value: "Person", type: "string" },
              { value: "Day", type: "string" },
              { value: "Hours", type: "string" },
            ]);
            for (let p in result) {
              console.log(!req.body.project, result[p]._id == req.body.project);
              if (!req.body.project || result[p]._id == req.body.project) {
                for (let u in result[p].participants) {
                  if (!req.body.person || u == req.body.person) {
                    for (let h in result[p].participants[u]) {
                      if (
                        !req.body.startDate ||
                        new Date(req.body.startDate) <=
                          new Date(result[p].participants[u][h].date)
                      ) {
                        if (
                          !req.body.endDate ||
                          new Date(req.body.endDate) >=
                            new Date(result[p].participants[u][h].date)
                        ) {
                          cellSheet.push([
                            { value: result[p].name, type: "string" },
                            { value: users[u], type: "string" },
                            {
                              value:
                                new Date(result[p].participants[u][h].date) +
                                "",
                              type: "string",
                            },
                            {
                              value: result[p].participants[u][h].hours,
                              type: "number",
                            },
                          ]);
                          console.log(result[p].participants[u][h]);
                        }
                      }
                    }
                  }
                }
              }
            }
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);
            res.status(200).json({
              filename: "general-ledger-Q1",
              sheet: {
                data: cellSheet,
              },
            });
          });
      });
  });
});

//gets all hours of a person
router.get("/user/:uid/:id", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.uid != req.auth.userId) {
    let err = new Error("Invalid request for account fetch");
    err.status = 401;
    return next(err);
  }
  let schema = {
    showInactive: joi.boolean(),
  };

  joi.validate(req.body, schema, function (err) {
    if (err) {
      let err = new Error("Invalid field: display name 3 to 50 alpanumeric");
      err.status = 400;
      return next(err);
    }
    req.db.collection.findOne(
      { type: "USER_TYPE", _id: ObjectId(req.params.id) },
      function (err, doc) {
        let name;
        if (err) {
          err.status = 400;
          return next(err);
        }
        name = doc.name;
        req.db.collection
          .find({ type: "PROJECT_TYPE" })
          .toArray(function (err, result) {
            if (err) {
              err.status = 400;
              return next(err);
            }
            let returns = { name: name };
            for (let i in result) {
              if (result[i].participants[req.params.id]) {
                let temp = result[i].participants[req.params.id];
                for (let j in temp) {
                  temp[j].name = result[i].name;
                }
                returns = Object.assign(returns, temp);
              }
            }
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);
            res.status(200).json(returns);
          });
      }
    );
  });
});

//gets all hours of all persons yes persons not people
router.get(
  "/user/all/why/:uid",
  authHelper.checkAuth,
  function (req, res, next) {
    // Verify that the passed in id to delete is the same as that in the auth token
    if (req.params.uid != req.auth.userId) {
      let err = new Error("Invalid request for account fetch");
      err.status = 401;
      return next(err);
    }
    let schema = {
      showInactive: joi.boolean(),
    };

    joi.validate(req.body, schema, function (err) {
      if (err) {
        let err = new Error("Invalid field: display name 3 to 50 alpanumeric");
        err.status = 400;
        return next(err);
      }
      req.db.collection
        .find({ type: "USER_TYPE" })
        .toArray(function (err, doc) {
          let name;
          if (err) {
            err.status = 400;
            return next(err);
          }
          let returnss = [];
          for (let i in doc) {
            let name;
            name = doc[i].name;
            let id = doc[i]._id;
            req.db.collection
              .find({ type: "PROJECT_TYPE" })
              .toArray(function (err, result) {
                if (err) {
                  err.status = 400;
                  return next(err);
                }
                let returns = { name: name };
                for (let i in result) {
                  if (result[i].participants[id]) {
                    let temp = result[i].participants[id];
                    for (let j in temp) {
                      temp[j].name = result[i].name;
                    }
                    returns = Object.assign(returns, temp);
                  }
                }
                returnss.push(returns);
              });
          }
          setTimeout(function () {
            res.header("Cache-Control", "no-cache, no-store, must-revalidate");
            res.header("Pragma", "no-cache");
            res.header("Expires", 0);
            res.status(200).json(returnss);
          }, 500);
        });
    });
  }
);

//gets a project by id
router.get("/:id/:pid", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for account fetch");
    err.status = 401;
    return next(err);
  }
  req.db.collection.findOne(
    { type: "PROJECT_TYPE", _id: ObjectId(req.params.pid) },
    function (err, doc) {
      if (err) {
        err.status = 400;
        return next(err);
      }
      let xferProfile = {
        name: doc.name,
        date: doc.date,
        isActive: doc.isActive,
        participants: doc.participants,
      };

      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", 0);
      res.status(200).json(xferProfile);
    }
  );
});

//Sets activity/name
router.put("/:id/:pid", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for account update");
    err.status = 401;
    return next(err);
  }

  // TODO: Maybe clear leading and trailing whitespace?

  // TODO: Maybe screen for illegal values?

  //TODO sanity checks on data
  //TODO let schema =
  let schema = {
    name: joi.string().alphanum().min(3).max(50), //TODO whitespace?
    isActive: joi.boolean(),
    comment: joi.string().allow(""),
    startDate: joi.date(),
    endDate: joi.date(),
  };

  joi.validate(req.body, schema, function (err) {
    if (err) {
      err.status = 400;
      return next(err);
    }
    //TODO if not working make for each parm
    function cb(err, result) {
      if (err) {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("POSSIBLE USER PUT CONTENTION ERROR");
        console.log(err);
        err.status = 400;
        return next(err);
      }
      if (result.ok !== 1) {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("POSSIBLE USER PUT CONTENTION ERROR");
        console.log(result);
        let error = new Error("USER PUT FAILURE");
        err.status = 409;
        return next(err);
      }
      //TODO NODE2Process update
      //res.status(200).json(result.value);
    }
    if (req.body.name) {
      req.db.collection.findOneAndUpdate(
        {
          type: "PROJECT_TYPE",
          _id: ObjectId(req.params.pid),
        },
        {
          $set: {
            name: req.body.name,
          },
        },
        { returnOriginal: false },
        cb
      );
    }
    if (req.body.comment) {
      req.db.collection.findOneAndUpdate(
        {
          type: "PROJECT_TYPE",
          _id: ObjectId(req.params.pid),
        },
        {
          $set: {
            comment: req.body.comment,
          },
        },
        { returnOriginal: false },
        cb
      );
    }
    if (req.body.startDate) {
      req.db.collection.findOneAndUpdate(
        {
          type: "PROJECT_TYPE",
          _id: ObjectId(req.params.pid),
        },
        {
          $set: {
            startDate: req.body.startDate,
          },
        },
        { returnOriginal: false },
        cb
      );
    }
    if (req.body.endDate) {
      req.db.collection.findOneAndUpdate(
        {
          type: "PROJECT_TYPE",
          _id: ObjectId(req.params.pid),
        },
        {
          $set: {
            endDate: req.body.endDate,
          },
        },
        { returnOriginal: false },
        cb
      );
    }
    if (typeof req.body.isActive !== "undefined") {
      req.db.collection.findOneAndUpdate(
        {
          type: "PROJECT_TYPE",
          _id: ObjectId(req.params.pid),
        },
        {
          $set: {
            isActive: req.body.isActive,
            endDate: Date.now(),
          },
        },
        { returnOriginal: false },
        cb
      );
    }
  });
});

//edits an hour
router.put("/:id/:pid/:hid", authHelper.checkAuth, function (req, res, next) {
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for account deletion");
    err.status = 401;
    return next(err);
  }
  let schema = {
    date: joi.date(),
    hours: joi.number().min(0.5).max(24),
    comment: joi.string().allow(""),
  };

  joi.validate(req.body, schema, function (err) {
    if (err) {
      //let err = new Error("Invalid field: display name 3 to 50 alpanumeric");
      err.status = 400;
      return next(err);
    }
    if (req.body.comment) {
      req.db.collection.findOneAndUpdate(
        { type: "PROJECT_TYPE", _id: ObjectId(req.params.pid) },
        {
          $set: {
            ["participants." +
            req.params.id +
            "." +
            req.params.hid +
            ".comment"]: req.body.comment,
          },
        },
        function (err, doc) {
          if (err) {
            err.status = 400;
            return next(err);
          }
        }
      );
    }
    if (req.body.hours) {
      req.db.collection.findOneAndUpdate(
        { type: "PROJECT_TYPE", _id: ObjectId(req.params.pid) },
        {
          $set: {
            ["participants." + req.params.id + "." + req.params.hid + ".hours"]:
              req.body.hours,
          },
        },
        function (err, doc) {
          if (err) {
            err.status = 400;
            return next(err);
          }
        }
      );
    }
    if (req.body.date) {
      req.db.collection.findOneAndUpdate(
        { type: "PROJECT_TYPE", _id: ObjectId(req.params.pid) },
        {
          $set: {
            ["participants." + req.params.id + "." + req.params.hid + ".date"]:
              req.body.date,
          },
        },
        function (err, doc) {
          if (err) {
            err.status = 400;
            return next(err);
          }
        }
      );
    }
  });
});

module.exports = router;

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
