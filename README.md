# perspective-sheet
A questionnaire to help people see other's perspectives.


**Author**: Dominique Augurson, Spencer Lazzar, Kevin McNeil, Paul Leonard
**Version**: x.x.x

## Overview
This website and backend provide an easy and streamlined method to conduct a survey of participants' life experiences which have affected their exposure to technology and software development.  The end product of the survey is a graphical representation of the survey results to facilitate a conversation about distribution and differences of people's experiences to build empathy and understanding.


## Architecture
An administrator homepage written with HTML, CSS, and JavaScript is the initiation point for spawning a new instance of the survey.  Through the use of a duplicate and update API with TypeForm, an survey URL for the new group or class is created.  The administrator can then copy the link and send it to participants.  Each participant interacts with the TypeForm front end form and clicks submit.  Data is then gathered by the server.js through TypeForm's APIs.  The results of the survey are then plotted using chartJS (or another charting method) and also recorded into a postgres SQL database.  A list of previous group results can be queried from the database using historical links.


## Change Log
**1.0.0** 09-xx-2020 x:xxxm - description


## Credits and Collaborations
- Thanks to Brook Riggio for the idea to create a practical app to help administer this survey to help open up people's views and increase empathy for others.  And for introducing us to TypeForm.
- Thanks to Lena Eivy for teaching us the skills over the last months to make this possible
- Thanks to Brian Nations for serving as our PM and tech help during this week.
- Thanks to the excellent advice, guidance, and explations of our TA's:  Morgan Heinemann, Chance Harmon, Skyler Burger, Bade, Cait... others?


