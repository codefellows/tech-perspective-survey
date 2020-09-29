DROP TABLE IF EXISTS survey_results;

CREATE TABLE survey_results (
  id SERIAL PRIMARY KEY,
  survey_session VARCHAR(255),
  date_conducted VARCHAR(255),
  results_array TEXT
);