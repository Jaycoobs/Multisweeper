const urlParams = new URLSearchParams(window.location.search);

const createRoom = function() { window.location.href = '/create/room'; }

document.getElementById('createRoomButton').onclick = createRoom;
$('#errorText').text(urlParams.get('error') || '');
