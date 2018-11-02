// Server Setup
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

// Socket.io 
io.on('connection', function(socket) {
  var topic = '';
  var side = '';
  var room = '';
  socket.on('newUser', function(topicValue, sideValue, roomValue) {
    topic = topicValue;
    side = sideValue;
    room = roomValue;
  });
  console.log('a user connected');
  socket.on('disconnect', function() {
    // Removes user from queue when they disconnect from the waiting room
    console.log(topic, side, room);
    root.delNum({topic, side, room});
    console.log('user disconnected');
    });
});

http.listen(port, () => console.log(`App listening on port ${port}.`));

// GraphQL API
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// GraphQL Schema
var schema = buildSchema(`
  type Query {
    getNum(topic: String!, side: String!): [String],
    delNum(topic: String!, side: String!, room: String!): String,
    displayQueue: [[String]],
    clearQueue: [[String]],
    getPartner(topic: String!, side: String!, room: String!): String
  }
`);

// Create queues for abortion
var abortionForQueue = [];
var abortionAgaQueue = [];
var abortionNeuQueue = [];

// Create queues for gun_control
var gunForQueue = [];
var gunAgaQueue = [];
var gunNeuQueue = [];

// Function for removing users who have closed the browser tab or gone back while in waiting room
function deleteArrayElement(array, value) {
  var i = 0;
  while (i < array.length) { 
     if ( array[i] == value) {
       array.splice(i, 1); 
     }
     i ++; 
  }
}  

// GraphQL root provides a resolver function for each API endpoint
var root = {
  getNum: function ({topic, side}) {
    /* 
    If there is no one in opposite queue, puts user in queue and returns 'unpaired' and a room number. 
    If there is a person 'X' in opposite queue, removes X from opposite queue and returns 'paired' and X's room number.
    */
    var output = [];
    // Abortion
    if (topic == 'abortion') {
      if (side == 'pro_life') {
        if (abortionForQueue.length != 0) {
          output = ['paired', abortionForQueue.pop()];
        } else {
          var newUser = Math.random().toString().slice(2);
          abortionAgaQueue.unshift(newUser);
          output = ['unpaired', newUser];
        }
      } else if (side == 'pro_choice') {
        if (abortionAgaQueue.length != 0) {
          output = ['paired', abortionAgaQueue.pop()];
        } else {
          var newUser = Math.random().toString().slice(2);
          abortionForQueue.unshift(newUser);
          output = ['unpaired', newUser];
        }
      } else {
        console.log('getNum error');
      }
    // Gun Control
    } else if (topic == 'gun_control') {
      if (side == 'for') {
        if (gunAgaQueue.length != 0) {
          output = ['paired', gunAgaQueue.pop()];
        } else {
          var newUser = Math.random().toString().slice(2);
          gunForQueue.unshift(newUser);
          output = ['unpaired', newUser];
        }
      } else if (side == 'against') {
        if (gunForQueue != 0) {
          output = ['paired', gunForQueue.pop()];
        } else {
          var newUser = Math.random().toString().slice(2);
          gunAgaQueue.unshift(newUser);
          output = ['unpaired', newUser];
        }
      } else {
        console.log('getNum error');
      }
    } else {
      console.log('getNum error');
    }
    return output; 
  },

  delNum: function ({topic, side, room}) {
    // Removes a user from queue
    var output = ''
    // Abortion
    if (topic == 'abortion') {
      if (side == 'pro_life') {
        if (abortionAgaQueue.includes(room)) {
          deleteArrayElement(abortionAgaQueue, room);
          output = "Room was deleted.";
        } else {
          output = "User was already paired."
        }
      } else if (side == 'pro_choice') {
        if (abortionForQueue.includes(room)) {
          deleteArrayElement(abortionForQueue, room);
          output = "Room was deleted.";
        } else {
          output = "User was already paired."
        }
      } else {
        console.log('delNum error1');
      }
    // Gun Control
    } else if (topic == 'gun_control') {
      if (side == 'for') {
        if (gunForQueue.includes(room)) {
          deleteArrayElement(gunForQueue, room);
          output = "Room was deleted.";
        } else {
          output = "User was already paired."
        }
      } else if (side == 'against') {
        if (gunAgaQueue.includes(room)) {
          deleteArrayElement(gunAgaQueue, room);
          output = "Room was deleted.";
        } else {
          output = "User was already paired."
        }
      } else {
        console.log('delNum error2');
      }
    } else {
      console.log('delNum error3');
    }
    return output;
  },

  getPartner: function({topic, side, room}) {
    /*
    Returns 'unpaired' if the user is in queue and 'paired' if the user is not. 
    This is because, if the user is not in the queue and they are still in the waiting room, they must have been paired up with another user. 
    */
    var output = ''
    // Abortion
    if (topic == 'abortion') {
      if (side == 'pro_life') {
        if (abortionAgaQueue.includes(room)) {
          output = "unpaired";
        } else {
          output = "paired";
        }
      } else if (side == 'pro_choice') {
        if (abortionForQueue.includes(room)) {
          output = "unpaired";
        } else {
          output = "paired";
        }
      } else {
        console.log('getPartner error');
      }
    // Gun Control
    } else if (topic == 'gun_control') {
      if (side == 'for') {
        if (gunForQueue.includes(room)) {
          output = "unpaired";
        } else {
          output = "paired";
        }
      } else if (side == 'against') {
        if (gunAgaQueue.includes(room)) {
          output = "unpaired";
        } else {
          output = "paired";
        }
      } else {
        console.log('getPartner error');
      }
    } else {
      console.log('getPartner error');
    }
    return output;
  },

  displayQueue: function() {
    return [abortionForQueue, abortionAgaQueue, gunForQueue, gunAgaQueue];
  },
  
  clearQueue: function() {
  	abortionForQueue = [];
  	abortionAgaQueue = [];
  	gunForQueue = [];
  	gunAgaQueue = [];
  	return [abortionForQueue, abortionAgaQueue, gunForQueue, gunAgaQueue];
  }
}

// Single endpoint at '/graphql'
app.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true,
}));