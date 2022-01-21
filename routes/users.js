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
// Create a User in the Collection.
// Does not require session authentication at this point as this is the registration step.
//
router.post("/", function postUser(req, res, next) {
  // Password must be 7 to 15 characters in length and contain at least one numeric digit and a special character
  let schema = {
    name: joi
      .string()
      .regex(/^[a-zA-Z\s]*$/)
      .required(), //TODO whitespace?
    email: joi.string().email().min(7).max(50).required(),
    password: joi
      .string()
      .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*.])[a-zA-Z0-9!@#$%^&.*]{7,15}$/)
      .required(),
    memberType: joi.number().integer().min(0).max(4),
  };

  joi.validate(req.body, schema, function (err) {
    if (err) {
      let err2 = new Error(
        "Invalid field: display name 3 to 50 alpanumeric, valid email, password 7 to 15 (one number, one special character)"
      );
      err.status = 400;
      return next(err);
    }

    req.db.collection.findOne(
      // TODO: Make sure database has USER_TYPE in it
      { type: "USER_TYPE", email: req.body.email },
      function (err, doc) {
        if (err) {
          err.status = 400;
          return next(err);
        }

        if (doc) {
          let err = new Error("Email account already registered");
          err.status = 403;
          return next(err);
        }

        let xferUser = {
          type: "USER_TYPE",
          name: req.body.name,
          email: req.body.email,
          passwordHash: null,
          date: Date.now(),
          completed: false,
          role: 0, // TODO: is this the best way? somebody has to change it later for non-user (admin) roles.
          // TODO: Currently thinking that non-ordinary user roles will be created in admin portal
          memberType: req.body.memberType,
          isActive: true,
          managingProjects: [],
          performingProjects: [],
          //TODO ARE THERE OTHERS?
        };

        bcrypt.hash(req.body.password, 10, function getHash(err, hash) {
          if (err) {
            err.status = 400;
            return next(err);
          }

          xferUser.passwordHash = hash;
          req.db.collection.insertOne(
            xferUser,
            function createUser(err, result) {
              if (err) {
                err.status = 400;
                return next(err);
              }
              // TODO: If node2 process needs to send an email to project manager, call it here.
              res.status(201).json(result.ops[0]);
            }
          );
        });
      }
    );
  });
});

router.post("/:id", authHelper.checkAuth, function postUser(req, res, next) {
  // Password must be 7 to 15 characters in length and contain at least one numeric digit and a special character
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for account deletion");
    err.status = 401;
    return next(err);
  }

  let schema = {
    name: joi
      .string()
      .regex(/^[a-zA-Z\s]*$/)
      .required(), //TODO whitespace?
    email: joi.string().email().min(7).max(50).required(),
    password: joi
      .string()
      .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*.])[a-zA-Z0-9!@#$%^&.*]{7,15}$/)
      .required(),
    role: joi.number().integer().min(0).max(4),
    memberType: joi.number().integer().min(0).max(4),
  };

  joi.validate(req.body, schema, function (err) {
    if (err) {
      let err2 = new Error(
        "Invalid field: display name 3 to 50 alpanumeric, valid email, password 7 to 15 (one number, one special character)"
      );
      err.status = 400;
      return next(err);
    }

    req.db.collection.findOne(
      // TODO: Make sure database has USER_TYPE in it
      { type: "USER_TYPE", email: req.body.email },
      function (err, doc) {
        if (err) {
          err.status = 400;
          return next(err);
        }

        if (doc) {
          let err = new Error("Email account already registered");
          err.status = 403;
          return next(err);
        }

        let xferUser = {
          type: "USER_TYPE",
          name: req.body.name,
          email: req.body.email,
          passwordHash: null,
          date: Date.now(),
          completed: false,
          role: req.body.role ? req.body.role : 0, // TODO: is this the best way? somebody has to change it later for non-user (admin) roles.
          // TODO: Currently thinking that non-ordinary user roles will be created in admin portal
          memberType: req.body.memberType,
          isActive: true,
          managingProjects: [],
          performingProjects: [],
          //TODO ARE THERE OTHERS?
        };

        bcrypt.hash(req.body.password, 10, function getHash(err, hash) {
          if (err) {
            err.status = 400;
            return next(err);
          }

          xferUser.passwordHash = hash;
          req.db.collection.insertOne(
            xferUser,
            function createUser(err, result) {
              if (err) {
                err.status = 400;
                return next(err);
              }
              // TODO: If node2 process needs to send an email to project manager, call it here.
              res.status(201).json(result.ops[0]);
            }
          );
        });
      }
    );
  });
});

router.delete("/:uid/:id", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.uid != req.auth.userId) {
    let err = new Error("Invalid request for account deletion");
    err.status = 401;
    return next(err);
  }

  req.db.collection.deleteOne({
    type: "USER_TYPE",
    _id: ObjectId(req.params.id),
  });

  // MongoDB should do the work of queuing this up and retrying if there is a conflict, according to their documentation.
  // This actually requires a write lock on their part.
  // TODO: Rethink where this should happen next... probably only an administrator should be able to "fully" delete a user from the system.
  // TODO: Another option would be to not bother the adminstor... but instead
  // Just copy the user's profile / data over into an "archive" in the db,
  // and then ACTUALLY perform the deletion operation as below.
  // req.db.collection.findOneAndDelete(
  //   { type: "USER_TYPE", _id: ObjectId(req.auth.userId) },
  //   function (err, result) {
  //     if (err) {
  //       console.log("+++POSSIBLE USER DELETION CONTENTION ERROR?+++ err:", err);
  //       err.status = 409;
  //       return next(err);
  //     } else if (result.ok != 1) {
  //       console.log(
  //         "+++POSSIBLE USER DELETION CONTENTION ERROR?+++ result:",
  //         result
  //       );
  //       let err = new Error("Account deletion failure");
  //       err.status = 409;
  //       return next(err);
  //     }

  //     res.status(200).json({ msg: "User Deleted" });
  //   }
  // );
});

router.get("/:id", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.id != req.auth.userId) {
    let err = new Error("Invalid request for account fetch");
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
      let xferProfile = {
        name: doc.name,
        email: doc.email,
        date: doc.date,
        role: doc.role,
        memberType: doc.memberType,
        isActive: doc.isActive,
        managingProjects: doc.managingProjects,
        performingProjects: doc.performingProjects,
        performingProjects: doc.performingProjects,
      };

      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", 0);
      res.status(200).json(xferProfile);
    }
  );
});

router.get("/", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  req.db.collection.find({ type: "USER_TYPE" }).toArray(function (err, result) {
    if (err) {
      console.log(result);
      err.status = 400;
      return next(err);
    }
    let returns = [];
    for (let i in result) {
      returns.push({
        name: result[i].name,
        email: result[i].email,
        date: result[i].date,
        role: result[i].role,
        id: result[i]._id,
        memberType: result[i].memberType,
        isActive: result[i].isActive,
        managingProjects: result[i].managingProjects,
        performingProjects: result[i].performingProjects,
      });
    }
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    res.status(201).json(returns);
  });
});

router.put("/:uid/:id", authHelper.checkAuth, function (req, res, next) {
  // Verify that the passed in id to delete is the same as that in the auth token
  if (req.params.uid != req.auth.userId) {
    let err = new Error("Invalid request for account update");
    err.status = 401;
    return next(err);
  }

  // TODO: Maybe clear leading and trailing whitespace?

  // TODO: Maybe screen for illegal values?

  //TODO sanity checks on data
  //TODO let schema =
  let schema = {
    name: joi.string().regex(/^[a-zA-Z\s]*$/), //TODO whitespace?
    email: joi.string().email().min(7).max(50),
    password: joi
      .string()
      .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/),
    memberType: joi.number().integer().min(0).max(4),
    role: joi.number().integer().min(0).max(2),
    isActive: joi.boolean(),
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
      // //TODO NODE2Process update
      // res.status(200).json(result.value);
    }
    if (req.body.name) {
      req.db.collection.findOneAndUpdate(
        {
          type: "USER_TYPE",
          _id: ObjectId(req.auth.userId),
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
    if (req.body.email) {
      req.db.collection.findOneAndUpdate(
        {
          type: "USER_TYPE",
          _id: ObjectId(req.auth.userId),
        },
        {
          $set: {
            email: req.body.email,
          },
        },
        { returnOriginal: false },
        cb
      );
    }
    if (req.body.password) {
      bcrypt.hash(req.body.password, 10, function getHash(err, hash) {
        if (err) {
          err.status = 400;
          return next(err);
        }
        req.db.collection.findOneAndUpdate(
          {
            type: "USER_TYPE",
            _id: ObjectId(req.auth.userId),
          },
          {
            $set: {
              passwordHash: hash,
            },
          },
          { returnOriginal: false },
          cb
        );
      });
    }
    if (req.body.memberType) {
      req.db.collection.findOneAndUpdate(
        {
          type: "USER_TYPE",
          _id: ObjectId(req.auth.userId),
        },
        {
          $set: {
            memberType: req.body.memberType,
          },
        },
        { returnOriginal: false },
        cb
      );
    }
    if (typeof req.body.isActive !== "undefined") {
      req.db.collection.findOneAndUpdate(
        {
          type: "USER_TYPE",
          _id: ObjectId(req.auth.userId),
        },
        {
          $set: {
            isActive: req.body.isActive,
          },
        },
        { returnOriginal: false },
        cb
      );
    }
    if (req.body.role) {
      req.db.collection.findOne(
        { type: "USER_TYPE", _id: ObjectId(req.auth.userId) },
        function (err, doc) {
          if (err) {
            err.status = 400;
            return next(err);
          }
          if (doc.role < 2) {
            let err = new Error("Permission level is not high enough");
            err.status = 403;
            return next(err);
          }
          req.db.collection.findOneAndUpdate(
            {
              type: "USER_TYPE",
              _id: ObjectId(req.auth.userId),
            },
            {
              $set: {
                role: req.body.role,
              },
            },
            { returnOriginal: false },
            cb
          );
        }
      );
    }
  });
});

module.exports = router;
