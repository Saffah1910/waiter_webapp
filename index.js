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
const routesFunction = routes(query,frontEndLogic);



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

app.get('/days',(req,res)=>{
  res.send('this is all the avialable days')

});

// app.get('/login',routesFunction.login)

app.get('/', routesFunction.adminPage);

//Show waiters a screen where they can select the days they can work
app.get('/waiters/:username', (req, res) => {
    const username = req.params.username;
    res.render('waiter', { username });
  });


// Send the days the waiter can work to the server.
app.post('/waiters/:username', (req, res) => {
    const username = req.params.username;
    const selectedDays = req.body.days || [];
  

  })

// app.get('/days', routes.showDays);

app.get('/waiter',routesFunction.waiter);

// app.post('/submit',routesFunction.addWaiter);

app.post('/waiters',routesFunction.addWaiter)



const PORT = process.env.PORT || 3002;

app.listen(PORT, function () {
    console.log("App started at port", PORT);
});