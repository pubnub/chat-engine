## Users

{@link User}s are other browser windows connected to the {@link Chat} via {@link ChatEngine}. A {@link User} represents a connected client.

## Me

When a client calls {@link ChatEngine#connect}, they create a special {@link User} called {@link Me}. {@link Me} represents "this {@link User} for this instance."

{@link Me} and {@link User} are similar in many ways, with the main difference being that {@link Me} has the ability to edit {@link Me#state} via {@link Me#update} while you can not updated some other {@link User#state}.

See {@tutorial me} for more information.

## State

So how do we add other information to Users? Like a profile? We update {@link Me#state} via {@link Me#update}.

This way, when any new client connects to the chat, their {@link Me} object will update all the other clients about it's state.

Let's give {@link Me} a unique username color. Here's a function to choose a random color.

```js
const colors =   ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];

const getColor = () => {
    return colors[Math.floor(Math.random() * colors.length)];
};
```

We can update {@link Me}'s state on the network with the {@link Me#update} method.

```js
me.update({color: getColor()});
```

Then we can listen for the state event in other windows via {@link ChatEngine#event:$"."state $.state}:

```
ChatEngine.global.on('$.state', (payload) => {
  console.log(payload.user + ' updated state: ' + payload.state);
});

```

You can set {@link Me#state} during connection by supplying the second param of {@link ChatEngine#connect}.

```js
ChatEngine.connect('ian-jennings', {color: getColor()});
```

What if we want to get a {@link User}'s state some other time without events? You can simply check for the {@link User.state} property.

```js
// get the first user in global chat
let user = ChatEngine.global.users[0];

// output the user's state
console.log(user.state);
```
