// Server Setup
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App listening on port ${port}.`));

app.use(express.static('public'));

/*
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https')
    res.redirect(`https://${req.header('host')}${req.url}`)
  else
    next()
});
*/

// GraphQL API
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    getNum(topic: String!, side: String!): [String],
    delNum(topic: String!, side: String!, room: String!): String,
    displayQueue: [[String]]
    clearQueue: [[String]]
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

// Function for removing exited users
function deleteArrayElement(array, value) {
  var i = 0;
  while (i < array.length) { 
     if ( array[i] == value) {
       array.splice(i, 1); 
     }
     i ++; 
  }
}  

// The root provides a resolver function for each API endpoint
var root = {
  getNum: function ({topic, side}) {
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
        console.log('delNum error');
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
        console.log('delNum error');
      }
    } else {
      console.log('delNum error');
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

app.use('/graphql', graphqlHTTP({
	schema: schema,
	rootValue: root,
	graphiql: true,
}));