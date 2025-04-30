const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = require('./user')

const MatchSchema = new Schema({
    white: {type: String, required: true},
    black: {type: String, required: true},
    began_on: {type: Date, default: () => new Date()},
    finished: {type: Boolean, default: false},
    fen: {type: String, default: 'start'},
    pgn: {type: String, default: 'start'}
})

MatchSchema.statics.recordMatch = async (white, black, pgn, fen, finished, matchID = null) => {
    try {
        if (matchID != undefined) {
            await Match.findByIdAndUpdate(
                matchID,
                { white, black, pgn, fen, finished },
                { new: true }
            );
            console.log(`Match ${matchID} updated successfully.`);
        } else {
            const match = new Match({
                white,
                black,
                fen,
                pgn,
                finished
            });

            await match.save();

            if (white !== "Guest") {
                await User.findOneAndUpdate(
                    { username: white },
                    { $inc: { played: 1 }, $push: { matches: match._id } }
                );
            }
            if (black !== "Guest" && black !== white) {
                await User.findOneAndUpdate(
                    { username: black },
                    { $inc: { played: 1 }, $push: { matches: match._id } }
                );
            }

            console.log(`New match created with ID: ${match._id}`);
        }
    } catch (err) {
        console.error("Error in recordMatch:", err);
    }
};

const Match = mongoose.model("Match", MatchSchema);
module.exports = Match;