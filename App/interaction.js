function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

/*
  server:port endpoint
  name: api name
  data: 2 chunk of data session (user id) and other data is in more object
  callback: function to be called after sending request
*/
function action(server, port, method, name, callback, more = {}) {
	// send the cookie in http request header
  var session = { 'pseudo': readCookie('pseudo'), 'hash': readCookie('hash') };
  $.ajax({
      type: method,
      url: 'http://' + server + ':' + port + '/' + name ,
      data: { session , more },
      error: function (data) { push_notification('Failed to contact the server.', 1000, 'wrong'); },
      success: function (data) { callback(data); }
    });
}
