var urlParams = new URLSearchParams(window.location.search);
var topicValue = urlParams.get('topic');
var sideValue = urlParams.get('side');
var roomValue = urlParams.get('room');
var status = '';

// Remove the user from queue if they leave the waiting room before being paired. Doesn't work on mobile!
window.onbeforeunload = removeFromQueue;

// Runs function every 5 seconds
window.setInterval(() => getPartner(), 5000);

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

function getPartner() {
	// Checks to see if user is in the queue. If not in queue, must be paired up. Move on to room.
	var query = `query GetPartner($topicValue: String!, $sideValue: String!, $roomValue: String!) {
		getPartner(topic: $topicValue, side: $sideValue, room: $roomValue)
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
		status = data['data']['getPartner'];
		console.log(status);
		if (status == 'paired') {
			// Removed call room
			//location.href = `../call_room/index.html?topic=${topicValue}&side=${sideValue}&room=${roomValue}`;
			location.href = `https://appr.tc/r/${roomValue}`;
		}
	})
	.catch(function(error) {
		console.log(error);
	});
}