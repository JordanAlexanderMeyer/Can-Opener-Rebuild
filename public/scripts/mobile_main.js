var topic = document.getElementById('topic');
var side = document.getElementById('side');
var submit = document.getElementById('submit');
var roomValue = '';
var status = '';
var sides = {};

// Disable button initially
document.getElementById("submit").disabled = true;

// When topic is changed, add select options
topic.addEventListener("change", populateSides);

// When the side is changed, enable the button
side.addEventListener("change", enableButton);
topic.addEventListener("change", enableButton);

// When button is pressed, run pressedSubmit
submit.addEventListener("click", pressedSubmit);

window.onload = getTopics();

function getTopics() {
	var query = `query GetTopics($roomValue: String) {
		getTopics(room: $roomValue)
	}`;

	fetch('/graphql', {
	 	method: 'POST',
	 	headers: {
	  		'Content-Type': 'application/json',
	    	'Accept': 'application/json',
	  	},
	  	body: JSON.stringify({
	    	query,
	    	variables: { roomValue },
	  	})
	})
	.then(r => r.json())
	.then(function(data) {
		// Add topics and sides to page
		var response = data['data']['getTopics'];
		var topics = [];

		for (i = 0; i < response.length; i++) {
			topics.push(response[i][0]);
			sides[response[i][0]] = [response[i][1], response[i][2]]
		};
		populateTopics(topics);
	})
	.catch(function(error) {
		console.log(error);
	});
}

function pressedSubmit() {
	// When user presses submit, send them to the appropriate place
	var topicValue = topic.value;
	var sideValue = side.value;
	var query = `query GetNum($topicValue: String!, $sideValue: String!) {
		getNum(topic: $topicValue, side: $sideValue)
	}`;

	fetch('/graphql', {
	 	method: 'POST',
	 	headers: {
	  		'Content-Type': 'application/json',
	    	'Accept': 'application/json',
	  	},
	  	body: JSON.stringify({
	    	query,
	    	variables: { topicValue, sideValue },
	  	})
	})
	.then(r => r.json())
	.then(function(data) {
		console.log(data['data']['getNum']);
		status = data['data']['getNum'][0];
		roomValue = data['data']['getNum'][1];
		roomChooser(topicValue, sideValue);
	})
	.catch(function(error) {
		console.log(error);
	});

}
function roomChooser(topicValue, sideValue) {
	// Decides where the user should be place: directly into videochat or in a waiting room
	if (status == 'paired') {
		//removing call room from use
		//location.href = `call_room/index.html?topic=${topicValue}&side=${sideValue}&room=${roomValue}`;
		location.href = `https://appr.tc/r/${roomValue}`;
	} else if (status == 'unpaired') {
		location.href = `waiting_room/mobile_${topicValue}.html?topic=${topicValue}&side=${sideValue}&room=${roomValue}`;
	} else {
		console.log('roomChooser error');
	}
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function populateTopics(topics) {
	// Add topic options
	for (i = 0; i < topics.length; i++) {
		var newOption = document.createElement("option");
		newOption.value = topics[i];
		newOption.innerHTML = toTitleCase(topics[i].replace("_", " "));
		topic.options.add(newOption);
	}
}

function populateSides() {
	// Clear previously added options
	side.innerHTML = "";
	for (i = 0; i < side.options.length; i++) {
		side.options[i] = null;
	}
	// Add new options
	var newOption = document.createElement("option");
		newOption.value = "default";
		newOption.innerHTML = "Choose a Side";
		side.options.add(newOption);

	for (i = 0; i < sides[topic.value].length; i++) {
		var newOption = document.createElement("option");
		newOption.value = sides[topic.value][i];
		newOption.innerHTML = toTitleCase(sides[topic.value][i].replace("_", " "));
		side.options.add(newOption);
	}
}

function enableButton() {
	// Enables button or disables it based on whether the form is completed or not
	if(topic.value != 'default' && side.value != 'default') {
		document.getElementById('submit').disabled = false;
	} else {
		document.getElementById('submit').disabled = true;
	}
}