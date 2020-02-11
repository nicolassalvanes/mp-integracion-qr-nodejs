const router = require('express').Router();
const request = require('request');
const uuidv1 = require('uuid/v1');
const util = require('util');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('./api/config/properties.conf');

/**
 * In-memory "database" for storing each order status by his external reference id
 * (Real database implementation required on production)
 */
var db = [];

const ACCESS_TOKEN = properties.get('access_token'),
      USER_ID = properties.get('user_id'),
      POS_ID = properties.get('pos_id'),
      NOTIFICATION_CALLBACK_URL = properties.get('notification_callback_url'),
      MP_ORDER_URL = properties.get('mp_order_basepath')+USER_ID+'/'+POS_ID+'?access_token='+ACCESS_TOKEN,
      MP_MERCHANT_URL = properties.get('mp_merchant_basepath')+'%d?access_token='+ACCESS_TOKEN;

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
            "notification_url": NOTIFICATION_CALLBACK_URL,
            "external_reference": externalReference,
            "items": [{
                "title": req.body.title,
                "currency_id": "ARS",
                "unit_price": req.body.unit_price,
                "quantity": req.body.quantity
            }]
        }
    }
	
    request(options, function(err, response, body) {

        if (err || response.statusCode !== 200) {
            return res.status(500).json({ "error": err });

        } else {
            db[externalReference] = 'unknown';

            return res.status(200).json({
                "order": response.body
            });
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