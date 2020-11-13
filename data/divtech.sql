DROP TABLE IF EXISTS divtech;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS forms;
DROP TABLE IF EXISTS people;

CREATE TABLE divtech (
id SERIAL PRIMARY KEY,
jotform_api VARCHAR(255),
username VARCHAR(255),
survey_id VARCHAR(255),
created_at VARCHAR(255),
true_answer TEXT
);


