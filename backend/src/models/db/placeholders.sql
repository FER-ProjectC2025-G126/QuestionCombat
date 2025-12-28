BEGIN TRANSACTION;

INSERT INTO question_sets (set_id, title, description) VALUES
(1, 'Basics', 'Introductory general knowledge'),
(2, 'Math', 'Simple arithmetic and logic'),
(3, 'History', 'Historical facts and events'),
(4, 'Science', 'Basic science questions'),
(5, 'Programming', 'Fundamentals of programming');

INSERT INTO questions (set_id, question_id, question_text) VALUES
(1, 1, 'What color is the sky on a clear day? (1)'),
(1, 2, 'What color is the sky on a clear day? (2)'),
(1, 3, 'What color is the sky on a clear day? (3)'),
(2, 4, 'What is 2 + 2? (1)'),
(2, 5, 'What is 2 + 2? (2)'),
(2, 6, 'What is 2 + 2? (3)'),
(3, 7, 'Who was the first President of the United States? (1)'),
(3, 8, 'Who was the first President of the United States? (2)'),
(3, 9, 'Who was the first President of the United States? (3)'),
(4, 10, 'What planet is known as the Red Planet? (1)'),
(4, 11, 'What planet is known as the Red Planet? (2)'),
(4, 12, 'What planet is known as the Red Planet? (3)'),
(5, 13, 'Which language is primarily used for web front-end development? (1)'),
(5, 14, 'Which language is primarily used for web front-end development? (2)'),
(5, 15, 'Which language is primarily used for web front-end development? (3)');

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(1, 'Blue', 1),
(1, 'Green', 0),
(1, 'Red', 0),
(1, 'Yellow', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(2, 'Blue', 1),
(2, 'Green', 0),
(2, 'Red', 0),
(2, 'Yellow', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(3, 'Blue', 1),
(3, 'Green', 0),
(3, 'Red', 0),
(3, 'Yellow', 0);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(4, '3', 0),
(4, '4', 1),
(4, '22', 0),
(4, '5', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(5, '3', 0),
(5, '4', 1),
(5, '22', 0),
(5, '5', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(6, '3', 0),
(6, '4', 1),
(6, '22', 0),
(6, '5', 0);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(7, 'George Washington', 1),
(7, 'Abraham Lincoln', 0),
(7, 'Thomas Jefferson', 0),
(7, 'John Adams', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(8, 'George Washington', 1),
(8, 'Abraham Lincoln', 0),
(8, 'Thomas Jefferson', 0),
(8, 'John Adams', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(9, 'George Washington', 1),
(9, 'Abraham Lincoln', 0),
(9, 'Thomas Jefferson', 0),
(9, 'John Adams', 0);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(10, 'Mars', 1),
(10, 'Venus', 0),
(10, 'Jupiter', 0),
(10, 'Saturn', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(11, 'Mars', 1),
(11, 'Venus', 0),
(11, 'Jupiter', 0),
(11, 'Saturn', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(12, 'Mars', 1),
(12, 'Venus', 0),
(12, 'Jupiter', 0),
(12, 'Saturn', 0);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(13, 'Python', 0),
(13, 'C++', 0),
(13, 'JavaScript', 1),
(13, 'Rust', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(14, 'Python', 0),
(14, 'C++', 0),
(14, 'JavaScript', 1),
(14, 'Rust', 0);
INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(15, 'Python', 0),
(15, 'C++', 0),
(15, 'JavaScript', 1),
(15, 'Rust', 0);

COMMIT;
