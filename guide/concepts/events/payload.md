## Event Payload

Notice how we use ```payload.sender.uuid``` and ```payload.data``` in the callback?

The ```payload``` value is auto-magically populated with handy references to the ```Chat``` and ```User``` related to this event.

The property ```payload.chat``` is the ```Chat``` that event was broadcast broadcast on, and the ```payload.user``` is the ```User ``` that broadcast the message. You can find the actual message contents supplied to ```emit()``` within the ```payload.data``` property.

> The ```User``` and ```Chat``` properties are both fully interactive instances. Therefor, you can do things like ```payload.chat.emit('message')``` to automatically reply to a message.
