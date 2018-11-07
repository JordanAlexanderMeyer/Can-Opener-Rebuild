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
  socket.on('disconnect', function() {
    // Removes user from queue when they disconnect from the waiting room
    root.delNum({topic, side, room});
    });
});

http.listen(port, () => console.log(`App listening on port ${port}.`));

// GraphQL API
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// GraphQL Schema
var schema = buildSchema(`
  type Query {
    getTopics(room: String): [[String]],
    getNum(topic: String!, side: String!): [String],
    delNum(topic: String!, side: String!, room: String!): String,
    displayQueue: [[[String]]],
    clearQueue: String,
    getPartner(topic: String!, side: String!, room: String!): String
  }
`);

// Topics
var topics = {'abortion': ['pro_life', 'pro_choice'], 'gun_control': ['for', 'against']};

// Queues
var queues = {};

// Create queues
for (i = 0; i < Object.keys(topics).length; i++) {
  var topic = Object.keys(topics)[i];
  queues[topic] = [[], []];
}

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
  getTopics: function ({room}) {
    var keys = Object.keys(topics);
    var response = []; 
    for (i = 0; i < keys.length; i++) {
      var list = [];
      list.push(keys[i]);
      list.push(topics[keys[i]][0]);
      list.push(topics[keys[i]][1]);
      response.push(list);
    }
    return response;
  },

  getNum: function ({topic, side}) {
    /* 
    If there is no one in opposite queue, puts user in queue and returns 'unpaired' and a room number. 
    If there is a person 'X' in opposite queue, removes X from opposite queue and returns 'paired' and X's room number.
    */

    if (side == topics[topic][0]) {
      if (queues[topic][1].length != 0) {
        return ['paired', queues[topic][1].pop()];
      } else {
        var newUser = Math.random().toString().slice(2);
        queues[topic][0].unshift(newUser);
        return ['unpaired', newUser];
      }
    } else if (side == topics[topic][1]) {
      if (queues[topic][0].length != 0) {
        return ['paired', queues[topic][0].pop()];
      } else {
        var newUser = Math.random().toString().slice(2);
        queues[topic][1].unshift(newUser);
        return ['unpaired', newUser];
      }
    } else {
      console.log('getNum error');
    }
  },

  delNum: function ({topic, side, room}) {
    // Removes a user from queue
    if (side == topics[topic][0]) {
      if (queues[topic][0].includes(room)) {
        deleteArrayElement(queues[topic][0], room);
        return "Room number was deleted"
      } else {
        return "Room number not found"
      }
    } else if (side == topics[topic][1]) {
      if (queues[topic][1].includes(room)) {
        deleteArrayElement(queues[topic][1], room);
        return "Room number was deleted"
      } else {
        return "Room number not found"
      }
    } else {
      console.log('delNum error');
    }
  },

  getPartner: function({topic, side, room}) {
    /*
    Returns 'unpaired' if the user is in queue and 'paired' if the user is not. 
    This is because, if the user is not in the queue and they are still in the waiting room, they must have been paired up with another user. 
    */

    if (side == topics[topic][0]) {
      if (queues[topic][0].includes(room)) {
        return "unpaired"
      } else {
        return "paired"
      }
    } else if (side == topics[topic][1]) {
      if (queues[topic][1].includes(room)) {
        return "unpaired"
      } else {
        return "paired"
      }
    } else {
      console.log('getPartner error');
    }
  },

  displayQueue: function() {
    var keys = Object.keys(queues);
    var response = []; 
    for (i = 0; i < keys.length; i++) {
      var list = [];
      list.push(queues[keys[i]][0]);
      list.push(queues[keys[i]][1]);
      response.push(list);
    }
    return response;
  },
  
  clearQueue: function() {
    var keys = Object.keys(queues);
  	for (i = 0; i < keys.length; i++) {
      queues[keys[i]][0] = [];
      queues[keys[i]][1] = [];
    }
    return 'cleared';
  }
}

// Single endpoint at '/graphql'
app.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true,
}));