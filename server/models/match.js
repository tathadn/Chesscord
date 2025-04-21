const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = require('./user')

const MatchSchema = new Schema({
    white: {type: String, required: true},
    black: {type: String, required: true},
    began_on: {type: Date, default: () => new Date()},
    finished: {type: Boolean, default: false},
    pgn: {type: String, default: 'start'},
})

MatchSchema.statics.recordMatch = async (white, black, pgn, finished) => {
    try {
        const match = new Match({
            white: white,
            black: black,
            pgn: pgn,
            finished: finished
        });
        
        await match.save()

        if (white != "Guest")
            await User.findOneAndUpdate({ username: white }, { $inc: { played: 1 }, $push: { matches: match._id } });
        if (black != "Guest")
            await User.findOneAndUpdate({ username: black }, { $inc: { played: 1 }, $push: { matches: match._id } });
        
    } catch (err) {
        console.log(err);
    }
};

const Match = mongoose.model("Match", MatchSchema);
module.exports = Match;