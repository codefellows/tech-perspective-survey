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
app.post('/survey/create', createSurvey);
app.get('/survey/:id', doSurvey);
app.post('/past_results', showPastResults);


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
              // console.log('!!!!!!!!!!!', theForm)
              return theForm;
            }
          })
          // console.log(forms);
          res.render('pages/admin', {forms:forms, limit:limit});
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
}

function saveDatabaseDeleteForm(req, res) {
  let apiKey = req.cookies.jotform;
  let id = req.params.id;
  let saveURL = `https://api.jotform.com/form/${id}/submissions?apiKey=${apiKey}`;
  console.log('console logging URL ', saveURL)
  let counter = 0;
  superagent.get(saveURL)
    .then(result => {
      console.log('before puppies', result.body);
      let array = result.body.content;
      console.log('puppies are cute', array);
      for(let i = 0; i < array.length; i++) {
        let surveyArray = array[i].answers
        console.log('another string', surveyArray)
        let keys = Object.keys(surveyArray);
        keys.forEach(key => {
          if(surveyArray[key].answer === 'TRUE') {
            counter ++;
//create array of survey users displaying each users true answers
//see graph function for inspo
          }
        })
        console.log('this is the counter', counter);
      }
    })

    .then(() => {
      let URL = 'https://api.jotform.com/user/forms';
      superagent.get(URL)
        .set('APIKEY', apiKey)
        .then(result => {
          let array = result.body.content;
          console.log('Here is a string', counter);
          let form = '';
          array.forEach(index =>{
            if (index.id === id) {
              form = index;
            }
          });
          console.log('console logging form', form);
          let theForm = new Form(counter, form);
          let SQL = `INSERT INTO divtech (username, survey_id, created_at, count, true_answer) VALUES ($1, $2, $3, $4, $5);`;
          let values = [theForm.username, theForm.survey_id, theForm.created_at, theForm.count, theForm.true_answer];
          client.query(SQL, values)
            .then(results => {
              console.log('what is resuslts', results);
            })
        })
    })
}

function deleteSurvey(req, res) {
  let apiKey = req.cookies.jotform;
  let id = req.params.id;
  let deleteFormURL = `https://api.jotform.com/form/${id}?apiKey=${apiKey}`;
  saveDatabaseDeleteForm(req,res);
  superagent.delete(deleteFormURL)
    .then(() => {
      res.redirect('/admin');
    })
    .catch(err => console.error(err));
}

// ------------ SHOW THE GRAPH OF A SURVEY ----------------------

//increments new surveys that do not have previous results ---- increments anything else that only has a single entry
//if survey count result has more than one entry it does not increment.

function showResult(req, res) {
  console.log(req.params.id, 'lskdjflsdkfkdf');
  let id = req.params.id;
  let key = req.cookies.jotform;
  let URL = `https://api.jotform.com/form/${id}/submissions?apiKey=${key}`;
  // Collect all the submissions for a given form
  superagent.get(URL)
    .then(result => {
      let submissions = result.body.content;
      console.log(result.body.content, 'lsdjfdklsfjlkslkdsjf')

      // this is the total numbers of questions asked, we'll set that value in reduce below, so we can use it even later
      let total = 0;
      // create an array of each persons sum total of TRUE answers
      let people = submissions.map( person => {
        let keys = Object.keys(person.answers);
        return keys.reduce((acc, key, idx)=>{
          // console.log(person.answers[key]);
          total = idx; // keep setting that total as the idx
          return acc + (person.answers[key].answer === 'TRUE' ? 1 : 0);
        }, 0);
      });
      console.log('here is the people array', people);
      // set up an empty array with a length of 'total', which we set earlier
      let surveyResults = [];
      surveyResults.length = total;

      // now lets loop through our 'people' array, and increment the corresponing surveyResults idx
      for(let i=0; i<people.length; i++) {
        if(!surveyResults[people[i]]) surveyResults[people[i]] = 1;
        else surveyResults[people[i]]++;
      }
      // pass those results through the page/graph ejs
      console.log(surveyResults);
      res.render('pages/graph', { surveyResults });
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
  console.log('console logging id', id);
  res.render('pages/survey', { id : id });
}


// ------------ START LISTENING ON A PORT -----------------------
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`------- Listening on port : ${PORT} --------`);
    });
  })
