
var mongoose = require("mongoose")
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId;

var PullRequestSchema = new Schema({
  number: { type: Number, required: true },
  on_staging: { type: Boolean, default: false },
  deploys: [ new Schema({
    user: { type: ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }) ]
});

var PullRequest = mongoose.model("PullRequest", PullRequestSchema);

var UserSchema = new Schema({
  username: { type: String, required: true },
  accessToken: { type: String },
  profileUrl: { type: String },
  github_id: { type: Number }
});

var User = mongoose.model("User", UserSchema);

module.exports = {
  PullRequest: PullRequest,
  User: User
};
