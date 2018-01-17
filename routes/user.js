var express = require('express');
var router = express.Router();
var UserModel = require('../models').User;
const middleware = require('../middleware');

router.get('/', middleware.managerCheck, function (req, res) {
  res.locals.title = "Manage d'utilizateurs";

  UserModel.findAll().then(function(users) {
    res.locals.users = users;
    res.render('user/list');
  });
});

router.post('/', middleware.managerCheck, function (req, res) {
  UserModel.create({
    name: req.body.name,
    role: req.body.role,
    email: req.body.email,
    password: UserModel.hashPassword(req.body.password)
  }).then(usr => {
    res.redirect('/users');
  });
});

router.get('/add', middleware.managerCheck, function (req, res) {
  res.locals.title = "Manage d'utilizateurs";

  res.locals.userInfo = null;
  res.render('user/form');
});

router.get('/:id(\\d+)', middleware.managerCheck, function (req, res) {
  res.locals.title = "Manage d'utilizateurs";

  UserModel.findById(req.params.id).then(function(user) {
    res.locals.userInfo = user;
    res.render('user/form');
  });
});


router.post('/:id(\\d+)', middleware.managerCheck, function (req, res) {
  UserModel.findById(req.params.id)
  .then(function(user) {
    var updData = {
      name: req.body.name,
      role: req.body.role,
      email: req.body.email
    };

    if (req.body.password && req.body.password == req.body.password2) {
      updData.password = UserModel.hashPassword(req.body.password);
    }

    return user.update(updData);
  })
  .then(function() {
    res.redirect('/users');
  });
});

module.exports = router;
