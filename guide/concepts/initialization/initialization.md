Once you have access to the {@link ChatEngineCore| ```ChatEngineCore``` } object, use the {@link ChatEngine#create| ```create()``` } method to create a new instance of ChatEngine.

This function must be called before attempting to utilize any API functionality to establish account level credentials with your ```subscribeKey``` and ```publishKey```.

```js
ChatEngine = ChatEngineCore.create({
    subscribeKey: 'mySubscribeKey',
    publishKey: 'myPublishKey'
});
```
