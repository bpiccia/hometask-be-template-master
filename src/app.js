const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model')
const {getProfile} = require('./middleware/getProfile')
const app = new express();
const globalErrorHandler = require('./controllers/errorController');

//routers
const contractRouter = require('./routes/contractRoutes');
const jobRouter = require('./routes/jobRoutes');
const balanceRouter = require('./routes/balanceRoutes');
const adminRouter = require('./routes/adminRoutes');

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use('/contracts', contractRouter);
app.use('/jobs', jobRouter);
app.use('/balances', balanceRouter);
app.use('/admin', adminRouter);

app.use(globalErrorHandler);

module.exports = app;