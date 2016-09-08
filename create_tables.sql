CREATE TABLE user
(
    name VARCHAR(20) NOT NULL PRIMARY KEY
);

CREATE TABLE tweet
(
    tweet_date TIMESTAMP NOT NULL,
    message VARCHAR(140) NOT NULL,
    author VARCHAR(20) NOT NULL,
    FOREIGN KEY (author) REFERENCES user (name)
);