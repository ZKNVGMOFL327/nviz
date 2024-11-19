let fontSize = 16;

function increaseFontSize() {
	fontSize += 2;
	let elements = document.getElementsByClassName('text');
	for (let i = 0; i < elements.length; i++) {
		elements[i].style.fontSize = fontSize + 'px';
	}
}

function decreaseFontSize() {
	fontSize -= 2;
	let elements = document.getElementsByClassName('text');
	for (let i = 0; i < elements.length; i++) {
		elements[i].style.fontSize = fontSize + 'px';
	}
}