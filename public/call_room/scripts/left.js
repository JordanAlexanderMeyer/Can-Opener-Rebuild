var urlParams = new URLSearchParams(window.location.search);
var topicValue = urlParams.get('topic');
var sideValue = urlParams.get('side');
var roomValue = urlParams.get('room');

document.getElementById('videochat').src = "https://appr.tc/r/" + roomValue;

// If the user leaves the waiting room before being paired, remove them from the queue
window.onbeforeunload = removeFromQueue;

function removeFromQueue() {
	// Remove the user from the queue it is in
	var query = `query DelNum($topicValue: String!, $sideValue: String!, $roomValue: String!) {
		delNum(topic: $topicValue, side: $sideValue, room: $roomValue)
	}`;

	fetch('/graphql', {
	 	method: 'POST',
	 	headers: {
	  		'Content-Type': 'application/json',
	    	'Accept': 'application/json',
	  	},
	  	body: JSON.stringify({
	    	query,
	    	variables: { topicValue, sideValue, roomValue },
	  	})
	})
	.then(r => r.json())
	.then(function(data) {
		console.log(data['data']['delNum']);
	})
	.catch(function(error) {
		console.log(error);
	});
}