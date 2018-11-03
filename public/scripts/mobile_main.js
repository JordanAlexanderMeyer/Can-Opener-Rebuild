var topic = document.getElementById('topic');
var side = document.getElementById('side');
var submit = document.getElementById('submit');
var roomValue = '';
var status = '';

// Disable button initially
document.getElementById("submit").disabled = true;

// When topic is changed, add select options
topic.addEventListener("change", populate);

// When the side is changed, enable the button
side.addEventListener("change", enableButton);

// When button is pressed, run pressedSubmit
submit.addEventListener("click", pressedSubmit);

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
		location.href = `call_room/index.html?topic=${topicValue}&side=${sideValue}&room=${roomValue}`;
		//location.href = `https://appr.tc/r/${roomValue}`;
	} else if (status == 'unpaired') {
		location.href = `waiting_room/mobile_${topicValue}.html?topic=${topicValue}&side=${sideValue}&room=${roomValue}`;
	} else {
		console.log('roomChooser error');
	}
}

function populate() {
	// Adds 'side' select choices once a 'topic' has been chosen
	side.innerHTML = "";
	if(topic.value == "default") {
		var optionArray = ["default|Choose a Side"];
	} else if(topic.value == "abortion") {
		var optionArray = ["default|Choose a Side", "pro_life|Pro-Life", "pro_choice|Pro-Choice"];
	} else if(topic.value == "gun_control") {
		var optionArray = ["default|Choose a Side", "for|For", "against|Against"];
	}
	for(var option in optionArray) {
		var pair = optionArray[option].split("|");
		var newOption = document.createElement("option");
		newOption.value = pair[0];
		newOption.innerHTML = pair[1];
		side.options.add(newOption);
	}
	enableButton();
}

function enableButton() {
	// Enables button or disables it based on whether the form is completed or not
	if(topic.value != 'default' && side.value != 'default') {
		document.getElementById('submit').disabled = false;
	} else {
		document.getElementById('submit').disabled = true;
	}
}