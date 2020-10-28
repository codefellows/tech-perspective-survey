DROP TABLE IF EXISTS instances;

CREATE TABLE instances(
  instanceID SERIAL PRIMARY KEY,
  instanceDescription VARCHAR(30),
  totalPeople NUMBER,
  timestamp NUMBER,
  totalNumberOfQuestion NUMBER
)

DROP TABLE IF EXISTS people;

CREATE TABLE people(
  questionID SERIAL PRIMARY KEY,
  instancesID int FOREIGN KEY REFERENCES instances(instanceID),
  true NUMBER
)

