require('dotenv').config();
const express = require('express');
const app = express();

require('./startup/routes')(app);
require('./startup/prod')(app);

<<<<<<< HEAD
const port = process.env.PORT || 3000;

=======

const port = process.env.PORT || 3000;
>>>>>>> 64d77a04624dba74d6a2413407045838e7a29d56
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));



