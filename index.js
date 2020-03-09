var express = require('express');
var exphbs  = require('express-handlebars');
var path = require('path');
var bodyParser = require('body-parser');

//Todas las vistas se definen aquí
const appRouter = require('./app');
//Todos los recursos o endpoints de backend, se definen aquí
const apiRouter = require('./api');

var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'app/views'));
app.use('/assets', express.static(__dirname + '/app/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//La vista principal de la aplicación se sirve en el directorio raíz '/'
app.use('/', appRouter);
//Todos los recursos o endpoints de backend se sirven bajo el prefijo '/api'
app.use('/api', apiRouter);

app.listen(process.env.PORT || 3000);