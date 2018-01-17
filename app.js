const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const tabData = require('./tabledata');
const middleware = require('./middleware');
const moment = require('moment');
const Sequelize = require('sequelize');
var sequelize = new Sequelize(require('./config/config.json').development);
const os = require('os');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const csvParser = require('csv').parse;

const srvport = process.env.PORT || process.env.VCAP_APP_PORT || 3000;
const csvDir = process.env.DIR_CSV || os.tmpdir() + path.sep + 'csv';

var db = require('./models');
var routeApi = require('./routes/api');
var routeUser = require('./routes/user');

var app = express();
const mockUsers = [
  {
    id: 5,
    name: 'John Doe',
    email: 'test@example.com',
    passwd: 'justlogmein',
    hashPassword: '095d59538de17d0a3c566611741fa967c565865b37ae11dc77ae3cc7f03e304d'
  }
];

/* Setup static files dir */
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* Setup session support */
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  //cookie: { secure: true }
}))

/* API call */
app.use('/api', routeApi);

/* Setup EJS & view layouts support */
app.use(expressLayouts);
app.set('view engine', 'ejs');

/* User management */
app.use('/users', routeUser);

var server = app.listen(srvport, function () {
  console.log(`Example app listening on port ${srvport}!`);
})

/** real time web socket.io set  */
var io = require('socket.io').listen(server);
var connected_users = [];
// Handle connection
io.sockets.on('connection', function (socket) {
  console.log("Connected succesfully to the socket ...");

  socket.on('userconnected', function (user_id, lastread_activity_id) {
    if (user_id && lastread_activity_id) {
      var userInfo = {};
      userInfo.id = user_id;
      userInfo.activityId = lastread_activity_id;
      userInfo.clientId = socket.id;
      connected_users.push(userInfo);
      db.Activity.findAll({ order: [['time_performed', 'DESC']], include: [{ model: db.User }] }).then(allData => {
        socket.emit('activity', allData);
        socket.emit('notification', allData.filter(data => data.id > lastread_activity_id));
      });
    }
  });

  socket.on('notification', function (client_id) {
    var slected_user = connected_users.filter(item => {
      return item.clientId === client_id;
    });
    if (slected_user) {
      db.Activity.findAll({
        limit: 1,
        order: [['id', 'DESC']]
      }).then(function (entries) {
        db.User.findById(slected_user[0].id).then(user => {
          if (user) {
            user.update({ 'lastread_activity_id': entries[0].id }).then(result => {
              socket.emit('notification', []);
            });
          }
        });
      });
    }
  });

  socket.on('disconnect', function (data) {
    connected_users.map((index, user) => {
      if (user.clientId === socket.id) {
        connected_users.splice(index, 1);
      }
    })
  });
});

app.io = io;

app.get('/', middleware.authCheck, function (req, res) {
  res.locals.title = 'Dashboard';
  res.render('dashboard', {});
});

app.get('/table', middleware.authCheck, function (req, res) {
  res.locals.title = 'Table';
  res.render('table', {});
});

app.get('/login', function (req, res) {
  if (req.session.sid) {
    return res.redirect('/');
  }

  res.render('user/login', { layout: 'layout-login' });
});

app.post('/login', function (req, res) {
  db.User.findByEmail(req.body.email, function (user, err) {
    if (user) {
      console.log(user);
      if (user.password === db.User.hashPassword(req.body.passwd)) {
        console.log('SAME PWD');
        console.log(user.id);
        db.Session.create({ 'user_id': user.id }).then((session) => {
          req.session.sid = session.id;
          session_id = session.id;
          res.redirect('/');
        }).catch((err) => {
          console.log('session error', err);
          res.redirect('/login');
        })
      } else {
        console.log('password invaild');
        res.redirect('/login');
      }
    } else {
      console.log('wrong user');
      res.redirect('/login');
    }
  }).catch((err) => {
    console.log(err);
    res.redirect('/login');
  });
  // let match = mockUsers.filter((usr) => ((usr.email == req.body.email) && (usr.passwd == req.body.passwd)));
  // if (!match.length) {
  //   res.redirect('/login');
  // }

  // let user = match[0];
  // req.session.user_id = user.id;
  // res.redirect('/');
});

app.get('/logout', middleware.authCheck, function (req, res) {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/stub.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Page';
  res.render('stub');
});

app.get('/performance_globale.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Performance globale';
  let scope = {};

  let promises = [];

  // fetch spot amount
  promises.push(new Promise(function (resolve, reject) {
    sequelize.query("SELECT SUM(amount) as Amount FROM Payments WHERE type='Spot';", { type: sequelize.QueryTypes.SELECT})
    .then(count => {
      return resolve(Number(count[0]['Amount']));
    })
    .catch(error => {
      return reject(error);
    });
  }));

  // fetch contract amount
  promises.push(new Promise(function (resolve, reject) {
    sequelize.query("SELECT SUM(amount) as Amount FROM Payments WHERE type='Contract';", { type: sequelize.QueryTypes.SELECT})
    .then(count => {
      return resolve(Number(count[0]['Amount']));
    })
    .catch(error => {
      return reject(error);
    });
  }));

  // fetch average amount
  promises.push(new Promise(function (resolve, reject) {
    sequelize.query("SELECT AVG(amount) as average FROM Payments;", { type: sequelize.QueryTypes.SELECT})
    .then(average => {
      return resolve(Number(average[0]['average']));
    })
    .catch(error => {
      return reject(error);
    });
  }));

  // fetch average rate
  promises.push(new Promise(function (resolve, reject) {
    sequelize.query("SELECT AVG(rate) as avgRate FROM Payments;", { type: sequelize.QueryTypes.SELECT})
    .then(avgRate => {
      return resolve(Number(avgRate[0]['avgRate']));
    })
    .catch(error => {
      return reject(error);
    });
  }));

  promises.push(new Promise(function (resolve, reject) {
    sequelize.query("SELECT SUM(amount) as allAmounts FROM Invoices", { type: sequelize.QueryTypes.SELECT})
    .then(responce => {
      return resolve(responce[0]['allAmounts']);
    })
    .catch(error => {
      return reject(error);
    });
  }));

  Promise.all(promises)
    .then(response => {
      scope.totalDesSpot = response[0];
      scope.totalDesContract = response[1];
      scope.average = response[2];
      scope.avgRate = response[3];
      scope.allAmounts = response[4];

      scope.montantTotalAchete = Number(scope.totalDesSpot) + Number(scope.totalDesContract);
      scope.reste = scope.montantTotalAchete - Number(scope.allAmounts);

      res.render('performance_globale', scope);
    })
    .catch(error => {
    });

});

app.get('/pilotage.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Page';

  promises.push(new Promise(function (resolve, reject) {
    sequelize.query("SELECT SUM(amount) AS amount FROM payments WHERE TYPE='Contract'", { type: sequelize.QueryTypes.SELECT})
    .then(result => {
      return resolve(Number(result[0]['amount']));
    })
    .catch(error => {
      return reject(error);
    });
  }));

  Promise.all(promises)
    .then(response => {
      scope.dfcamount=response[0];

      res.render('pilotage', scope);
    })
    .catch(error => {
    });

  
});

app.get('/gestion.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Page';
  res.render('gestion');
});

app.get('/gestion30.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Page';
  res.locals.moment = moment;
  res.locals.invoices = [];

  db.Invoice.findAll({
    group: 'id',
    includeIgnoreAttributes: false,
    attributes: {
      include: [
        [db.sequelize.fn('sum', db.sequelize.col('Payments.amount')), 'coverage']
      ]
    },
    include: [
      {
        model: db.Payment,
        as: 'Payments',
      }
    ],
  }).then(invoices => {
    res.locals.invoices = invoices;
    res.render('gestion30');

  }).catch((err) => {

  });

});

app.get('/gestion60.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Page';
  res.render('gestion60');
});

app.get('/gestion90.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Page';
  res.render('gestion90');
});

app.get('/couverture.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Page';
  res.render('couverture');
});

app.get('/a-traiter.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Page';
  res.render('traiter');
});

app.get('/statistics.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Statistics';
  res.render('statistics');
});

app.get('/mes_alertes.html', middleware.authCheck, function (req, res) {
  res.locals.title = 'Mes alertes';
  res.render('mes_alertes');
});

app.get('/me', middleware.authCheck, function (req, res) {
  res.locals.title = 'Mon profil';
  res.render('user/profile');
});

/* CSV FS watcher task */
chokidar.watch(csvDir, {
  ignored: /(^|[\/\\])\../,
  awaitWriteFinish: true
}).on('add', function (fpath) {
  console.log(`File ${fpath} was added`);
  if (!path.extname(fpath).match(/^\.csv$/ig)) {
    fs.unlinkSync(fpath);
    return;
  }

  var readable = fs.createReadStream(fpath);
  var parser = csvParser({
    delimiter: ';',
    skip_empty_lines: true,
    relax_column_count: true
  });

  const mapping = {
    0: 'number',
    1: 'supplier',
    2: 'purpose',
    3: 'amount',
    4: {
      propname: 'date_paid',
      process: val => moment(val, 'DD/MM/YYYY').toDate()
    },
    5: 'rate',
    6: {
      propname: 'paystatus',
      process: val => (val === 'Payée')
    }
  };

  var headpass = false;

  parser.on('readable', function () {
    var props = {};
    var data;

    while (data = parser.read()) {
      /* Ignore 1st (heading) line of CSV */
      if (!headpass) {
        headpass = true;
        return;
      }

      data.forEach(function (val, idx) {
        var mapper = mapping[idx];
        var pval = val;
        var propname;

        if ('object' === typeof (mapper)) {
          propname = mapper.propname;

          if ('function' === typeof (mapper.process)) {
            pval = mapper.process(val);
          }
        } else {
          propname = mapper;
        }

        props[propname] = pval;
      });

      if (!props.number) {
        return;
      }

      /* Create new or update existing invoice */
      db.Invoice.findOne({
        where: { number: props.number }
      })
        .then(function (invoice) {
          if (!invoice) {
            return db.Invoice.create(props);
          }

          invoice.update(props);
        });
    }
  });

  var unlinkOnFinish = function () {
    fs.unlinkSync(fpath);
  };

  parser.on('finish', unlinkOnFinish)
    .on('error', unlinkOnFinish);

  readable.pipe(parser);
});
