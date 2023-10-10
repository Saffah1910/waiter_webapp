import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import session from 'express-session';
import pgPromise from 'pg-promise';
import 'dotenv/config';

//import frontend . databas queries, routes
import frontendWaiters from './frontEnd.js';
import routes from './routes/routes.js';
import waiterQuery from './services/query.js'



const connectionString = process.env.DATABASE_URL;
const pgp = pgPromise();
const db = pgp(connectionString);

const app = express();
//create instance for frontend . databas queries, routes
const frontEndLogic = frontendWaiters(db);
const query = waiterQuery(db)
const routesFunction = routes(query, frontEndLogic);



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


//this route will show status of the days
app.get('/days', routesFunction.adminPage);



app.get('/waiters/:username',routesFunction.waiter);


app.post('/waiters/:username', routesFunction.addWaiter);



const PORT = process.env.PORT || 3013;

app.listen(PORT, function () {
    console.log("App started at port", PORT);
});