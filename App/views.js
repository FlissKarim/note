// make .note-list or .note tke the rest of body height // i cant do it with css
function adapt(element) {
	if (element == '.note-list') {
		var h = $('body').height() - $('.title').height() - $('.title').height();
		$(element).height(h);
		}
	else if (element == '.note') {
		$('body').height() - $('.bar').height() - $('.head').height();
		$('.note-in-body').height(h);
		$('#body').height(h);
		}
}


function login(node) {
	// ajouter un 2eme js  fichier pour son interaction avec la page
	$(node).empty();
	$(node).hide();

	title(node, 'Note App');

	form(node, 'login', 'post', '') ;
		enter('.login', 'email', 'pseudo', 'Email', 'login-pseudo');
		br('.login');

		enter('.login', 'password', 'hash', 'Password', 'login-hash');
		br('.login');

		input('.login', 'button', 'circle-button', '', '', 'Login', 'login-submit');

	br(node);

  	link(node,'Forgot password?', 'forgot');

	br(node);

  	link(node, 'Not registered yet?', 'login-signup');

  	$(node).fadeIn("slow");

	int_login();
}


function signup(node) {
	$(node).empty();
	$(node).hide();

	title(node, 'Note App');
	form(node, 'signup', 'post', '') ;
		enter('.signup', 'email', 'pseudo', 'Email', 'signup-pseudo');
		br('.signup');

		enter('.signup', 'password', 'hash', 'Password', 'signup-hash');
		br('.signup');

		enter('.signup', 'date', 'birthday', 'YYYY-MM-DD', 'signup-birthday');
		br('.signup');

		input('.signup', 'button', 'circle-button', '', '', 'Signup', 'signup-submit');

	br(node);

  	link(node, 'Already registered?', 'signup-login');

  	$(node).fadeIn("slow");

	int_signup();
}

function noteIn(node, note) {
	$(node).empty();
	$(node).hide();

	div(node, 'bar');
		div('.bar', 'return-button');
			i('.return-button', '', 'note-in-return', 'fas fa-arrow-left');

			div('.bar', 'search-button');
		i('.search-button', '', 'note-in-search', 'fas fa-search');

	div(node, 'note', note.id);
		div('.note', 'head', 'note-in-head');
			input('.head', 'text', '', '', '', note.head, 'head');

		// insert bold and italic button style
		div('.note', 'markup', 'markup');
			input('.markup', 'button', 'markup-btn', '', '', 'B', 'markup-bold');
			input('.markup', 'button', 'markup-btn', '', '', 'I', 'markup-italic');
			input('.markup', 'button', 'markup-btn', '', '', 'U', 'markup-underline');
			input('.markup', 'button', 'markup-btn', '', '', '•', 'markup-list');

		div('.note', 'body', 'note-in-body');
			editable('.body', note.body, 'body');

	div('.body', 'circle-button-z');
	i('.circle-button-z', '', 'menu', 'fas fa-bars');

	// menu list : hidden by default
	div(node, 'list-z');

		div('.list-z', 'element-z', 'element-z-save');
		p('#element-z-save', 'SAVE');

		div('.list-z', 'element-z', 'element-z-delete');
		p('#element-z-delete', 'DELETE');

		div('.list-z', 'element-z', 'element-z-exit');
		p('#element-z-exit', 'EXIT');

	$('.list-z').hide();



  	$(node).fadeIn("slow", function() {
		$('.circle-button-z').animate( { deg: 360 },
    		{duration: 500, step: function(now) {$(this).css({ transform: 'rotate(' + now + 'deg)' });}
    	});
  	});
	int_noteIn();
}

function noteList(node) {

	$(node).empty();
	$(node).hide();

	title(node, 'Note App');

	div(node, 'search');
		input('.search', 'text', '', '', 'Type to search', '', 'note-list-search');

	div(node, 'note-list');

	div(node, 'circle-button-z');
		i('.circle-button-z', '', 'add', 'fas fa-plus');

	div(node, 'account-button-z');
		i('.account-button-z', '', 'account', 'fas fa-user');

	div(node, 'option-button-z');
		i('.option-button-z', '', 'option', 'fas fa-chevron-circle-left');


  $(node).fadeIn("slow", function() {
	  $('.circle-button-z').animate( { deg: 360 },
		{duration: 500, step: function(now) {$(this).css({ transform: 'rotate(' + now + 'deg)' });}}
	  );
  });

	adapt('.note-list');
	int_noteList();
}

function account(node) {
	$(node).empty();
	$(node).hide();

	div(node, 'bar');
		div('.bar', 'return-button');
			i('.return-button', '', 'note-in-return', 'fas fa-arrow-left');
	br(node);

	form(node, 'update-form', 'post', '') ;
		var pseudo = readCookie('pseudo');
		title('.update-form', pseudo, 'pseudo-field');
		br('.update-form');
		enter('.update-form', 'password', '', 'Old password', 'old-password-field');
		br('.update-form');
		enter('.update-form', 'password', '', 'New password', 'new-password-field');
		br('.update-form');
		enter('.update-form', 'date', '', 'Date', 'date-field');
		br('.update-form');
		input('.update-form', 'submit', 'update-button', '', '', 'UPDATE', 'update-submit');
		br('.update-form');
		br('.update-form');
		input('.update-form', 'button', 'delete-button', '', '', 'DELETE', 'delete-submit');

  	$(node).fadeIn("slow");
	int_account();
}