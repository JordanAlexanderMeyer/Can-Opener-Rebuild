var urlParams = new URLSearchParams(window.location.search);
var topicValue = urlParams.get('topic');
var sideValue = urlParams.get('side');
var roomValue = urlParams.get('room');

document.getElementById('videochat').src = `https://tokbox.com/embed/embed/ot-embed.js?embedId=08dcf5e1-909b-4fe1-876b-64527e849d41&room=${roomValue}&iframe=true`;