var GoingClass = function() {
  this.going = {};
};


GoingClass.prototype.getStatus = function(barId, userId) {
  var total = 0;
  var status = false;
  if(this.going[barId] !== undefined) {
    total = Object.keys(this.going[barId]).length;
    status = (this.going[barId][userId] !== undefined);
  }
  return {total: total, goingStatus: status}
};

GoingClass.prototype.doGoing = function(barId, userId) {
  if(this.going[barId] === undefined) {
    this.going[barId] = {};
  }
  this.going[barId][userId] = '1';
  console.log(this.going);
}

GoingClass.prototype.unGoing = function(barId, userId) {
  if(this.going[barId] === undefined) {
    return;
  }
  delete this.going[barId][userId];
}

module.exports = GoingClass;