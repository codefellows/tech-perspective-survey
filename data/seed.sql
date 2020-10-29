DELETE FROM forms;
INSERT INTO forms(adminID, title, jotformID, timestamp, totalPeople, totalQuestions, closed)
VALUES (1, 'title1', 1603752546, 178927519817, 3, 21, false);
INSERT INTO forms(adminID, title, jotformID, timestamp, totalPeople, totalQuestions, closed)
VALUES (1, 'title2', 1603752547, 188927519817, 3, 21, true);

DELETE FROM people;
INSERT INTO people (instanceID, numTrue) VALUES (1, 5);
INSERT INTO people (instanceID, numTrue) VALUES (1, 6);
INSERT INTO people (instanceID, numTrue) VALUES (1, 6);
INSERT INTO people (instanceID, numTrue) VALUES (2, 2);
INSERT INTO people (instanceID, numTrue) VALUES (2, 3);
INSERT INTO people (instanceID, numTrue) VALUES (2, 3);

DELETE FROM admin;
INSERT INTO admin (username, apiKey) VALUES ('skrambelled', 'apiKey');