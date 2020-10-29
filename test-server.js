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

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const TEMPLATE_FORM = process.env.TEMPLATE_FORM;

const client = new pg.Client(DATABASE_URL);
app.set('view engine', 'ejs');


// -------------- ROUTES ------------------

app.get('/login', loginPage);
app.get('/login/session', loginSessionAuto);
app.post('/login/session', loginSessionManual);
app.get('/admin', adminPage);
app.post('/admin/create', adminCreate);
app.get('/graph', graphPage);
app.get('/survey', surveyPage);

// -------------- CONSTRUCTORS ------------------

function FORM(obj) {
  this.id = obj.id;
  this.url = obj.url;
  this.title = obj.title
  this.count = obj.count
}

app.get('/', (req, res) => {
  if (req.cookies && req.cookies.jotform)
    res.redirect('/login/session');
  else
    res.redirect('/login');
});

function loginPage(req, res) {
  res.clearCookie('jotform');
  res.render('pages/login');
}

// called when a user inputs their API key from the /login page, and is redirected to /login/session via POST
function loginSessionManual(req, res) {
  loginSession(req, res, req.body.key);
}

// called when a user navigates to the / homepage, but is redirected to /login/session via GET
function loginSessionAuto(req, res) {
  loginSession(req, res, req.cookies.jotform);
}

function loginSession(req, res, key) {
  let URL = `https://api.jotform.com/user?apiKey=${key}`;

  superagent.get(URL)
    .then(result => {
      res.cookie('jotform', key);
      res.redirect('/admin');
    })
    .catch(err => {
      res.clearCookie('jotform');
      res.redirect('/login');
    });
}

function adminPage(req, res) {
  let url = `https://api.jotform.com/user/forms`;
  console.log(`REQ COOKIE JOTFORM: ${req.cookies.jotform}`);
  superagent.get(url)
    .set('APIKEY', `${req.cookies.jotform}`)
    .then(data => {
      let content = data.body.content;
      console.log(`FORMS LISTSINGS ${JSON.stringify(content)}`);
      let forms = content.filter(element => {
        if (element.status === 'ENABLED') {
          return new FORM(element);
        }
      });
      res.render('pages/admin.ejs', { forms: forms });
    })
}

function adminCreate(req, res) {
  let key = req.cookies.jotform;
  let title = req.body.newSurvey;

  let cloneURL = `https://api.jotform.com/form/${TEMPLATE_FORM}/clone?apiKey=${key}`;

  superagent.post(cloneURL)
    .then(result => {

      let id = result.body.content.id;


      let setTitleURL = `https://api.jotform.com/form/${id}/properties?apiKey=${key}`;

      superagent.put(setTitleURL)
        .set('properties', { 'pagetitle': `${title}` })
        .then(() => {
          console.log(`SUCCESS setting title to ${title}`);
        })
        .catch(err => {
          console.log(`FAILURE to set title to ${title}`);
          console.error(err);
        });

    })
    .catch(err => {
      console.log('FAILURE cloning form');
      console.error(err)
    });

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
  .then(() => {
    app.listen(PORT, () => {
      console.log(`------- Listening on port : ${PORT} --------`);
    });
  })
  .catch(err => console.error(err));
