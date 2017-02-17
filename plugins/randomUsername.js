(function() {

    var namespace = 'randomUsername';
    // gives users a random username if they are anon

    // handy function to generate a color_animal combo at random
    var randomName = () => {

        // list of friendly animals
        let animals = ['pigeon', 'seagull', 'bat', 'owl', 'sparrows', 'robin', 'bluebird', 'cardinal', 'hawk', 'fish', 'shrimp', 'frog', 'whale', 'shark', 'eel', 'seal', 'lobster', 'octopus', 'mole', 'shrew', 'rabbit', 'chipmunk', 'armadillo', 'dog', 'cat', 'lynx', 'mouse', 'lion', 'moose', 'horse', 'deer', 'raccoon', 'zebra', 'goat', 'cow', 'pig', 'tiger', 'wolf', 'pony', 'antelope', 'buffalo', 'camel', 'donkey', 'elk', 'fox', 'monkey', 'gazelle', 'impala', 'jaguar', 'leopard', 'lemur', 'yak', 'elephant', 'giraffe', 'hippopotamus', 'rhinoceros', 'grizzlybear'];
        
        // list of friendly colors
        let colors = ['silver', 'gray', 'black', 'red', 'maroon', 'olive', 'lime', 'green', 'teal', 'blue', 'navy', 'fuchsia', 'purple'];

        // randomly generate a combo of the two and return it
        return colors[Math.floor(Math.random() * colors.length)] + '_' + animals[Math.floor(Math.random() * animals.length)];

    }

    var plugin = (chat) => {

        // define send middleware
        class extension {
            construct () {

                let state = this.parent.state(chat);

                state.username = randomName();

                console.log('assign random name')
                this.parent.update(state, chat);
            }

        };

        // define both the extended methods and the middleware in our plugin
        return {
            namespace: 'randomName',
            extends: {
                Me: extension
            }
        }

    }

    if(typeof module !== "undefined") {
        module.exports = plugin;
    } else {
        window.OpenChatFramework.plugin[namespace] = plugin;
    }

})();
