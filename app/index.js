const router = require('express').Router();

const request = require('request');

/**
 * Store home page: displays all available items.
 */
router.get('/', function (req, res) {
    res.render('home');
});

/**
 * Item detail page: requests order creation for selected item, 
 * and displays payment info with current order status
 */
router.post('/detail', function (req, res) {

    const api_baseurl = req.protocol+'://'+req.get('host')+'/api';

    var data = req.body;

    var options = {
        uri: api_baseurl+'/order',
        method: "POST",
        json: true,
        body: {
            "title": data.title,
            "unit_price": data.price,
            "quantity": data.unit
        }
    }
	
    request(options, function(err, response, body) {

        if (err || response.statusCode !== 200) {
            return res.status(500).json({ "error": err });

        } else {
            data.external_reference = response.body.order.external_reference;
            data.api_baseurl = api_baseurl;

            res.render('detail', data);
        }
    });
});

module.exports = router;