const express = require('express');
const app = express();
const port = 80;

app.use(express.static('./'));

app.listen(port, () => console.log(`httpd listening on port ${port}!`));