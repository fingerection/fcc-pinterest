$(document).ready(function(){
    $('.deletelabel').click(function(e){
        // delete post
        var imageid = $(this).data('id');
        var data = {
            action: 'delete',
            imageid: imageid
        };
        $.post( "/my", data, function(data){
          $('#image'+imageid).remove();  
        });
        return false;
    });
});

$(window).load(function() {
  $('img').each(function() {
    if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0) {
      // image was broken, replace with your new image
      this.src = '/img/placeholder.png';
    }
  });
});