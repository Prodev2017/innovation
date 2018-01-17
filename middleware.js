var db = require('./models');

function findUserBySession(sid, cond) {
  return new Promise(function (resolve, reject) {
    db.Session.findById(sid).then(function (sess) {
      if (!sess) {
        return reject();
      }

      sess.getUser().then(function (usr) {
        if (!usr) {
          return reject();
        }

        if ('function' === typeof (cond) && !cond(usr)) {
          return reject();
        }

        resolve(usr);
      });
    });
  });
}

function authCheck(req, res, next) {
  if (!req.session || !req.session.sid) {
    return res.redirect('/login');
  }

  findUserBySession(req.session.sid)
    .then(function (usr) {
      res.locals = {
        user: usr,
      };
      next();
    })
    .catch(function () {
      res.redirect('/login');
    });
}

function writerCheck(req, res, next) {
  if (!req.session || !req.session.sid) {
    return res.redirect('/login');
  }

  findUserBySession(req.session.sid, (usr) => 'Reader' != usr.role)
    .then(function (usr) {
      res.locals = {
        user: usr,
      };
      next();
    })
    .catch(function () {
      res.redirect('/login');
    });
}

function managerCheck(req, res, next) {
  if (!req.session || !req.session.sid) {
    return res.redirect('/login');
  }

  findUserBySession(req.session.sid, (usr) => 'Manager' == usr.role)
    .then(function (usr) {
      res.locals = {
        user: usr,
      };
      next();
    })
    .catch(function () {
      res.redirect('/login');
    });
}

function activityTracker(req, res, number = '') {
  var actions = {
    'POST': 'Added',
    'PUT': 'Edited',
    'DELETE': 'Deleted'
  };

  var type = req.path.split('/');

  var detail = {
    "type": type[1],
    "id": req.body.number ? req.body.number : number,
    "action": actions[req.method]
  };

  console.log(req.session.sid);
  findUserBySession(req.session.sid)
    .then(function (usr) {
      var data = {
        'time_performed': new Date(),
        'user_id': usr.id,
        'detail': JSON.stringify(detail)
      };
      db.Activity.create(data).then(activity => {
        db.Activity.findAll({ order: [['time_performed', 'DESC']], include: [{ model: db.User }] }).then(allData => {
          req.app.io.sockets.emit('activity', allData);
          req.app.io.sockets.emit('notification', allData.filter(data => data.id > usr.lastread_activity_id));
        });
      });
    });
}

module.exports = {
  authCheck,
  writerCheck,
  managerCheck,
  activityTracker,
  findUserBySession
};
