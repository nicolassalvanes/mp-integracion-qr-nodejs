const router = require('express').Router();
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
 * Item detail page: displays selected item info and allows to create an order and pay
 */
router.post('/detail', function (req, res) {

    let data = req.body;

    data.baseurl = req.protocol+'://'+req.get('host');
    data.qr_img = POS_QR_URL;

    res.render('detail', data);
});

module.exports = router;