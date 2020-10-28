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

function loginSession(req, res, key) {
  let URL = `https://api.jotform.com/user?apiKey=${key}`;

  superagent.get(URL)
    .then( result => {
      res.cookie('jotform', key);
      res.redirect('/admin');
    })
    .catch(err => {
      res.clearCookie('jotform');
      res.redirect('/login');
    });
}

function adminPage(req, res) {

  let apiKey = req.cookies.jotform;
  let userURL = `https://api.jotform.com/user?apiKey=${apiKey}`;
  let SQL;

  // get the username (and some extra data) associated with this apiKey
  // superagent.get(userURL)
  //   .then( results => {

  // let userResults = results.body;
  // console.log('userResults: ', userResults);
  // let username = userResults.content.username;
  // let limit = userResults['limit-left']; // had to put in brackets, because of the - symbol

  let username = 'skrambelled'; // just to bypass using up API calls

  // ok, we have username, now lets get the db adminID correlated with that username
  SQL = `SELECT adminID FROM admin WHERE username=$1;`;
  let values = [username];

  return client.query(SQL, values)
    .then( result => {

      // username is not in the db, render admin page with no forms
      if(!result.rows.length)
        res.render('pages/admin', { forms : [] });

      // username is in the db, lets get their forms
      let adminID = result.rows[0].adminid;
      SQL = `SELECT * from FORMS WHERE adminID=$1;`;
      values = [parseInt(adminID)];
      return client.query(SQL, values)
        .then( result => {
          let openForms = result.rows.filter(form => !form.closed);
          let closedForms = result.rows.filter(form => form.closed);

          res.render('pages/admin', {
            openForms: openForms,
            closedForms: closedForms
          });
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));

  // }) // end superagent .then
  // .catch(err => console.error(err));
}

function adminCreate(req, res) {
  let apiKey = req.cookies.jotform;
  let title = req.body.newSurvey;

  let cloneURL = `https://api.jotform.com/form/${TEMPLATE_FORM}/clone?apiKey=${apiKey}`;

  superagent.post(cloneURL)
    .then( result => {

      let content = result.body.content;

      let jotformId = content.id;
      let username = content.username;
      let timestamp = Date.now();
      let totalQuestions = 21; // hard coded hack, because deadlines
      let totalPeople = 0; // 0 people have taken this survey so far, its just been created

      // We will insert all this data rather than modifying existing data, because each
      // form we clone is 100% always going to be a brand new form
      let SQL = 'INSERT INTO forms (adminID, title, ) VALUES ($1, $2, $3, $4, $5, $6, $7);';
      let values = [username, title, apiKey, jotformId, timestamp, totalPeople, totalQuestions];

      return client.query(SQL, values)
        .then(() => res.redirect('/admin')) // redirect to the admin page, which will display all this stuff
        .catch(err => console.error(err));

      // a hacky way to set a pagetitle for a form, since we cannot set a title.
      // however, lets try this with a db instead (see above)

      // let setTitleURL = `https://api.jotform.com/form/${id}/properties?apiKey=${key}`;

      // superagent.put(setTitleURL)
      //   .send( { "properties" : { "pagetitle" : title }} )
      //   .then( () => {
      //     res.redirect('/admin');
      //   })
      //   .catch(err => {
      //     console.error(err);
      //   });

    })
    .catch(err => {
      console.error(err);
    });

}

function graphPage(req, res) {
  res.render('pages/graph');
}

function surveyPage(req, res) {
  res.render('pages/survey');
}

client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`------- Listening on port : ${PORT} --------`);
    });
  })
  .catch(err => console.error(err));
