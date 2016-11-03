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
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');

// Used to serialize the user for the session
passport.serializeUser(function (user, done) {
    return done(null, user.id);
});

// Used to deserialize the user
passport.deserializeUser(function (id, done) {
    db.users
    .findById(id, function (err, user) {
        if (err) {
            return done(err);
        } else {
            return done(null, user);
        }
    });
});

// Set Local Strategy for authentication
passport.use(new LocalStrategy(
    function (username, password, done) {
        db.users
        .findByUsername(username, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: "Incorrect username." });
            }
            if (password !== user.password) {
                return done(null, false, { message: "Incorrect password." })
            }
            return done(null, user);
        });
    }
));