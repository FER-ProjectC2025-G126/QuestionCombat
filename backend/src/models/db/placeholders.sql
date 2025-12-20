BEGIN TRANSACTION;

INSERT INTO question_sets (set_id, title, description) VALUES
(1, 'Basics', 'Introductory general knowledge'),
(2, 'Math', 'Simple arithmetic and logic'),
(3, 'History', 'Historical facts and events'),
(4, 'Science', 'Basic science questions'),
(5, 'Programming', 'Fundamentals of programming');

INSERT INTO questions (set_id, question_id, question_text) VALUES
(1, 1, 'What color is the sky on a clear day?'),
(2, 2, 'What is 2 + 2?'),
(3, 3, 'Who was the first President of the United States?'),
(4, 4, 'What planet is known as the Red Planet?'),
(5, 5, 'Which language is primarily used for web front-end development?');

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(1, 'Blue', 1),
(1, 'Green', 0),
(1, 'Red', 0),
(1, 'Yellow', 0);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(2, '3', 0),
(2, '4', 1),
(2, '22', 0),
(2, '5', 0);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(3, 'George Washington', 1),
(3, 'Abraham Lincoln', 0),
(3, 'Thomas Jefferson', 0),
(3, 'John Adams', 0);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(4, 'Mars', 1),
(4, 'Venus', 0),
(4, 'Jupiter', 0),
(4, 'Saturn', 0);

INSERT INTO question_options (question_id, option_text, is_correct) VALUES
(5, 'Python', 0),
(5, 'C++', 0),
(5, 'JavaScript', 1),
(5, 'Rust', 0);

COMMIT;
