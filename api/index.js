const router = require('express').Router();

/**
 * Se recomienda usar esta variable global como "base de datos" para guardar 
 * la relación entre el id de la órden y su estado actual.
 * 
 * (Aclaración: En un entorno productivo se requiere almacenar esta información de una manera más confiable)
 */
let db = [];

/**
 * Este recurso debe crear una órden de pago presencial
 */
router.post('/order', (req, res) => {
    
});

/**
 * Completar el resto de los endpoints necesarios para la integración
 */

module.exports = router;