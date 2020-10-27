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


function adminLogin(req, res) {
  let APIkey = JSON.parse(localStorage.getItem('APIkey'));

  if(APIkey)
    res.redirect('/admin/');
  else
    res.redirect('/login');
}

function loggingIn(req, res) {
  console.log(`TESTING REQUEST BODY ${JSON.stringify(req.body)}`);

  // req.body.APIkey

  // Verify that this key exists on JOTFORM
  // save this key to localstorage as { APIkey : value }
  // redirect to the admin page, which will then read that local storage key

}

function loginPage(req, res) {
  res.render('pages/login');
}

function adminPage(req, res) {
  // res.render

}

client.connect()
  .then( () => {
    app.listen(PORT, () => {
      console.log(`------- Listening on port : ${PORT} --------`);
    });
  })
  .catch(err => console.error(err));
