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

// Library
app.get('/library', (req, res) => {
    res.render('library'); // pulls library.html from views folder
});

// opens up the pages from the library folder in views folder
app.get('/library/italian', (req, res) => {
    res.render('library/italian');
});

app.get('/library/sicilian', (req, res) => {
    res.render('library/sicilian');
});
app.get('/library/french', (req, res) => {
    res.render('library/french');
});
app.get('/library/lopez', (req, res) => {
    res.render('library/lopez');
});
app.get('/library/slav', (req, res) => {
    res.render('library/slav');
});
app.get('/library/caro', (req, res) => {
    res.render('library/caro');
});
app.get('/library/scan', (req, res) => {
    res.render('library/scan');
});
app.get('/library/pirc', (req, res) => {
    res.render('library/pirc');
});
app.get('/library/alekhine', (req, res) => {
    res.render('library/alekhine');
});
app.get('/library/kings-gambit', (req, res) => {
    res.render('library/kings-gambit');
});
app.get('/library/scotch', (req, res) => {
    res.render('library/scotch');
});
app.get('/library/queens-gambit', (req, res) => {
    res.render('library/queens-gambit');
});
// start of the newer library pages
app.get('/library/kings-indian', (req, res) => {
    res.render('library/kings-indian');
});
app.get('/library/nimzo', (req, res) => {
    res.render('library/nimzo');
});
app.get('/library/queens-indian', (req, res) => {
    res.render('library/queens-indian');
});
app.get('/library/catalan', (req, res) => {
    res.render('library/catalan');
});
app.get('/library/bogo-indian', (req, res) => {
    res.render('library/bogo-indian');
});
app.get('/library/grunfeld', (req, res) => {
    res.render('library/grunfeld');
});
app.get('/library/dutch', (req, res) => {
    res.render('library/dutch');
});
app.get('/library/trompowsky', (req, res) => {
    res.render('library/trompowsky');
});
app.get('/library/benko', (req, res) => {
    res.render('library/benko');
});
app.get('/library/london', (req, res) => {
    res.render('library/london');
});

// Auth
    app.post('/login', async (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                if (err.message === "Invalid Credentials") {
                    console.log("Error during authentication: Invalid Credentials");
                    return res.status(401).type('text/plain').send("Invalid username or password");
                }
                console.log("Error during authentication:", err);
                return res.status(500).type('text/plain').send("An error occurred during authentication");
            }
            if (!user) {
                console.log("Login failed:", info.message);
                return res.status(401).type('text/plain').send(info.message || "Invalid username or password.");
            }
            req.logIn(user, (err) => {
                if (err) {
                    console.log("Error logging in as user:", err);
                    return res.status(500).send("An error occurred during login.");
                }
                console.log("POST: LOGIN - Success");
                res.status(200).send("Login successful.");
            });
        })(req, res, next);
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