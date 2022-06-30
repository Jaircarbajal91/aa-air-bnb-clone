const express = require('express');
require('express-async-errors');
const morgan = require('morgan');
const cors = require('cors');
const csurf = require('csurf');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { ValidationError } = require('sequelize');

const { environment } = require('./config');
const isProduction = environment === 'production'; //if the environment is in production or not

const app = express();

// middleware for logging information about requests and responses:
app.use(morgan('dev'));
// middleware for parsing cookies
app.use(cookieParser());
app.use(express.json());

/** Only allow CORS in development using the cors middleware because the React frontend will be served from a different server than the Express server. CORS isn't needed in production since all of our React and Express resources will come from the same origin. */

if (!isProduction) {
  // enable cors only in development
  app.use(cors());
}

// helmet helps set a variety of headers to better secure your app,
// React is generally safe at mitigating XSS
app.use(
  helmet.crossOriginResourcePolicy({
    policy: 'cross-origin'
  })
);

/** The csurf middleware will add a _csrf cookie that is HTTP-only (can't be read by JavaScript) to any server response. It also adds a method on all requests (req.csrfToken) that will be set to another cookie (XSRF-TOKEN) later on. These two cookies work together to provide CSRF (Cross-Site Request Forgery) protection for your application. The XSRF-TOKEN cookie value needs to be sent in the header of any request with all HTTP verbs besides GET. This header will be used to validate the _csrf cookie to confirm that the request comes from your site and not an unauthorized site. */

// Set the _csrf token and create req.csrfToken method
app.use(
  csurf({
    cookie: {
      secure: isProduction,
      sameSite: isProduction && 'Lax',
      httpOnly: true
    }
  })
)

const routes = require('./routes')

app.use(routes);

app.use((_req, _res, next) => {
  const err = new Error('The requested resource couldn\'t be found.');
  err.title = 'Resource Not Found';
  err.errors = ['The requested resource couldn\'t be found'];
  err.status = 404;
  next(err);
})

/**
  If the error that caused this error-handler to be called is an instance of ValidationError from the sequelize package, then the error was created from a Sequelize database validation error and the additional keys of title string and errors array will be added to the error and passed into the next error handling middleware
 */
app.use((err, _req, _res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    err.errors = err.errors.map((e) => e.message);
    err.title = 'Validation error';
  }
  next(err);
});

/**
  The last error handler is for formatting all the errors before returning a JSON response. It will include the error message, the errors array, and the error stack trace (if the environment is in development) with the status code of the error message.
 */
app.use((err, _req, res, _next) => {
  res.status(err.status || 500);
  console.error(err);
  res.json({
    title: err.title || 'Server Error',
    message: err.message,
    errors: err.errors,
    stack: isProduction ? null : err.stack
  });
});

module.exports = app;
