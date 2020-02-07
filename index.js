var express = require('express');
var exphbs  = require('express-handlebars');
var path = require('path');
var bodyParser = require('body-parser');

const appRouter = require('./app');
const apiRouter = require('./api');

var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'app/views'));
app.use('/assets', express.static(__dirname + '/app/assets'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', appRouter);
app.use('/api', apiRouter);

app.listen(process.env.PORT || 3000);