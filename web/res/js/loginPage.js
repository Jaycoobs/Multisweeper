const urlParams = new URLSearchParams(window.location.search);
const usernameInput = $('#usernameInput');

const confirm = function() {
	$.get('/app/login', {name: usernameInput.val()})
		.done((data) => {
			console.log('Request returned data: ');
			console.log(data);
			window.location.href = urlParams.get('redirect') || '/';
		})
		.fail((jqxhr, status, error) => {
			console.log(`Request Failed: ${status}`);
			console.log(jqxhr.responseText);
		});
}

document.getElementById('confirmButton').onclick = confirm;
