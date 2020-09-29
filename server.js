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
const app = express();
const dataBaseUrl = process.env.DATABASE_URL;
const client = new pg.Client(dataBaseUrl);
client.on('error', (error) => {
  console.log(error);
});

//app
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', renderHomePage);
app.post('/defineSession', handleChangeSession);
app.get('*', handleUndefinedRoute);

//may become obsolete by now going back to TypeForm
var arrayOfSurveyResults = [];

function renderHomePage(request, response) {
  response.render('pages/index');
}

//may become obsolete by now going back to TypeForm
function handleChangeSession(request, response) {
  console.log('request.body: ',request.body);
  const currentSurveySession = request.body.text;
  console.log('request.body.text: ',request.body.text);
  arrayOfSurveyResults.push(new Survey(currentSurveySession));
  console.log('SurveyObject: ', arrayOfSurveyResults);
  response.status(200).render('pages/index');
}

function handleUndefinedRoute(request, response) {
  response.status(404).send('#404: Page not found.')
}

//may become obsolete by now going back to TypeForm
function Survey(className) {
  this.surveySession = className;
  this.resultsArray = [];
}

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
