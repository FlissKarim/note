const server = 'localhost';
const port = '8000';

var page = 'login';
var collision = false;
// synchronise  note every syncTime seconds
var syncTime = 2000;
var mustSync = false;
var lastSync = new Date().toISOString().slice(0, 19).replace('T', '/');
// stock all note locales and got from synch with server
var localNotes = {};
// notes got from synch with server
var onlineNotes = [];
// list of note to be showen, after merge locales and onlines, after checking collisions note
var listNotes = [];

// extract a hint of string (n characters)
function hint(str, n) {
    var res = "";
    var i = 0;
    var tag = false;
    while (n >= 0 && i < str.length) {
        if (str.charAt(i) == '<') {tag = true; res +=" "; }
        else if (str.charAt(i) == '>') tag = false;
        else if (!tag) { res += str.charAt(i); n--;}
        i++;
    }
    return res + '..';
}

function is_connected(a, b, param) {
	action(server, port, 'post', 'CheckUser', function (data) {
		if (data == '200') b(param); else a(param);
	});
}

// remove cookies & redirect to login page
function logout() {
	document.cookie="pseudo=";
	document.cookie="hash=";
	document.cookie="birthday=";
	login('body');
	push_notification('Disconnected.', 1000, 'valid');
}

// interaction logic in login page
function int_login() {
  jQuery(document).ready(function($) {
	$(document).on("click", "#login-submit",  function () {
	var pseudo =  $("#login-pseudo").val();
	var hash =  MD5($("#login-hash").val());
	document.cookie = "pseudo=" + pseudo;
	document.cookie = "hash=" + hash;
	action(server, port, 'post', 'Connect', function (data) {
		if(data == '200') noteList('body');
		else push_notification('User is not exists.', 1000, 'wrong');
	});
		$('"#login-submit"').unbind();
	});

	$(document).on("click", "#login-signup",  function () {
		signup('body');
  		$('"#login-signup"').unbind();
	});
});
}

// interaction logic in signup page
function int_signup() {
  jQuery(document).ready(function($) {
	// pour passer les infos de login je peux creer un cookie avec ces info, si le serveur valide l'entree donc je le garde au navigateur ce cookie sinon je la supprime
	$(document).on("click", "#signup-submit",  function () {

	var hash =  MD5($("#signup-hash").val());

  	document.cookie = "pseudo=" + $("#signup-pseudo").val();
  	document.cookie = "hash=" + hash;
  	document.cookie = "date=" + $("#signup-birthday").val();

	action(server, port, 'post', 'NewUser', function (data) {
			if(data == '200') {
				login('body');
			}
			else {
				// remove cookie
				document.cookie="pseudo="
				document.cookie="hash="
				document.cookie="birthday="
				push_notification('User already exists.', 1000, 'wrong');
			} // reset the cookie caus the entries are wrong
		});
		$('"#signup-submit"').unbind();
	});

	$(document).on("click", "#signup-login",  function () {
		login('body');
  		$('"#signup-login"').unbind();
	});

});

}

// construct note block in list note page
function noteBlock(e) {
	// show preview inline even if it contain breaks
	e.body = e.body.replace('<div>',' ');
	e.body = e.body.replace('</div>',' ');

	div('.note-list', 'note-block', 'note-block' + e.id);
		div('#note-block' + e.id, 'preview', 'preview' + e.id);
			div('#preview' + e.id, 'head', 'head' + e.id);
				p('#head' + e.id, e.head);

			div('#preview' + e.id , 'body', 'body' + e.id);
				p('#body' + e.id, hint(e.body, 20));

		div('#note-block' + e.id, 'favorite', 'favorite' + e.id);
			i('#favorite' + e.id, '', 'icon' + e.id, 'far fa-star');

  $('#note-block' + e.id).hide();
  $('#note-block' + e.id).slideDown(500);
}

// interaction logic in note list
function int_noteList() {
  // global containing notes, must be global to be accessed the search function and on ready
  jQuery(document).ready(function($) {

  	action(server, port, 'post', 'ImportAllNotes', function (data) {
		push_notification('Synchronisation..', 1000, 'valid');
		var obj = JSON.parse(data);
		// update onlineNotes
		onlineNotes = obj.list;
    	listNotes = [];
		collision = false;
		// combine new notes and the recents ones
		for (e of onlineNotes)
			if (! (e.id in localNotes) || e.date > localNotes[ e.id ].date) localNotes[ e.id ] = e;

		for ( let k in localNotes)
			listNotes.push( localNotes[k] );
		// sort note by date
		listNotes.sort((a, b) => a.date < b.date);

		// show notes
    	listNotes.map((e) => noteBlock(e));

		// coloring notes if there is any Collision
		for (let i in listNotes) {
			for (let j in listNotes) {
				if (listNotes[i].id != listNotes[j].id && listNotes[i].head == listNotes[j].head) {
					$('#note-block' + listNotes[i].id).css('color', 'red');
					$('#note-block' + listNotes[j].id).css('color', 'red');
					collision = true;
					push_notification('Collision prevent synchronisation.', 1000, 'wrong');
				}
			}
		}
	});
  	action(server, port, 'post', 'ImportAllFav', function (data) {
		var obj = JSON.parse(data);
 		for (e of obj.list)
 			$('#' + e.id).css('color', 'yellow');
	});
});

$(document).on("click", ".fa-star",  function () {
	var id = $(this).attr('id');
	var note = { 'id': id };
	action(server, port, 'post', 'toggleFavorite', function (data) {}, note);
	if ($('#' + id).css('color') == 'rgb(128, 128, 128)') {
		$('#' + id).css('color', 'yellow');
		push_notification('Added to favorites.', 1000, 'normal');
		}
	else {
		$('#' + id).css('color', 'gray');
		push_notification('Removed from favorites.', 1000, 'normal');
		}
	$('\'#' + id + '\'').unbind();
	return noteList('body');
});

// search note with key word in title or note itself
$('#note-list-search').on('input', function() {
    var val = $('#note-list-search').val().toLowerCase();
    // 1 empty note-list
    $('.note-list').empty();
    // 2 fitre L elements depend the (val)
    var F = listNotes.filter( (e) => e.head.toLowerCase().indexOf(val) > -1 || e.body.toLowerCase().indexOf(val) > -1);
    F.map((e) => noteBlock(e));
	$('"#note-list-search"').unbind();
});

$(document).on("click", ".note-block",  function () {
  // sent name note on server and get it data with action function
  // render the node-in
  var id = $(this).attr('id').replace($(this).attr('class'), '')
  action(server, port, 'post', 'ImportNote/' + id, function (data) {
	  var note = JSON.parse(data);
	  noteIn('body', note);
	});
	$('".note-block"').unbind();
});

$(document).on("click", "#add",  function () {
	  noteIn('body', { id: '', head: 'Title 1', body: '' });
  	  $('"#add"').unbind();
});

$(document).on("click", "#account",  function () {
	account('body');
  	$('"#account"').unbind();
});

$(document).on("click", "#option",  function () {
	logout();
  	$('"#option"').unbind();
});

}

// interaction logic in note page
function int_noteIn() {

  jQuery(document).ready(function($) {
	// return to note list
	$(document).on("click", "#note-in-return",  function () {
  		noteList('body');
  		$('"#note-in-return"').unbind();
	});

	$(document).on("click", "#note-in-search",  function () {
  		alert('implement me');
  		$('"#note-in-search"').unbind();
	});

	// toggle bold in body note
	$(document).on("click", "#markup-bold",  function () {
		document.execCommand('bold');
		$('"#markup-bold"').unbind();
	});
	// toggle italic in body note
	$(document).on("click", "#markup-italic",  function () {
		document.execCommand('italic');
		$('"#markup-italic"').unbind();
	});
	// toggle underline in body note

	$(document).on("click", "#markup-underline",  function () {
		document.execCommand('underline');
		$('"#markup-underline"').unbind();
	});
	$(document).on("click", "#markup-list",  function () {
		alert("lol");
		$('#body').append('<ul><li></li></ul>');

		$('"#markup-list"').unbind();
	});
	$(document).on("click", "#menu",  function () {
		$('.list-z').slideDown(200);
  		$('"#menu"').unbind();
	});

	$(document).on("click", "#element-z-exit",  function () {
		$('.list-z').slideUp(200);
		noteList('body');
  		$('"#element-z-exit"').unbind();
	});

	$(document).on("click", "#element-z-delete",  function () {
    	// set true to synchronize
    	mustSync = true;
		$('.list-z').slideUp(200);

		var id = $('.note').attr('id');
		var note = { 'id': id };
		// delete note from server
		action(server, port, 'post', 'DeleteNote', function (data) {
  			push_notification('Deleted.', 1000, 'valid');
		}, note);
		// delete note localy
		delete localNotes[id];
		noteList('body');
		$('"#element-z-delete"').unbind();
	});

	$(document).on("click", "#element-z-save",  function () {
		// set true to synchronize
		mustSync = true;
		$('.list-z').slideUp(200);

		var head = $('#head').val();
		var body = $('#body').html();
		var id = $('.note').attr('id');

		if (id =='') id = MD5(new Date().getTime().toString());

		// date format YYYY MM DD
		var edited_date = new Date().toISOString().slice(0,19).replace('T', '/');

		var note = { 'id': id, 'head': head, 'body': body, 'date': edited_date };
		// update the note
		localNotes[id] = note;
		$('"#element-z-save"').unbind();
	});
});
}

function int_account() {
	jQuery(document).ready(function($) {
		// return to note list
		$(document).on("click", "#note-in-return",  function () {
			  noteList('body');
			  $('"#note-in-return"').unbind();
		});
		// update account informations
		$(document).on("click", "#update-submit",  function () {
			var oldHash = MD5($('#old-password-field').val());
			var newHash = MD5($('#new-password-field').val());
			var date = $('#date-field').val();
			var data = {
				oldPassword: oldHash,
				newPassword: newHash,
				date: date
			}
			action(server, port, 'post', 'UpdateUser', function (data) {
			}, data);
			$('"#update-submit"').unbind();
	  });
		// delete account and all user informations
		$(document).on("click", "#delete-submit",  function () {
			action(server, port, 'post', 'DeleteUser', function (data) {
				push_notification(data, 2000, 'wrong');
				login('body');
			});
			$('"#delete-submit"').unbind();
	  });
	});
}
// function called by timer
function synchronisation() {
	if (!collision && mustSync) {
		for (let k in localNotes) {
			if (localNotes[k].date > lastSync)
				action(server, port, 'post', 'ExportNote', function (data) {}, localNotes[k]);
    }
		push_notification('Synchronized.', 1000, 'valid');
		lastSync = new Date().toISOString().slice(0, 19).replace('T', '/');
		mustSync = false;
	}
}
	function check_notification() {
		action(server, port, 'post', 'Notification', function (data) {
			if(data != "")
				push_notification(data, 2000, 'valid');
		});
	}
  jQuery(document).ready(function($) {
  	is_connected(login, noteList, 'body'); //false -> login : true -> noteList
	setInterval(function() { synchronisation(); }, syncTime); // sync every 2sec
	setInterval(function() { check_notification(); }, 5000); // check notification every 5sec
	});
