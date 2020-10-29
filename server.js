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
app.use(methodOverride('_method'));

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
  if (req.cookies && req.cookies.jotform)
    res.redirect('/login/session');
  else
    res.redirect('/login');
});

function resultPage(req, res){
  let id = req.body.content.id;
  let key = req.cookies.jotform;
  let url = `https://api.jotform.com/form/${id}/submissions?apiKey=${key}`
  superagent.get(url)
    .then(data =>{

      // we need to see where we wanna display this 
      let Daily_API = data.body.limit-left;
      
      let contents = data.body.content
      let result = contents.map(content =>{
        let count = 0;
        let answersKey = Object.keys(content.answers);
        for(var i = 0; i < answersKey.length ; i++){
          if(content.answers.answersKey[i].answer === 'YES'){
            count++;
          }
        }
        return count;
      })
      console.log('RESULT', result);
      res.render('/pages.old/graph', {result : result});
    })
}

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

      });

      res.render('pages/admin.ejs', { forms: forms });

    })
    .catch(err => console.error(err));
}

function showResult(req, res) {
  let id = req.params.id;
  let key = req.cookies.jotform;

  let URL = `https://api.jotform.com2