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
var currentClassName = [];

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
app.get('/history', handleAndDisplayHistory);
app.get('/graph', renderGraph);
app.get('/error', handleError);
app.get('/getdata', getDataHandler)
app.get('*', handleUndefinedRoute);

//route functions
function renderHomePage(request, response) {
  response.render('pages/index');
}
function renderSurvey(request, response) {
  response.render('pages/survey');
}



function getDataHandler(request, response) {
  let today = todaysDate();
  let arrayOfresultsForm1 = apiCall('hogWCP3L');
  let arrayOfresultsForm2 = apiCall('RkNsVV0o');
  let arrayOfresultsForm3 = apiCall('foB1EGaD');
  let temp = [arrayOfresultsForm1, arrayOfresultsForm2, arrayOfresultsForm3];
  Promise.all(temp).then(array => {
    let surveyResults = array.reduce((acc, value, index) => {
      if (acc === 0) {
        acc = new Array(value.length).fill(0);
      }
      value.forEach((num, ind) => {
        acc[ind] += num;
      })
      return acc;
    }, 0);
    console.log(surveyResults)
    let countedSurveyResults = counter(surveyResults);
    arrayOfSurveyObject.push(new Survey(currentClassName[currentClassName.length - 1], today, countedSurveyResults));
    //console.log(countedSurveyResults);
    addNewSurveytoDB(arrayOfSurveyObject[arrayOfSurveyObject.length - 1]);
  })
  .then(()=>{
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
  today = `${yyyy}-${mm}-${dd}T00:00:00`;
  return today;
}

function counter(array) {
  // let countedResults = [];
  // let obj = {};
  // for (let i = 0; i < array.length; i++) {
  //   if (obj.hasOwnProperty(array[i])) {
  //     obj[array[i]] += 1;
  //   }
  //   else {
  //     obj[array[i]] = 1;
  //   }
  //   //console.log(obj);
  //   //console.log(countedResults)
  // }
  // countedResults.push(obj)
  // return countedResults;
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
  let key = process.env.TYPE_FORM_KEY;
  let arrayOfResults = [];
  const longKey = `Bearer ${key}`;
  let today = todaysDate();
  const url = `https://api.typeform.com/forms/${form}/responses?since=${today}`;
  return superagent.get(url)
    .set('Authorization', longKey)
    .then(results => {
      let items = JSON.parse(results.text).items
      for (let i = 0; i < items.length; i++) {
        let total = 0;
        for (let j = 0; j < items[i].answers.length; j++) {
          if (items[i].answers[j].boolean === true) {
            total++;
          }
        }
        arrayOfResults.push(total);
      }
      return arrayOfResults;
    })
    .catch(err => {
      console.log('error', err)
    })
}


function handleChangeSession(request, response) {
  const currentSurveySession = request.body.text;

  //console.log('request.body.text: ', request.body.text);
  // arrayOfSurveyObject.push(new Survey(currentSurveySession));
  // console.log('SurveyObject: ', arrayOfSurveyObject);
  //calling constructor with single argument of three parameters may cause problems.
  //removed this call to the instructor with comment for now.  Was for use with webhooks
  //and live updating a chart.  Right now we are focusing on single batch data API requests.
  // So instead we are just assigning a value to currentClassName for use within the API getData call handler.
  // arrayOfSurveyResults.push(new Survey(currentSurveySession));
  currentClassName.push(currentSurveySession);
  //console.log(currentClassName);
  // arrayOfSessions.push(currentSurveySession);
  // console.log('request.body: ', request.body);
  // console.log('request.body.text: ', request.body.text);
  // console.log('SurveyObject: ', arrayOfSurveyResults);
  response.status(200).render('pages/index');
}

function handleAndDisplayHistory(request, response) {
  //get previous data from database
  const sql = 'SELECT * FROM survey_results;';
  client.query(sql)
    .then(incomingPreviousResults => {
      //console.log(incomingPreviousResults);
      const allPreviousResults = incomingPreviousResults.rows;
      allPreviousResults.forEach(value => {
        //console.log('test test', value);
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
      response.status(200).send(arrayOfSurveyObject);
    })
    .catch((error) => {
      console.log('An eror has occured: ', error);
      response.status(500).redirect('pages/error');
    })
}

function renderGraph(request, response) {
  // Somewhere in request look for id/class name

  // Let team know I need Id in the request.
  // Will need to incoperate safeValue

  // const sql = 'SELECT * FROM survey_results WHERE survey_session=$1;';
  // let safeValue = [currentClassName[0]];
  // console.log(safeValue)
  // client.query(sql, safeValue)
  const sql = 'SELECT * FROM survey_results;';
  client.query(sql)
    .then(data => {
      //console.log(data);
      const totalRows = data.rows.length;
      //console.log('rows total', totalRows);
      const dataObjectWantToApply = { survey_session: data.rows[totalRows - 1].survey_session, results_array: JSON.parse(data.rows[totalRows - 1].results_array) };
      //console.log(dataObjectWantToApply)
      response.render('pages/graph', { key: dataObjectWantToApply });
    })
}

function handleError(request, response) {
  console.log('An error has occured.');
  response.render('pages/error');
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

