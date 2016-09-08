CREATE TABLE user
(
    name VARCHAR(20) NOT NULL PRIMARY KEY
);

CREATE TABLE user_follow
(
    user_name VARCHAR(20) NOT NULL,
    follower_user_name VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_name) REFERENCES user (name),
    FOREIGN KEY (follower_user_name) REFERENCES user (name) 
);

CREATE UNIQUE INDEX user_follow_idx
ON user_follow (user_name, follower_user_name);

CREATE TABLE tweet
(
    tweet_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    tweet_date TIMESTAMP NOT NULL,
    message VARCHAR(140) NOT NULL,
    author VARCHAR(20) NOT NULL,
    FOREIGN KEY (author) REFERENCES user (name)
);