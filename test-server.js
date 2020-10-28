'use strict';

require('dotenv').config();
require('ejs');

// ------------ DEPENDENCIES --------------

const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


// ------------- CONFIG -------------------

const app = express();
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new pg.Client(DATABASE_URL);
app.set('view engine', 'ejs');


// -------------- ROUTES ------------------
app.get('/', adminLogin);
app.get('/login', loginPage);
app.post('/logging-in', loggingIn);
app.get('/admin', adminPage);
app.get('/graph', graphPage);
app.get('/survey', surveyPage);
app.post('/admin/create', cloneForm);


// -------------- ROUTES ------------------
// app.get('/', (req, res) => res.redirect('/login'));


app.get('/', (req, res) => {
  if(req.cookies && req.cookies.jotform)
    res.redirect('/login/session');
  else
    res.redirect('/login');
});

app.get('/login', loginPage);
app.get('/login/session', loginSessionAuto);
app.post('/login/session', loginSessionManual);
app.get('/admin', adminPage);

function loginPage(req, res) {
  res.clearCookie('jotform');
  res.render('pages/login');
}

// called when a user inputs their API key from the /login page, and is redirected to /login/session via POST
function loginSessionManual(req, res) {
  loginSession(req, res, req.body.adminAPIkey);
}

// called when a user navigates to the / homepage, but is redirected to /login/session via GET
function loginSessionAuto(req, res) {
  loginSession(req, res, req.cookies.jotform)
}

function loginSession(req, res, key) {
  let URL = `https://api.jotform.com/user?apiKey=${key}`;

  superagent.get(URL)
    .then( result => {
      console.log(JSON.stringify(result));
      res.cookie('jotform', key);
      res.redirect('/admin');
    })
    .catch(err => {
      res.clearCookie('jotform');
      res.redirect('/login');
    });
}

function adminPage(req, res) {
  res.render('pages/admin', { key: req.cookies.jotform });
}

function graphPage(req, res) {
  res.render('pages/graph');
}

function surveyPage(req, res) {
  res.render('pages/survey');
}

function cloneForm(req, res) {
  // get API key from cookie
  let key = req.cookies.jotform;
  let URL = `https://api.jotform.com/form/203010344934040/clone?apiKey=${key}`;

  superagent.post(URL)
    .then(result => {
      res.render('pages/admin');
    })
    .catch(err => console.error(err));

  // reachout to jotform through superagent clone Tahmina's form
  // rerender admin
}

client.connect()
  .then( () => {
    app.listen(PORT, () => {
      console.log(`------- Listening on port : ${PORT} --------`);
    });
  })
  .catch(err => console.error(err));
