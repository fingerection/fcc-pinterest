var ImageClass = function() {
  this.id = 0;
  this.store = {};
};

ImageClass.prototype.getAll = function(author) {
  var result = [];
  for(var k in this.store) {
    if (author !== undefined) {
      if(this.store[k].author !== author) {
        continue;
      }
    }
    result.push(this.store[k]);
  }
  return result;
};

ImageClass.prototype.create = function(title, url, author) {
  this.id += 1;
  var image = {
    id: this.id,
    title: title,
    url: url,
    author: author
  };
  this.store['index:'+this.id] = image;
};

ImageClass.prototype.delete = function(id, author) {
  if (this.store['index:'+id] === undefined) {
    return;
  }
  if(this.store['index:'+id].author !== author) {
    return;
  }
  delete this.store['index:'+id];
};

module.exports = ImageClass;