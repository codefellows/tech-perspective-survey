# Software Requirements

## Vision
The vision of this product is to provide an easy to administer and participate in survey to demonstrate the wide distribution of life experiences which have an affect on exposing people to the world of technology and software.  The end result of the survey is a histogram style chart to show the diversity of the class and to facilitate a conversation about the various levels of privilege and challenges/advantages of each life experience. 

This exercise on whole helps to provide an introspective moment for survey participants to better understand the variety of life experiences people have.  The use of an automated survey and plotting results make the exercise easier to administer, participate in, graph the results, reduce the amount of time to administer the survey, and thereby, will likely increase the survey's use and also impact.

This matters because people need to be aware of the larger world around them and the experiences of other people.  Without awareness of challenges or hurdles faced by others, but not themselves, it is easy to ignore or be oblivious to such challenges.  Knowing of the challenges and understanding them can help to drive empathy and systematic changes.

## Scope (In/Out)

### IN
- Give the user/teacher an application to share form for perspective sheet
- The user/teacher will want to initiate a new class or group survey, the user should be able to click a button to generate a new survey. Take data from each class and render chart for admin to use
- Present a graph of survey results as results come in with a visual representation about the results
- Keep record of all the results of the survey taken so comparison can be done across all classes
- Be a quick and concise form that will be easy to use and navigate through
### OUT
- The application will not be something it is not
- It will not be displaying real time data to the students
- It will not be sharing information from user to user based on their answers


## Minimum Viable Product vs
### What will your MVP functionality be?
MVP will be generating a TypeForm Survey link to send to students.  Collecting data after students have completed survey.  Graphing the resulting data.  Soring the data to a SQL DB. Links to access data from previous survey sessions. 

### What are your stretch goals?
- vertical line at center of graph
- allowing user/teacher to name the class for data consistency
- text search of previous survey sessions
- graph of all accumulative data

### What stretch goals are you going to aim for?
- allowing user/teacher to name the class for data consistency
- graph of all accumulative data


## Functional Requirements
- An admin can modify the SQL database
- A user/teacher can initiate a new survey
- A user/student can complete the survey fields
- A user/teacher can review the survey results in a chart format
- A user/teacher can review historical and composite survey results in a chart format

## Data Flow
1. user/teacher visits home page
1. Stretch Goal:  user/teacher enters class or group name in text field
1. user/teacher clicks button to generate survey link
1. TypeForm API is used to duplicate previously generated form
1. TypeForm API is used to update hidden field of class value (stretch goal)
1. user/teacher slacks/emails out the link to the survey to the students
1. user/students take the survey via TypeForm and hit submit
1. Stretch Goal:  Dual path for data retrieval:
- As each student submits the form, the TypeForm POST API sends the data to our server
- After 5 responses are received, the chart auto populates on the user/teacher’s homepage
- After each subsequent form submission to the server, the chart auto updates with the extra datapoint
1. After a period of time, the instructor decides to show the survey results by clicking a manual refresh button for the graph
1. An API call goes from our server to TypeForm to gather all of the results
1. The returned data from teh API call is mined and aggregated
1. The chart is rendered on the homepage to show the results of the survey
1. The data from the survey is stored in a SQL Database for future review
user/teacher can click to review previous class data via links
1. Stretch:  user/teacher can display a composite graph of all previous da1. ta

## Non-Functional Requirements:
- Confidentiality between student and instructor data. Providing options for presenting information.
- Accessibility to the data generated from submitted Typeforms.
- Integrity of the stored software (updates, api routes, etc.).
