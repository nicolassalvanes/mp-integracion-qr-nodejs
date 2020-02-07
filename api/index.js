const router = require('express').Router();
const request = require('request');
const uuidv1 = require('uuid/v1');
const util = require('util');

var db = [];

const ACCESS_TOKEN = 'TEST-1783827438008150-020716-8ff29f683360bea4930c7e5950c54b16-523903831',
      USER_ID = '523903831',
      POS_ID = 'default',
      MP_ORDER_URL = 'https://api.mercadopago.com/mpmobile/instore/qr/'+USER_ID+'/'+POS_ID+'?access_token='+ACCESS_TOKEN,
      NOTIFICATION_CALLBACK_URL = 'https://workshopqr.requestcatcher.com/test',
      MP_MERCHANT_URL = 'https://api.mercadopago.com/merchant_orders/%d?access_token='+ACCESS_TOKEN;

      
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

router.get('/status', (req, res) => {
    var externalReference = req.query.external_reference;

    return res.status(200).json({
        "status": externalReference in db ? db[externalReference] : 'unknown'
    })
});

module.exports = router;