'use strict';

// dependancies and global variables
require('dotenv').config();

const pg = require('pg')
const cors = require('cors');
const superagent = require('superagent');
const express = require('express');
const app = express();
const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());

client.on('error', (error) => {
  console.log(error);
});
//constructor
function FORM(obj) {
  this.id = obj.id;
  this.url = obj.url;
  this.title = obj.title
  this.count = obj.count
}
// routes
app.get('/admin', renderAdminPage);

function renderAdminPage(req, res) {
  let url = `https://api.jotform.com/user/forms`;
  superagent.get(url)
    .set('APIKEY', `${process.env.JOTFORM_API_KEY}`)
    .then(data => {
      let content = data.body.content;
      let forms = content.map(element => {
        if (element.status === 'ENABLED') {
          return new FORM(element);
        }
      });
      res.render('pages/admin.ejs', { forms: forms });
    })
}
app.listen(PORT,()=>{
  console.log(`::::${PORT}::::`);
});
