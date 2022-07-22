const express = require('express');
const router = express.Router();

/**
  In this test route, you are setting a cookie on the response with the name of XSRF-TOKEN to the value of the req.csrfToken method's return. Then, you are sending the text, Hello World! as the response's body.

  Add the routes to the Express application by importing with the other imports in backend/app.js and connecting the exported router to app after all the middlewares.
 */

const apiRouter = require('./api');

router.use('/api', apiRouter);


// In production, the XSRF-TOKEN will be attached to the index.html file in the frontend/build folder. In the backend/routes/index.js file, serve the index.html file at the / route and any routes that don't start with /api. Along with it, attach the XSRF-TOKEN cookie to the response. Serve the static files in the frontend/build folder using the express.static middleware.

if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  // Serve the frontend's index.html file at the root route
  router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });

  // Serve the static assets in the frontend's build folder
  router.use(express.static(path.resolve("../frontend/build")));

  // Serve the frontend's index.html file at all other routes NOT starting with /api
  router.get(/^(?!\/?api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'build', 'index.html')
    );
  });
}

// In development, you need another way to get the XSRF-TOKEN cookie on your frontend application because the React frontend is on a different server than the Express backend. To solve this, add a backend route, GET /api/csrf/restore in the same file that can be accessed only in development and will restore the XSRF-TOKEN cookie.

if (process.env.NODE_ENV !== 'production') {
  router.get('/api/csrf/restore', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.json({});
  });
}

router.get('/api/csrf/restore', (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200)
  res.json({
    'XSRF-Token': csrfToken
  });
});

// Static routes
// Serve React build files in production

module.exports = router;
