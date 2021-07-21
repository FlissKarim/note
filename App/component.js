function script(source, name) {
  $(source).append('<script type="text/javascript" src="'+ name +'.js" ></script>');
}
function title(source, str) {
  $(source).append('<div class="title"><h1><u>'+ str +'</u></h1></div>');
}

function enter(source, ctype, name, placeholder, id='') {
	$(source).append('<div class="enter"><input type="'+ctype+'" id ="'+id+'" name="'+name+'" placeholder="'+placeholder+'" required/></div>');
}

function input(source, ctype, pclass, name, placeholder, value, id='') {
	$(source).append('<input type="'+ctype+'" id = "'+id+'" class="'+pclass+'" value="'+value+'" placeholder="'+placeholder+'"/>');
}

function br(source) {
	$(source).append('</br>');
}

function div(source, pclass, id = '') {
	$(source).append('<div id = "'+id+'" class="'+ pclass +'"> </div>');
}

function form(source, pclass, pmethod, paction, id='') {
	$(source).append('<form id="'+id+'" class="'+ pclass +'" method="'+pmethod+'" action="'+paction+'"> </form>');
}

function p(source, str, id='') {
	$(source).append('<p id="'+id+'" >'+str+'</p>');
}

function i(source, str, id='', pclass = '') {
	$(source).append('<i class="'+ pclass +'" + id="'+id+'" 	>'+str+'</i>');
}

function a(source, link, str, id = '') {
  $(source).append('<a id="'+id+'" href="'+link+'">'+ str +'</a>');
}

function link(source, str, id) {
	$(source).append('<b class ="link" id="'+id+'" 	>'+str+'</b>');
}

function img(source, src, pclass, id){
	$(source).append('<img class ="'+pclass+'" id="'+id+'" src="'+src+'"></img>');
}
function notification(source, message, color) {
  $(source).append('<div class="news-container" style="display:none;">'  + '<div class="notification" style = "background-color:'+color+';">' + '<p class="content" >'+message+'</p> </div> </div>');
}

function editable(source, str, id = '') {
  $(source).append('<div contenteditable="true" id = "'+id+'">' + str +'</div>');
}
