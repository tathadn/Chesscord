const passport = require("passport")
const Strategy = require("passport-local").Strategy;
let User = require("../models/user")

passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser(async function(userId, done) {
    try {
        const user = await User.findById(userId)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
});

passport.use(
    new Strategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user || !user.validPassword(password)) {
                throw new Error("Invalid Credentials")
            }
            done(null, user);
        } catch (err) {
            console.log(username + password)
            done(err, null);
        }
    })
);

module.exports = { use: passport.use }