DROP TABLE IF EXISTS forms;

CREATE TABLE forms(
  instanceID SERIAL PRIMARY KEY,
  adminID NUMERIC,
  title VARCHAR(255),
  jotformId NUMERIC,
  timestamp NUMERIC,
  totalPeople NUMERIC,
  totalQuestions NUMERIC,
  closed BOOLEAN
);

DROP TABLE IF EXISTS people;

CREATE TABLE people(
  peopleID SERIAL PRIMARY KEY,
  instanceID NUMERIC,
  numTrue NUMERIC
);

DROP TABLE IF EXISTS admin;

CREATE TABLE admin(
  adminID SERIAL PRIMARY KEY,
  username VARCHAR(255),
  apiKey VARCHAR(255)
);