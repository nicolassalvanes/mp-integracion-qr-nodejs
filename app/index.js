const router = require('express').Router();

/**
 * Home page: muestra todos los ítems disponibles para comprar
 */
router.get('/', function (req, res) {
    res.render('home');
});

/**
 * Detail page: muestra la información del ítem seleccionado y permite crear la órden de pago
 */
router.post('/detail', function (req, res) {

    let data = req.body;

    //Base URL para correcta comunicación con el backend desde el frontend
    data.baseurl = req.protocol+'://'+req.get('host');

    res.render('detail', data);
});

module.exports = router;