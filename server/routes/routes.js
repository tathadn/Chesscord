const passport = require("passport")
const User = require("../models/user")
const Match = require("../models/match")
express = require('express')

module.exports = (app, games) => {

    app.get('/', (req, res) => {
        res.render('landing', {user: req.user})
    });

    app.get('/multiplayer', (req, res) => {
        res.render('multi', {user: req.user});
    });

// AI Match
    app.get('/ai/white', (req, res) => {
        res.render('ai', {
            color: 'white',
            user: req.user
        });
    });
    app.get('/ai/black', (req, res) => {
        res.render('ai', {
            color: 'black',
            user: req.user
        });
    });

// Online Match
    app.get('/create', (req, res) => {
        if (games[req.query.code]) {
            return;
        }
        res.render('partials/dock-playing', (err, html) => {
            if (err) res.status(500).send("Error creating game")
            res.send(html)
        })
        return;
    });

    app.get('/join', (req, res) => {
        if (!games[req.query.code]) return;

        if (games[req.query.code].white && games[req.query.code].black) {
            res.render('multi', {code: req.query.code, playing: true, join: "spectate", playerColor: "white", user: req.user})
            return;
        }

        let color = (games[req.query.code].white == undefined) ?
        "white" : "black"
        res.render('multi', {code: req.query.code, playing: true, join: "join", playerColor: color, user: req.user})
        return;
    });

    app.get('/resume', async (req, res) => {
        if (!req.user) {
            return res.redirect('/login');
        }
        try {
            let matches = await Match.find({
                finished: false,
                $or: [
                    { white: req.user.username },
                    { black: req.user.username }
                ]
            }).select("white black fen");
            res.render('partials/ongoing-matches', {matches: matches}, (err, html) => {
                if (err) res.status(500).send("Error creating game")
                res.send(html)
            })
        } catch (err) {
            console.log(err)
            res.status(500).send("Error fetching unfinished matches");
        }
        return;
    });

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