var VoteClass = function() {
  this.id = 1;
  this.votes = {};
};
VoteClass.prototype.create = function(name, options, author) {
  var vote = {
    id: this.id,
    name: name,
    options: options,
    author
  };
  this.votes['index:' + this.id] = vote;
  this.id += 1;
};
VoteClass.prototype.listAll = function(author) {
  var result = [];
  for (var k in this.votes) {
    if (author !== undefined) {
      if (this.votes[k].author !== author) {
        continue;
      }
    }
    result.push(this.votes[k]);
  }
  return result;
};
VoteClass.prototype.getById = function(voteId) {
  return this.votes['index:' + voteId];
};
VoteClass.prototype.vote = function(voteId, optionId) {
  console.log(optionId);
  var vote = this.votes['index:' + voteId];
  if (vote !== undefined) {
    for (var i = 0; i < vote.options.length; i++) {
      if (vote.options[i].id === optionId) {
        vote.options[i].count += 1;
      }
    }
  }
};
VoteClass.prototype.delete = function(voteId, user) {
  var vote = this.votes['index:' + voteId];
  if (vote.author === user) {
    delete this.votes['index:' + voteId];
  }
}
module.exports = VoteClass;