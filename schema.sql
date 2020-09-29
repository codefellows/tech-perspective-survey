DROP TABLE IF EXISTS survey_results;

CREATE TABLE survey_results (
  id SERIAL PRIMARY KEY,
  survey_instance VARCHAR(255),
  results TEXT
);