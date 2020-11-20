# perspective-sheet

A questionnaire to help people see other's perspectives.

**Version**: 2.1.0

**Refactored by**: Tahmina RInger, Wilfried Motchoffo, Mark Bell
**Original Authors**: Dominique Augurson, Spencer Lazzar, Kevin McNeil, Paul Leonard

## Overview

This app provides an easy and streamlined method to conduct a survey of participants' life experiences which have affected their exposure to technology and software development. The end product of the survey is a graphical representation of the survey results to facilitate a conversation about distribution and differences of people's experiences to build empathy and understanding.

A login page requires an administrator to input their own private JotForm API key with 'full access' permissions. An administrator homepage written with HTML, CSS, and JavaScript is the initiation point for spawning a new instance of the survey. Through the use of a clone process with JotForm API, a survey URL for the new group or class is created. The administrator can then copy the link and send it to participants. Each participant interacts with the JotForm front end form and clicks submit. Data is then gathered by the server.js through JotForm's API. The results of the survey are then plotted using chartJS. A list of previous group results can be viewed as long as the forms exist on JotForm.

## Routes - server.js

method | endpoint | purpose
------ | -------- | -------
GET | `'/'` | default page, rediects to `'/admin'` or `'/login'` based on cookie
GET | `'/login'` | login page / requires JotForm API key from administrator of a survey
GET | `'/login/session'` | automated loging based on cookie
POST | `'/login/session'` | manual login handler, when no cookie present
GET | `'/result/{id}'` | show the graph of a particular survey
POST | `'/survey/create'` | clone a survey from the template survey
GET | `'/survey/{id}'` | fill out a survey

## Refactored APP Credits and Collaborations

- Thanks to Brook Riggio for acting as our client, and setting app expectations.
- Thanks to Brian Nations for being out instructor throught this app building process.
- Thanks to Chance, Skyler and Ron for being excellent resources and also encouraging TAs.
- [JotForm API](https://www.api.jotform.com) for form management.
- [W3Schools](https://www.w3schools.com/w3css/default.asp) for CSS syntax.
- [Stack Overflow](https://stackoverflow.com) for general questions!

## Original Credits and Collaborations

- Thanks to Brook Riggio for the idea to create a practical app to help administer this survey to help open up people's views and increase empathy for others.  And for introducing us to TypeForm.
- Thanks to Lena Eivy for teaching us the skills over the last months to make this possible
- Thanks to Brian Nations for serving as our PM and tech help during this week.
- Thanks to the excellent advice, guidance, and explations of our TA's:  Morgan Heinemann, Chance Harmon, Skyler Burger, Bade, Nicco, Cait... others?
- [JSON.stringify() at GeeksforGeeks](https://www.geeksforgeeks.org/javascript-convert-an-array-to-json/)
- [JSON.parse() at W3schools](https://www.w3schools.com/js/js_json_parse.asp)
- [REPL](https://repl.it/)
- [MDN Slice for syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice)
- [Date to ISO Standard at Geeks for Geeks](https://www.geeksforgeeks.org/javascript-date-toisostring-method/#:~:text=toISOString()%20method%20is%20used,created%20using%20date()%20constructor.)
- [typeof syntax at freeCodeCamp](https://www.freecodecamp.org/news/javascript-data-types-typeof-explained/#:~:text=typeof%20is%20a%20JavaScript%20keyword,a%20variable%20in%20your%20code.)
- [to stop adding duplicates to the history rendered page](https://stackoverflow.com/questions/8217419/how-to-determine-if-javascript-array-contains-an-object-with-an-attribute-that-e)
- [margins](https://www.w3schools.com/cssref/pr_margin.asp)
- [CSS selectors](https://www.w3schools.com/cssref/css_selectors.asp)
- [clears](https://css-tricks.com/snippets/css/clear-fix/)
- [flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [grid](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [MDN Array.prototype.fill()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
- [Sticky Header](https://www.w3schools.com/howto/howto_js_sticky_header.asp)
