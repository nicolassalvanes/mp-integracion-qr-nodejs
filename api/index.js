const router = require('express').Router();
const request = require('request');
const uuidv1 = require('uuid/v1');
const util = require('util');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('./config/properties.conf');

/**
 * In-memory "database" for storing each order status by his external reference id
 * (Real database implementation required on production)
 */
var db = [];

const ACCESS_TOKEN = properties.get('access_token'),
      USER_ID = properties.get('user_id'),
      POS_ID = properties.get('pos_id'),
      MP_ORDER_URL = properties.get('mp_order_basepath')+USER_ID+'/'+POS_ID+'?access_token='+ACCESS_TOKEN,
      MP_MERCHANT_URL = properties.get('mp_merchant_basepath')+'%d?access_token='+ACCESS_TOKEN,
      CURRENCY_ID = properties.get('currency_id');

/**
 * This resource creates an instore order for item payment
 */
router.post('/order', (req, res) => {
    
    var externalReference = POS_ID+'-'+uuidv1();

    var options = {
        uri: MP_ORDER_URL,
        method: "POST",
        json: true,
        body: {
            "notification_url": req.protocol+'://'+req.get('host')+'/api/notification',
            //"notification_url": "https://workshopqr.requestcatcher.com/test",
            "external_reference": externalReference,
            "items": [{
                "title": req.body.title,
                "currency_id": CURRENCY_ID,
                "unit_price": req.body.unit_price,
                "quantity": req.body.quantity,
                "picture_url": req.body.picture_url
            }]
        }
    }
	
    request(options, function(err, response, body) {

        if (err || response.statusCode !== 200) {
            console.log(err);
            console.log(response.body);
            return res.sendStatus(500);

        } else {
            db[externalReference] = 'unknown';

            return res.status(201).json({
                "order": response.body
            });
        }
    });
});

/**
 * This resource cancel an instore order
 */
router.delete('/order', (req, res) => {

    request.delete(MP_ORDER_URL, function(err, response, body) {

        if (err || (response.statusCode !== 204 && response.statusCode !== 200)) {
            console.log(err);
            console.log(response.body);
            return res.sendStatus(500);

        } else {
            return res.sendStatus(204);
        }
    });
});

/**
 * This resource receives MP notifications for each order update, then retrieve and store its current status. 
 */
router.post('/notification', (req, res) => {
    if(req.query.topic === 'merchant_order'){
        var id = req.query.id;

        var options = {
            uri: util.format(MP_MERCHANT_URL, id),
            method: "GET"
        }

        request(options, function(err, response, body) {

            if (err || response.statusCode !== 200) {
                console.log(err);
                console.log(response.body);

            } else {
                var order = JSON.parse(response.body);
                db[order.external_reference] = order.status;
            }
        });
    }
    return res.sendStatus(200);
});

/**
 * This resource returns an order last known status
 */
router.get('/status', (req, res) => {
    var externalReference = req.query.external_reference;

    return res.status(200).json({
        "status": externalReference in db ? db[externalReference] : 'unknown'
    })
});

module.exports = router;