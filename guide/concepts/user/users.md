## Users

{@link User}s are other browser windows connected to the {@link Chat} via ChatEngine. A User represents a connected client.

## Me

When a client connects to ChatEngine, they create a special {@link User} called {@link Me}. {@link Me} represents "this {@link User} for this instance."

{@link Me} and {@link User} are similar in many ways, with the main difference being that {@link Me} can update state on the network while {@link User} cannot update state.

## State

So how do we add other information to Users? Like a profile? We update {@link Me}'s state.

This way, when any new client connects to the chat, their {@link Me} object will update all the other clients about it's state.

Let's give ```Me``` a unique username color. Here's a function to choose a random color.

```js
const colors =   ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

const getColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
};
```

Let's connect to ChatEngine.

```js
let me = ChatEngine.connect('ian-jennings');
```

We can update the {@link User}'s state on the network with the {@link Me#update} method.

```js
me.update({color: getColor()});
```

All state based methods (like {@link Me#update} and {@link Chat#event:$"."state} events) use {@link ChatEngine.global} by default.

```
ChatEngine.global.on('$.state', (payload) => {
  console.log(payload.user + ' updated state: ' + payload.state);
});

```

You can set {@link Me}'s starting state by using the second param of {@link ChatEngine#connect}.

```js
let me = ChatEngine.connect('ian-jennings', {color: getColor()});
```

What if we want to get a {@link User}'s state some other time?

```js
// get the first user in global chat
let user = ChatEngine.global.users[0];

// output the user's state
console.log(user.state());
```

Until now we've only delt with state in the {@link ChatEngine#global}, but {@link User}s can have different states in different {@link Chat}s.

```js
let customStateChat = new ChatEngine.Chat('state-chat');
customStateChat.on('$.state', (payload) {
    // update is fired here
});
me.update({newState: true}, customStateChat);
```
