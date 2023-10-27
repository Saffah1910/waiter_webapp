import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import session from 'express-session';
import pgPromise from 'pg-promise';
import Handlebars from 'handlebars'; // Import Handlebars
import 'dotenv/config';

// import frontend, database queries, routes
import frontendWaiters from './frontEnd.js';
import routes from './routes/routes.js';
import waiterQuery from './services/query.js';

const connectionString = process.env.DATABASE_URL;
const pgp = pgPromise();
const db = pgp(connectionString);

const app = express();
const frontEndLogic = frontendWaiters(db);
const query = waiterQuery(db,frontEndLogic);
const routesFunction = routes(query, frontEndLogic);

app.engine(
  'handlebars',
  engine({
    handlebars: Handlebars,
    helpers: {
      json: function (context) {
        return JSON.stringify(context);
      },
    },
  })
);app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
      secret: 'your-secret-key',
      resave: false,
      saveUninitialized: false,
  })
);
app.use(flash());



app.get('/', routesFunction.home);

// this route will show the status of the days
app.get('/days', routesFunction.adminPage);

app.get('/waiters/:username', routesFunction.waiter);

app.post('/waiters/:username', routesFunction.addWaiter);

app.get('/views/seeMore', (req, res) => {
  // Construct the path to the seeMore.handlebars template
  const seeMorePath = path.join(__dirname, 'views', 'seeMore');

  // Render the seeMore.handlebars template
  res.render(seeMorePath);
});


// app.post('/remove-waiter-for-day', routesFunction.removeWaiter);


app.post('/clear', routesFunction.clear);

const PORT = process.env.PORT || 3012
;

app.listen(PORT, function () {
  console.log('App started at port', PORT);
});