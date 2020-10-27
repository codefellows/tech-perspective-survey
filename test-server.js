'use strict';

require('dotenv').config();

require('ejs');

const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

const client = new pg.Client(DATABASE_URL);

app.get('/', adminLogin);
app.post('/loggingIn', loggingIn);
app.get('/admin', adminPage);


function adminLogin(req, res) {
  let APIkey = JSON.parse(localStorage.getItem('APIkey'));

  if(APIkey)
    res.redirect('/admin/');
  else
    res.redirect('/login');
}

function loggingIn(req, res) {
  console.log(`REQUEST BODY ${req.body}`);
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
