To authorize this client as a Chat Engine User, use the ```connect``` function.

```js
let me = ChatEngine.connect('ian');
```

This connects to the PubNub Data Stream network on behalf of the browser running the code.

### ChatEngine.connect()

The function returns a ```User``` and connect to a global ```Chat```. The paramter ```ian``` is a unique identifier for the new ```User```.

PubNub Chat Engine is an object oriented framework, so when you see ```User``` and ```Chat```, it represents an actual object within the SDK.

- ***User*** - A client. The browser window.
- ***Chat*** - A chatroom that a ```User``` can join.

### Me

The ```User``` returned by the ```connect()``` method represents this browser window. We call that ```User``` ```me```.

## Usernames

In order to give every user a unique name, let's create a function that returns a random animal.

```js
const getUsername = () => {

  const animals = ['pigeon', 'seagull', 'bat', 'owl', 'sparrows', 'robin', 'bluebird', 'cardinal', 'hawk', 'fish', 'shrimp', 'frog', 'whale', 'shark', 'eel', 'seal', 'lobster', 'octopus', 'mole', 'shrew', 'rabbit', 'chipmunk', 'armadillo', 'dog', 'cat', 'lynx', 'mouse', 'lion', 'moose', 'horse', 'deer', 'raccoon', 'zebra', 'goat', 'cow', 'pig', 'tiger', 'wolf', 'pony', 'antelope', 'buffalo', 'camel', 'donkey', 'elk', 'fox', 'monkey', 'gazelle', 'impala', 'jaguar', 'leopard', 'lemur', 'yak', 'elephant', 'giraffe', 'hippopotamus', 'rhinoceros', 'grizzlybear'];

  return animals[Math.floor(Math.random() * animals.length)];

};
```

We can call ```getUsername()``` to get a random animal name. This will be our new username.

Remember when we defined ```me``` and supplied ```ian``` as the first parameter of ```ChatEngine.connect()```? Well, we can supply whatever we want to use as the ```User``` identifier there. Let's use our new function!

```js
let me = ChatEngine.connect(getUsername());
```

Now every time we load the page, we'll have a different username.

![](/guide/getting-started/assets/README-98498584.png)
