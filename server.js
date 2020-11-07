'use strict';

require('dotenv').config();
require('ejs');

// ------------ DEPENDENCIES --------------

const cors = require('cors');
const express = require('express');
const superagent = require('superagent');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

// ------------- CONFIG -------------------

const app = express();
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

// -------------- CONSTRUCTORS ------------------

function Form(obj) {
  this.id = obj.id;
  this.created_at = obj.created_at;
  this.count = obj.count;
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
              let theForm = new Form(form);
              return theForm;
            }
          })
          console.log(forms);
          res.render('pages/admin', {forms:forms, limit:limit});
        })
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
}

function deleteSurvey(req, res) {
  let apiKey = req.cookies.jotform;
  let id = req.params.id;
  // let SQL = `SELECT adminID FROM admin WHERE apiKey=$1;`;
  // let values = [key];

  // return client.query(SQL, values)
  //   .then(() => {
  //     let SQL = `UPDATE forms SET closed=$1 WHERE id=$2;`;
  //     let values = [true, id];
  //     client.query(SQL, values)
  //       .then(() => {
          let deleteFormURL = `https://api.jotform.com/form/${id}?apiKey=${apiKey}`;
          superagent.delete(deleteFormURL)
            .then(() => {
              res.redirect('/admin');
            })
    //     })
    // })
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


      // this is the total numbers of questions asked, we'll set that value in reduce below, so we can use it even later
      let total = 0;
      // create an array of each persons sum total of TRUE answers
      let people = submissions.map( person => {
        let keys = Object.keys(person.answers);
        return keys.reduce((acc, key, idx)=>{
          console.log(person.answers[key]);
          total = idx; // keep setting that total as the idx
          return acc + parseInt(person.answers[key].answer === 'TRUE' ? 1 : 0);
        }, 0);
      });

      // set up an empty array with a length of 'total', which we set earlier
      let surveyResults = [];
      surveyResults.length = total;

      // now lets loop through our 'people' array, and increment the corresponing surveyResults idx
      for(let i=0; i<people.length; i++)
        if(!surveyResults[people[i]])
          surveyResults[people[i]] = 1;
        else
          surveyResults[people[i]]++;

      // pass those results through the page/graph ejs
      res.render('pages/graph', { surveyResults : surveyResults });
    })
    .catch(err => console.error(err));
}

// ------------ CLONE A NEW SURVEY ------------------------------

function createSurvey(req, res) {
  let apiKey = req.cookies.jotform;
  let URL = `https://api.jotform.com/form/${TEMPLATE_FORM}/clone?apiKey=${apiKey}`

  console.log('TEMPLATE FORM', TEMPLATE_FORM);

  superagent.post(URL)
    .then( () => {
      res.redirect('/admin');
    })
    .catch(err => console.error(err));
}

// ---- DO A SURVEY (this is the route associated with a link that is shared to users) ----

function doSurvey(req, res) {
  let id = req.params.id;
  res.render('pages/survey', { id : id });
}

// ------------ START LISTENING ON A PORT -----------------------

app.listen(PORT, () => {
  console.log(`------- Listening on port : ${PORT} --------`);
});
