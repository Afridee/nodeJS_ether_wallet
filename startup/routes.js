const express = require('express');
const accounts = require('../routes/accounts');
const transactions = require('../routes/transactions');
const notifications = require('../routes/notifications');
const estimations = require('../routes/estimations');

module.exports = function(app){
    app.use(express.json());
    app.use('/api/accounts', accounts);
    app.use('/api/transactions', transactions);
    app.use('/api/notifications', notifications);
    app.use('/api/estimations', estimations);
}