"use strict";

var randomName = function() {

  var animals = ['pigeon', 'seagull', 'bat', 'owl', 'sparrows', 'robin', 'bluebird', 'cardinal', 'hawk', 'fish', 'shrimp', 'frog', 'whale', 'shark', 'eel', 'seal', 'lobster', 'octopus', 'mole', 'shrew', 'rabbit', 'chipmunk', 'armadillo', 'dog', 'cat', 'lynx', 'mouse', 'lion', 'moose', 'horse', 'deer', 'raccoon', 'zebra', 'goat', 'cow', 'pig', 'tiger', 'wolf', 'pony', 'antelope', 'buffalo', 'camel', 'donkey', 'elk', 'fox', 'monkey', 'gazelle', 'impala', 'jaguar', 'leopard', 'lemur', 'yak', 'elephant', 'giraffe', 'hippopotamus', 'rhinoceros', 'grizzlybear'];

  var colors = ['silver', 'gray', 'black', 'red', 'maroon', 'olive', 'lime', 'green', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];

  return colors[Math.floor(Math.random() * colors.length)] + '_' + animals[Math.floor(Math.random() * animals.length)];

}

var plugin = function() {
    
    let Me = {
        construct: function() {

            console.log('init called', this.parent);

            this.parent.set('username', randomName());

        }

    }

    return {
        namespace: 'randomUsername',
        extends: {
            Me
        }
    }

}

if(typeof module !== "undefined") {
    module.exports = plugin;
} else {
    window.randomUsername = plugin;
}
