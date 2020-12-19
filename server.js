'use strict';

require('dotenv').config();
require('ejs');

// ------------ DEPENDENCIES --------------
const pg =require('pg');
const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const { request } = require('http');

// ------------- CONFIG -------------------

const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

const PORT = process.env.PORT;
const TEMPLATE_FORM = process.env.TEMPLATE_FORM;

app.set('view engine', 'ejs');



// -------------- ROUTES ------------------

app.get('/login', loginPage);
app.get('/login/session', loginSessionAuto);
app.post('/login/session', loginSessionManual);
app.get('/admin', adminPage);
app.delete('/delete/:id', deleteSurvey);
app.get('/result/:id', showResult);
app.get('/database/:id', showDatabase);
app.post('/survey/create', createSurvey);
app.get('/survey/:id', doSurvey);
app.post('/past_results', showPastResults);
app.delete('/database/:id', deleteDatabase);
app.get('/past_results', showPastResults);


// -------------- CONSTRUCTORS ------------------

function Form(trueAnswer, obj) {
  this.username = obj.username;
  this.survey_id = obj.id;
  this.created_at = obj.created_at;
  this.count = obj.count;
  this.true_answer = trueAnswer;
}

// -------- LOGIN ROUTES ------------------------------------------

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

// -------------- SHOW THE ADMIN PAGE ----------------------------

// we are making an assumption here, that you have a good API key with read/write access
function adminPage(req, res) {
  let apiKey = req.cookies.jotform;
  let URL = `https://api.jotform.com/user?apiKey=${apiKey}`;

  superagent.get(URL)
    .then(result => {
      let limit = result.body['limit-left'];
      console.log('limit: ', limit);

      let URL = 'https://api.jotform.com/user/forms';
      superagent.get(URL)
        .set('APIKEY', apiKey)
        .then(result => {
          let forms = result.body.content.filter(form => {
            if(form.status === 'ENABLED') {
              let theForm = new Form(null, form);
              return theForm;
            }
          })
          res.render('pages/admin', {forms:forms, limit:limit});
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
}

// ------- SAVES SURVEY TO DATABASE -------------------
function saveDatabaseDeleteForm(req, res) {
  let apiKey = req.cookies.jotform;
  let id = req.params.id;
  let saveURL = `https://api.jotform.com/form/${id}/submissions?apiKey=${apiKey}`;
  let counter = 0;
  let surveyResultsString = '';
  superagent.get(saveURL)
    .then(result => {
      let submissions = result.body.content;

      // create an array of each persons sum total of TRUE answers
      let people = submissions.map( person => {
        let keys = Object.keys(person.answers);
        return keys.reduce((acc, key)=>{
          return acc + (person.answers[key].answer === 'TRUE' ? 1 : 0);
        }, 0);
      });

      let surveyResults = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      // now lets loop through our 'people' array, and increment the corresponing surveyResults
      for(let i=0; i<people.length; i++) {
        surveyResults[people[i] -1]++;
      }
      surveyResultsString = surveyResults.join(',');
    })
    .then(() => {
      let URL = 'https://api.jotform.com/user/forms';
      superagent.get(URL)
        .set('APIKEY', apiKey)
        .then(result => {
          let array = result.body.content;
          let form = '';
          array.forEach(index =>{
            if (index.id === id) {
              form = index;
            }
          });
          let theForm = new Form(counter, form);
          let SQL = `INSERT INTO divtech (username, survey_id, created_at, count, true_answer) VALUES ($1, $2, $3, $4, $5);`;
          let values = [theForm.username, theForm.survey_id, theForm.created_at, theForm.count, surveyResultsString];
          client.query(SQL, values)
            .then(results => {
              console.log('what is resuslts', results);
            })
        })
    })
}

// ------------ DELETES SURVEY AND SAVES TO DATABASE -----------------
function deleteSurvey(req, res) {
  let apiKey = req.cookies.jotform;
  let id = req.params.id;
  let deleteFormURL = `https://api.jotform.com/form/${id}?apiKey=${apiKey}`;

  //----------DELETES FORM SAVES TO DATABASE--------------
  saveDatabaseDeleteForm(req,res);
  superagent.delete(deleteFormURL)
    .then(() => {
      res.redirect('/admin');
    })
    .catch(err => console.error(err));
}

// ------------ SHOW THE GRAPH OF A SURVEY ----------------------

function showResult(req, res) {
  let id = req.params.id;
  let key = req.cookies.jotform;
  let URL = `https://api.jotform.com/form/${id}/submissions?apiKey=${key}`;

  // Collect all the submissions for a given form
  superagent.get(URL)
    .then(result => {
      let submissions = result.body.content;

      // create an array of each persons sum total of TRUE answers
      let people = submissions.map( person => {
        let keys = Object.keys(person.answers);
        return keys.reduce((acc, key)=>{
          return acc + (person.answers[key].answer === 'TRUE' ? 1 : 0);
        }, 0);
      });

      let surveyResults = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

      // now lets loop through our 'people' array, and increment the corresponing surveyResults
      for(let i=0; i<people.length; i++) {
        surveyResults[people[i] -1]++;
      }
      // pass those results through the page/graph ejs
      res.render('pages/graph', { surveyResults : surveyResults });
    })
    .catch(err => console.error(err));
}

//--------------------SHOW PAST SURVEY RESULTS--------------------
function showDatabase(req, res) {
  let SQL = `SELECT true_answer FROM divtech WHERE survey_id=$1;`;
  let values = [req.params.id];

  client.query(SQL, values)
    .then(results => {
      res.render('pages/graph', { surveyResults : results.rows[0] });
    })
    .catch(err => console.error(err));
}

//------------DELETE SURVEY FROM DATABASE------------------------
function deleteDatabase(req, res) {
  let SQL = `DELETE FROM divtech WHERE survey_id=$1;`;
  let values = [req.params.id];

  client.query(SQL, values)
    .then(() => {
      res.redirect('/past_results');
    })
    .catch(err => console.error(err));
}

// ------------ CLONE A NEW SURVEY ------------------------------
function createSurvey(req, res) {
  let apiKey = req.cookies.jotform;
  let URL = `https://api.jotform.com/form/${TEMPLATE_FORM}/clone?apiKey=${apiKey}`

  superagent.post(URL)
    .then( () => {
      res.redirect('/admin');
    })
    .catch(err => console.error(err));
}

// --------- SHOW LIST OF SURVEYS SAVED IN DATABASE ---------------
function showPastResults(req, res) {
  let SQL = `SELECT * FROM divtech WHERE username=$1;`;
  let values = [req.body.user];

  client.query(SQL, values)
    .then(items => {
      if( items.rows.length > 0) {
        res.status(200).render('pages/past_results', {pastResults: items.rows});
      } else {
        res.redirect('/admin');
      }
    })
    .catch(err => console.error(err));
}

// ---- DO A SURVEY (this is the route associated with a link that is shared to users) ----

function doSurvey(req, res) {
  let id = req.params.id;
  res.render('pages/survey', { id : id });
  console.log(req.params.id);
}


// ------------ START LISTENING ON A PORT -----------------------
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`------- Listening on port : ${PORT} --------`);
    });
  })
