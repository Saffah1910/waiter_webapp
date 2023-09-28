import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import session from 'express-session';
import pgPromise from 'pg-promise';
import 'dotenv/config';

//import frontend . databas queries, routes



// const connectionString = process.env.DATABASE_URL;
// const pgp = pgPromise();
// const db = pgp(connectionString);

const app = express();
//create instance for frontend . databas queries, routes



app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.get('/', async function home(req, res) {
    res.render('admin');
});

//Show waiters a screen where they can select the days they can work
app.get('/waiters/:username');


// Send the days the waiter can work to the server.
app.post('/waiters/:username');

// 	Show your sister which days waiters are available
app.get('/days');



const PORT = process.env.PORT || 3017;

app.listen(PORT, function () {
    console.log("App started at port", PORT);
});