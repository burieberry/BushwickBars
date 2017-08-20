const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');
nunjucks.configure('views', { noCache: true });

const app = express();
app.set('view engine', 'html');
app.engine('html', nunjucks.render);

app.use('/', express.static(path.join(__dirname, 'node_modules')));
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.render('index');
});

let config = process.env;
try {
  config = require('./config.json');
}
catch (ex) {

}

app.use((req, res, next) => {
  res.locals.GOOGLE_API_KEY = config.GOOGLE_MAPS_API;
  res.locals.OAUTH_TOKEN = config.OAUTH_TOKEN;
  res.locals.CLIENT_ID = config.CLIENT_ID;
  res.locals.CLIENT_SECRET = config.CLIENT_SECRET;
  next();
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
