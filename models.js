
var mongoose = require("mongoose")
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId;

var PullRequestSchema = new Schema({
    number: { type: Number, required: true },
    on_staging: { type: Boolean, default: false }
});

var PullRequest = mongoose.model("PullRequest", PullRequestSchema);

module.exports = {
  PullRequest: PullRequest
};
