const session = require('express-session');
const passport = require('passport')
const passportlm = require('passport-local-mongoose')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')
try {
    const express = require('express');
    const app = express();
    app.set('view engine', 'ejs');
    app.use(express.static("public"));
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    app.use(session({
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    const mongoose = require('mongoose')
    mongoose.connect("mongodb+srv://aryan-keluskar:" + process.env.PWD + "@cluster0.xj6cf.mongodb.net/tdList", { useNewUrlParser: true, useUnifiedTopology: true });
    const passSchema = new mongoose.Schema({
        email: String,
        pass: String,
        googleId: String
    });
    passSchema.plugin(passportlm)
    passSchema.plugin(findOrCreate)
    const items = mongoose.model("items", passSchema);
    passport.use(items.createStrategy())
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        items.findById(id, function(err, user) {
            done(err, user);
        });
    });
    passport.use(new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/success",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(profile);
            items.findOrCreate({ googleId: profile.id }, function(err, user) {
                return cb(err, user);
            });
        }
    ));


    app.get("/", function(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/auth/google/success')
        } else
            res.redirect('/auth/google')
    });

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile'] })
    );

    app.get('/app', passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
        if (req.isAuthenticated()) {
            var options = {
                weekday: "long",
                month: "long",
                day: "numeric"
            }
            var today = new Date();
            var day = today.toLocaleDateString("en-US", options)

            items.find({}, function(err, found) {
                // console.log(found[i].name);    
                res.render('list', { Day: day, newli: found });
            });
        } else
            res.redirect('/auth/google')
    });

    app.get('/auth/google/success',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/app')
        });

    app.listen(3000, function() {
        console.log("Server started at http://localhost:3000");
    });

} catch {
    console.log();
}