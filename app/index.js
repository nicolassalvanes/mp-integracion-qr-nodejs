const router = require('express').Router();
const request = require('request');
const propertiesReader = require('properties-reader');
const properties = propertiesReader('./config/properties.conf');

const POS_QR_URL = properties.get('pos_qr_url');

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

    const baseurl = req.protocol+'://'+req.get('host');

    var data = req.body;

    var options = {
        uri: baseurl+'/api/order',
        method: "POST",
        json: true,
        body: {
            "title": data.title,
            "unit_price": data.price,
            "quantity": data.unit,
            "picture_url": baseurl+data.img
        }
    }
	
    request(options, function(err, response, body) {

        if (err || response.statusCode !== 200) {
            return res.status(500).json({ "error": err });

        } else {
            data.external_reference = response.body.order.external_reference;
            data.baseurl = baseurl;
            data.qr_img = POS_QR_URL;

            res.render('detail', data);
        }
    });
});

module.exports = router;