
var express = require('express');
var router = express.Router();
var Contract_Table = require('../models').Contract;
var Alert_Table = require('../models').Alert;
var User_Table = require('../models').User;
var Invoice_Table = require('../models').Invoice;
const middleware = require('../middleware');
const moment = require('moment');

function toYYYYMMDD(original) {
    var momentObj = moment(original, 'DD/MM/YYYY');
    var momentString = momentObj.format('YYYY-MM-DD'); // 2016-07-15

    return momentString;
};

/********** contract rest api start ****************/
router.get('/contract', function (req, res) {
    Contract_Table.findAll().then(contracts => {
        if (contracts) {
            res.status(200).json(contracts);
        }
        else
            res.status(404).json('Not Found');
    }).catch((err) => {
        res.status(422).json(err.name);
    });

});

router.get('/contract/:id', function (req, res) {
    Contract_Table.findById(req.params.id).then((contract) => {
        if (contract) {
            res.status(200).json(contract);
        }
        else
            res.status(404).json('Not Found');
    }).catch(err => {
        res.status(422).json(err.name);
    });
});

router.put('/contract/:id', function (req, res) {
    if (req.body.date_buy)
        req.body.date_buy = toYYYYMMDD(req.body.date_buy);
    if (req.body.date_open)
        req.body.date_open = toYYYYMMDD(req.body.date_open);
    if (req.body.date_close)
        req.body.date_close = toYYYYMMDD(req.body.date_close);
    Contract_Table.findById(req.params.id).then(contract => {
        if (contract) {
            contract.update(req.body).then(result => {
                if (result) {
                    middleware.activityTracker(req, res, result.number);
                    res.status(200).json('updated contract data');
                }
                else
                    res.status(422).json("Can't Update");
            });
        }
        else {
            res.status(404).json('Not Found');
        }
    }).catch((err) => {
        res.status(422).json(err.name);
    });
});

router.post('/contract', function (req, res) {
    if (req.body.date_buy && req.body.date_open && req.body.date_close) {
        req.body.date_buy = toYYYYMMDD(req.body.date_buy);
        req.body.date_open = toYYYYMMDD(req.body.date_open);
        req.body.date_close = toYYYYMMDD(req.body.date_close);

        Contract_Table.create(req.body).then((contract) => {
            middleware.activityTracker(req, res);
            res.status(200).json(contract.id);
            // res.status(200).json('created new contract');
        }).catch(err => {
            res.status(422).json(err.name);
        });
    } else {
        res.status(422).json('Please check input data');
    }
});

router.delete('/contract/:id', function (req, res) {
    Contract_Table.findById(req.params.id).then(contract => {
        if (contract) {
            contract.destroy().then(result => {
                if (result) {
                    middleware.activityTracker(req, res, result.number);
                    res.status(200).json('delete contract data');
                }
                else
                    res.status(422).json("Can't Delete");
            });
        } else {
            res.status(404).json('Not Found');
        }
    }).catch((err) => {
        res.status(422).json(err.name);
    });

});

router.get('/test/:id', function (req, res) {
    middleware.activityTracker(req, res);
    res.json(req.params)
})
/********** contract rest api end ****************/



/********** alert rest api start ****************/

router.get('/alert', function (req, res) {
    Alert_Table.findAll({ include: [{ model: Invoice_Table }] }).then(alert => {
        if (alert)
            res.status(200).json(alert);
        else
            res.status(404).json('Not Found');
    }).catch((err) => {
        console.log(err);
        res.status(422).json(err.name);
    });

});

router.get('/alert/:id', function (req, res) {
    Alert_Table.findById(req.params.id, { include: [{ model: Invoice_Table }] }).then(alert => {
        if (alert)
            res.status(200).json(alert);
        else
            res.status(404).json('Not Found');
    }).catch(err => {
        res.status(422).json(err.name);
    });
});

router.put('/alert/:id', function (req, res) {
    Alert_Table.update(req.body, { where: { id: req.params.id } }).then((result) => {
        if (result[0])
            res.status(200).json('updated alert data');
        else
            res.status(404).json('Not Found');
    }).catch(err => {
        res.status(422).json(err.name);
    });

});

router.post('/alert', function (req, res) {
    Alert_Table.create(req.body).then(alert => {
        res.status(200).json('created new alert');
    }).catch(err => {
        res.status(422).json(err.name);
    });

});

router.delete('/alert/:id', function (req, res) {
    Alert_Table.destroy({ where: { id: req.params.id } }).then(result => {
        if (result)
            res.status(200).json('delete alert data');
        else
            res.status(404).json('Not Found');
    }).catch((err) => {
        res.status(422).json(err.name);
    });

});

/********** alert rest api end ****************/



/********** invoice rest api start ************/

router.get('/invoice', function (req, res) {
    Invoice_Table.findAll().then(invoice => {
        if (invoice)
            res.status(200).json(invoice);
        else
            res.status(404).json('Not Found');
    }).catch((err) => {
        res.status(422).json(err.name);
    });

});

router.get('/invoice/:id', function (req, res) {
    Invoice_Table.findById(req.params.id).then(invoice => {
        if (invoice)
            res.status(200).json(invoice);
        else
            res.status(404).json('Not Found');
    }).catch(err => {
        res.status(422).json(err.name);
    });
});


/********** invoice rest api end ************/


/********** Activity rest API start ************/


router.get('/activity', function (req, res) {
    Invoice_Table.findAll().then(invoice => {
        if (invoice)
            res.status(200).json(invoice);
        else
            res.status(404).json('Not Found');
    }).catch((err) => {
        res.status(422).json(err.name);
    });

});

router.get('/activity/:id', function (req, res) {
    Invoice_Table.findById(req.params.id).then(invoice => {
        if (invoice)
            res.status(200).json(invoice);
        else
            res.status(404).json('Not Found');
    }).catch(err => {
        res.status(422).json(err.name);
    });
});

router.post('/activity', function (req, res) {
    Invoice_Table.create(req.activity).then(activity => {
        res.status(200).json('created new activity');
    }).catch(err => {
        res.status(422).json(err.name);
    });
});
/********** Activity rest API end ************/
module.exports = router;

