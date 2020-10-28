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


// ------------- CONFIG -------------------

const app = express();
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json())


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


function adminLogin(req, res) {
  let APIkey = localStorage.getItem('APIkey');

  if(APIkey)
    res.redirect('/admin/');
  else
    res.render('/login', {clearAPIkey: false});
}

function loggingIn(req, res) {
  console.log(`TESTING REQUEST BODY ${JSON.stringify(req.body)}`);
  const adminKey = req.body.APIkey;
  const url = `https://api.jotform.com/user?apiKey=${adminKey}`;

  console.log(adminKey, 'console logging adminKey');
  // Verify that this key exists on JOTFORM
  superagent.get(url)
    .then(result => {
      if(result.body.responseCode === 200) {
        // save this key to localstorage as { APIkey : value }
        // localStorage.setItem('APIkey', 'adminKey');
        // redirect to the admin page, which will then read that local storage key
        res.render('/admin', {APIkey: adminKey});
      } else {
        res.render('/login', {clearAPIkey: true});
        alert('Invalid key');
      }
    })
    .catch(err => console.error(err));
}








function loginPage(req, res) {
  res.render('pages/login');
}

function adminPage(req, res) {
  // res.render

}

function graphPage(req, res) {
  res.render('pages/graph');
}

function surveyPage(req, res) {
  res.render('pages/survey')
}

client.connect()
  .then( () => {
    app.listen(PORT, () => {
      console.log(`------- Listening on port : ${PORT} --------`);
    });
  })
  .catch(err => console.error(err));
