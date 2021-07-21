const delay = 400;
const color = { "valid": '#2ecc71', "wrong": '#a93226', "normal": '#FFA500'};
function push_notification(message, time, type) {
    notification('body', message, color[type]);
    $('.news-container').fadeIn(delay, function() {
      setTimeout( function() { pop_notification(); }, time);
    });
}

function pop_notification() {
    $('.news-container').fadeOut(delay, function() {
  		$('.news-container').empty();
  });
}
