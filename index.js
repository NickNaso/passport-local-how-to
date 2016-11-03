/*******************************************************************************
 * Copyright (c) 2016 Nicola Del Gobbo 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
 * IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing
 * permissions and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 ******************************************************************************/

'use strict';

/*!
 * Module dependencies
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const responseTime = require('response-time');
const responsePoweredBy = require('response-powered-by');
const passport = require('passport');
const http = require('http');
const flash = require('connect-flash');
const morgan = require('morgan');
const path = require('path');
const serveStatic = require('express').static;
const serveFavicon = require('serve-favicon');
const bodyParser = require('body-parser');

const app = express();

// Set express server port
app.set('port', process.env.PORT || 5000);
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.engine('ejs', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.use(serveStatic(path.join(__dirname, 'public')));
app.use(serveFavicon(path.join(__dirname, 'public/favicon.ico')));
app.use(bodyParser.urlencoded({extended: false, inflate: true}));
app.use(bodyParser.json({strict: true, inflate: true}));
app.use(responsePoweredBy("@NickNaso"));
app.use(responseTime());

// Set the cookie parser middleware
app.use(cookieParser("nicknaso-secret-cookie-key"));

// Set the session middleware

// Option for session
let sessOpts = {
    secret: "nicknaso-secret-session-cookie-key",
    name: "NickNaso.SID",
    resave: true,
    saveUninitialized: false,
    cookie: {
        "secure": false,
        "maxAge": 3600000
    }
};
app.use(session(sessOpts));

// Set connect flash middleware
app.use(flash());

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());


////////////////////////////////////////////////////////////////////////////////
// Attach cutom passport configuration
require('./lib/passport-config');

////////////////////////////////////////////////////////////////////////////////

/**
 * Routes for the application
 */


app.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('index', {user: req.user});
    } else {
        res.redirect('/login');
    }
});

////////////////////////////////////////////////////////////////////////////////

app.get('/login', (req, res) => {
    res.render('login', {error: req.flash("error")});
});


// Options for authentication route
let authOpts = {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}

// Authentication route
app.post('/login', passport.authenticate('local', authOpts));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

////////////////////////////////////////////////////////////////////////////////

// Create http server and attach express app on it
http.createServer(app).listen(app.get('port'), '0.0.0.0', () => {
    console.log("Server started at http://localhost:" + app.get('port') + "/");
});
