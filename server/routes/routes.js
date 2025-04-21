const passport = require("passport")
const User = require("../models/user")
express = require('express')

module.exports = app => {

    app.get('/', (req, res) => {
        res.render('index', {
            user: req.user
        });
    });

    app.get('/white', (req, res) => {
        res.render('game', {
            color: 'white',
            user: req.user
        });
    });
    app.get('/black', (req, res) => {
        if (!games[req.query.code]) {
            return res.redirect('/?error=invalidCode');
        }

        res.render('game', {
            color: 'black',
            user: req.user
        });
    });

// Match
    app.post('/match', (req, res) => {
        console.log(req.body);
    })

// Auth
    app.get('/login', (req, res) => {
        res.render('login');
    })

    app.get('/register', (req, res) => {
        res.render('register');
    })

    app.post('/login', passport.authenticate('local', {successRedirect: "/", failureRedirect: "/login"}), (req, res) => {
        console.log("POST: LOGIN");
    });

    app.post("/register", async (req, res, next) => {
        const { username, password } = req.body;

        try {
            const user = await User.create({ username, password });
            console.log("Registered: " + username);
        } catch (err) {
            if (err.name === "ValidationError") {
                console.log("Client tried to take owned username");
                res.status(500).send("Sorry that username already exists!");
            } else {
                next(err);
            }
        }
    });

    app.all("/logout", (req, res, next) => {
        req.logout( (err) => {
            if (err)  return next(err);
            res.redirect("/");
        });
    });
};  