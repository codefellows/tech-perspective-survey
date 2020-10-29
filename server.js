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
const { query } = require('express');


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

app.get('/result/:id', showResult);

// -------------- CONSTRUCTORS ------------------

function Form(obj) {
  this.id = obj.id;
  this.url = obj.url;
  this.created_at= obj.created_at;
  this.count = obj.count;
}

app.get('/', (req, res) => {
  if(req.cookies && req.cookies.jotform)
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

// called from either the automatic or the manual login
function loginSession(req, res, key) {
  let URL = `https://api.jotform.com/user?apiKey=${key}`;

  superagent.get(URL)
    .then( () => {
      res.cookie('jotform', key);
      res.redirect('/admin');
    })
    .catch( () => {
      res.clearCookie('jotform');
      res.redirect('/login');
    });
}

function adminPage(req, res) {
  let URL = 'https://api.jotform.com/user/forms';
  let key = req.cookies.jotform;

  superagent.get(URL)
    .set('APIKEY', key)
    .then(result => {
      let forms = result.body.content.filter(form => {
        if(form.status === 'ENABLED') {
          let theForm = new Form(form);
          console.log(theForm);
          return theForm;
        }
      })
      res.render('pages/admin', {forms:forms});
    })
    .catch(err => console.error(err));
}

function showResult(req, res) {
  let id = req.params.id;
  let key = req.cookies.jotform;
  let URL = `https://api.jotform.com/form/${id}/submissions?apiKey=${key}`;

  superagent.get(URL)
    .then(result => {
      let submissions = result.body.content;

      // create an array of each persons sum total of TRUE answers
      let people = submissions.map( person => {
        let keys = Object.keys(person.answers);
        return keys.reduce((acc, key)=>{
          console.log(person.answers[key]);
          return acc + parseInt(person.answers[key].answer === 'YES' ? 1 : 0);
        }, 0);
      });

      res.render('pages/results', {people : people});
    })
    .catch(err => console.error(err));
}

app.listen(PORT, () => {
  console.log(`------- Listening on port : ${PORT} --------`);
});

// Not using a db currently
// client.connect()
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`------- Listening on port : ${PORT} --------`);
//     });
//   })
//   .catch(err => console.error(err));
