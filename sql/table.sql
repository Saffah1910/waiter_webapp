-- CREATE TABLE waiter (
--     id SERIAL PRIMARY KEY,
--     username VARCHAR NOT NULL
-- );

-- CREATE TABLE weekdays (
--     id SERIAL PRIMARY KEY,
--     weekday VARCHAR NOT NULL
-- );

CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    waiter_id INTEGER,
    weekday_id INTEGER,
    FOREIGN KEY (waiter_id) REFERENCES waiter(id),
    FOREIGN KEY (weekday_id) REFERENCES weekdays(id)
);
