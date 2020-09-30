# perspective-sheet
A questionnaire to help people see other's perspectives.


**Author**: Dominique Augurson, Spencer Lazzar, Kevin McNeil, Paul Leonard
**Version**: x.x.x

## Overview
This website and backend provide an easy and streamlined method to conduct a survey of participants' life experiences which have affected their exposure to technology and software development.  The end product of the survey is a graphical representation of the survey results to facilitate a conversation about distribution and differences of people's experiences to build empathy and understanding.


## Architecture
An administrator homepage written with HTML, CSS, and JavaScript is the initiation point for spawning a new instance of the survey.  Through the use of a duplicate and update API with TypeForm, an survey URL for the new group or class is created.  The administrator can then copy the link and send it to participants.  Each participant interacts with the TypeForm front end form and clicks submit.  Data is then gathered by the server.js through TypeForm's APIs.  The results of the survey are then plotted using chartJS (or another charting method) and also recorded into a postgres SQL database.  A list of previous group results can be queried from the database using historical links.

### Database Architecture
The project contains one database with only one table.  There are three columns.  First, is the PRIMARY SERIAL KEY called id.  Second is the survey_instance.  And the final column is a numerical array stored in JSON format.
https://docs.google.com/spreadsheets/d/160hlur-MsROEnHNTTyffB1O17a1MmoLAcV1b-apEhJE/edit?usp=sharing

## Change Log
**1.0.0** 09-xx-2020 x:xxxm - description


## Credits and Collaborations
- Thanks to Brook Riggio for the idea to create a practical app to help administer this survey to help open up people's views and increase empathy for others.  And for introducing us to TypeForm.
- Thanks to Lena Eivy for teaching us the skills over the last months to make this possible
- Thanks to Brian Nations for serving as our PM and tech help during this week.
- Thanks to the excellent advice, guidance, and explations of our TA's:  Morgan Heinemann, Chance Harmon, Skyler Burger, Bade, Cait... others?
- [JSON.stringify() at GeeksforGeeks](https://www.geeksforgeeks.org/javascript-convert-an-array-to-json/)
- [JSON.parse() at W3schools](https://www.w3schools.com/js/js_json_parse.asp)
- [REPL](https://repl.it/)
- [MDN Slice for syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/slice)
- [Date to ISO Standard at Geeks for Geeks](https://www.geeksforgeeks.org/javascript-date-toisostring-method/#:~:text=toISOString()%20method%20is%20used,created%20using%20date()%20constructor.)
- [typeof syntax at freeCodeCamp](https://www.freecodecamp.org/news/javascript-data-types-typeof-explained/#:~:text=typeof%20is%20a%20JavaScript%20keyword,a%20variable%20in%20your%20code.)
- [to stop adding duplicates to the history rendered page](https://stackoverflow.com/questions/8217419/how-to-determine-if-javascript-array-contains-an-object-with-an-attribute-that-e)

