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
  console.log(ex);
}

app.use((req, res, next) => {
  res.locals.GOOGLE_MAPS_API = config.GOOGLE_MAPS_API;
  res.locals.OAUTH_TOKEN = config.OAUTH_TOKEN;
  next();
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
