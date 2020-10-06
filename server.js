'use strict';

// dependancies and global variables
require('dotenv').config();
require('ejs');
const cors = require('cors');
const PORT = process.env.PORT;
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const { render } = require('ejs');
const { response } = require('express');
const app = express();
const dataBaseUrl = process.env.DATABASE_URL;
const client = new pg.Client(dataBaseUrl);
client.on('error', (error) => {
  console.log(error);
});

var arrayOfSurveyObject = [];
var currentClassName = ['untitled'];

//app
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//routes
app.get('/', renderHomePage);
app.get('/survey', renderSurvey);
app.post('/defineSession', handleChangeSession);
app.post('/plot/:survey_session', plotHandler);
app.get('/history', handleAndDisplayHistory);
app.get('/graph', renderGraph);
app.get('/error', handleError);
app.get('/getdata', getDataHandler)
app.get('*', handleUndefinedRoute);

//route functions
function renderHomePage(request, response) {
  response.render('pages/index', { surveyName: currentClassName[(currentClassName.length - 1)] });
}
function renderSurvey(request, response) {
  response.render('pages/survey');
}

function getDataHandler(request, response) {
  let today = todaysDate();
  let arrayOfresultsForm1 = apiCall('hogWCP3L');
  let arrayOfresultsForm2 = apiCall('RkNsVV0o');
  let temp = [arrayOfresultsForm1, arrayOfresultsForm2];
  Promise.all(temp).then(arrayComingIn => {
    let finalArray = [];
    for (let i = 0; i < arrayComingIn[0].length; i++) {
      for (let j = 0; j < arrayComingIn[1].length; j++) {
        if (arrayComingIn[0][i].id === arrayComingIn[1][j].id) {
          let add = arrayComingIn[0][i].value + arrayComingIn[1][j].value;
          finalArray.push(add);
        }
      }
    }
    console.log(finalArray);
    let countedSurveyResults = counter(finalArray);
    arrayOfSurveyObject.push(new Survey(currentClassName[currentClassName.length - 1], today, countedSurveyResults));
    addNewSurveytoDB(arrayOfSurveyObject[arrayOfSurveyObject.length - 1]);
  })
    .then(() => {
      response.status(200).redirect('/graph');
    })
    .catch(err => {
      console.log('error', err)
    });
}

function todaysDate() {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, '0');
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();
  let hour = String(today.getHours()).padStart(2, '0');
  var time = hour + ":" + String(today.getMinutes()).padStart(2, '0');
  today = `${yyyy}-${mm}-${dd}T${time}:00`;
  return today;
}

function counter(array) {
  let emptyArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let bucketArr = emptyArray.map((value, bucket) => {
    let count = 0;
    array.forEach((yesValue) => {
      if ((yesValue) === bucket) {
        count++
      }
    })
    return count;
  })
  return bucketArr
}

function apiCall(form) {
  let date = new Date();
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0');
  let yyyy = date.getFullYear();
  let hour = String(date.getHours()).padStart(2, '0') - 1;
  var time = hour + ":" + String(date.getMinutes()).padStart(2, '0');
  let oneHourAgo = `${yyyy}-${mm}-${dd}T${time}:00`;
  let key = process.env.TYPE_FORM_KEY;
  let arrayOfResultsObjects = [];
  const longKey = `Bearer ${key}`;
  const url = `https://api.typeform.com/forms/${form}/responses?since=${oneHourAgo}`;
  return superagent.get(url)
    .set('Authorization', longKey)
    .then(results => {
      let items = JSON.parse(results.text).items
      for (let i = 0; i < items.length; i++) {

        let total = 0;
        for (let j = 0; j < items[i].answers.length; j++) {
          if (items[i].answers[j].choice.label === 'True') {
            total++;
          }
        }
        let obj = {};
        obj['id'] = items[i].metadata.network_id;
        obj['value'] = total;
        arrayOfResultsObjects.push(obj);
      }
      console.log(arrayOfResultsObjects);
      return arrayOfResultsObjects;
    })
    .catch(err => {
      console.log('error', err)
    })
}

function handleChangeSession(request, response) {
  const currentSurveySession = request.body.sessionName;
  currentClassName.push(currentSurveySession);
  response.status(200).redirect('/');
}

function handleAndDisplayHistory(request, response) {
  //get previous data from database
  const sql = 'SELECT * FROM survey_results;';
  client.query(sql)
    .then(incomingPreviousResults => {
      const allPreviousResults = incomingPreviousResults.rows;
      allPreviousResults.forEach(value => {
        let found = false;
        for (var i = 0; i < arrayOfSurveyObject.length; i++) {
          if (arrayOfSurveyObject[i].survey_session === value.survey_session) {
            found = true;
            break;
          }
        }
        if (found === false) {
          const numArr = JSON.parse(value.results_array);
          arrayOfSurveyObject.push(new Survey(value.survey_session, value.date_conducted, numArr));
        }
      })

      response.render('pages/pastresults', { allResultsArr: arrayOfSurveyObject });
    })
    .catch((error) => {
      console.log('An eror has occured: ', error);
      response.status(500).redirect('pages/error');
    })
}

function renderGraph(request, response) {
  const sql = 'SELECT * FROM survey_results;';
  client.query(sql)
    .then(data => {
      const totalRows = data.rows.length;
      const dataObjectWantToApply = { survey_session: data.rows[totalRows - 1].survey_session, results_array: JSON.parse(data.rows[totalRows - 1].results_array) };
      response.render('pages/graph', { key: dataObjectWantToApply });
    })
}

function handleError(request, response) {
  console.log('An error has occured.');
  response.render('pages/error');
}

function plotHandler(request, response) {
  console.log(request.body);
  const dataObjectWantToApply = { survey_session: request.body.survey_session, results_array: request.body.results_array };

  response.render('pages/plot', { key: dataObjectWantToApply });
}

function handleUndefinedRoute(request, response) {
  response.status(404).send('#404: Page not found.')
}


//constructor function
function Survey(className, date_conducted, resultsArray) {
  this.survey_session = className;
  this.date_conducted = date_conducted;
  this.results_array = resultsArray || [];
}

function addNewSurveytoDB(obj) {
  const resultsJson = JSON.stringify(obj.results_array);
  const sql = 'INSERT INTO survey_results (survey_session, date_conducted, results_array) VALUES ($1, $2, $3)';
  const safeValues = [obj.survey_session, obj.date_conducted, resultsJson];
  console.log(safeValues);
  client.query(sql, safeValues)
}


//server is on
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('Sorry, something went wrong. We were unable to connect to the postres SQL database.', error);
    response.status(500).redirect('pages/error');
  });
