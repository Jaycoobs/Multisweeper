const widthInput = $('#widthInput');
const heightInput = $('#heightInput');
const minesInput = $('#minesInput');

const confirm = function() {
	let width = parseInt(widthInput.val());
	let height = parseInt(heightInput.val());
	let mines = parseInt(minesInput.val());

	$.get('/app/create/room', {width: width, height: height, mines: mines})
		.done((data) => {
			console.log('Request returned data: ');
			console.log(data);
			window.location.href = "/room/" + data.code;
		})
		.fail((jqxhr, status, error) => {
			console.log(`Request Failed: ${status}`);
			console.log(jqxhr.responseText);
		});
}

document.getElementById('confirmButton').onclick = confirm;
