ChatEngine SDKs are built on top of existing publish & subscribe SDKs and provide full access to the original method by referencing the {@link ChatEngine#pubnub| ```ChatEngine.pubnub``` } object.

For instance, the ```pubnub``` instance can be used to call batch {@link Search| history } on multiple {@link Chat| ```Chat```} channels instead of calling {@link Search| ```Search``` } on individual {@link Chat| '''Chat''' } rooms.

```js
PubNub = ChatEngine.pubnub;
PubNub.fetchMessages(
    {
        channels: ['chat-engine#chat#public.#ch1', 'chat-engine#chat#public.#ch2', 'chat-engine#chat#public.#ch3'],
        start: "123",
        end: "1234",
        count: 30
    },
    (status, response) => {
        // handle response
    }
);
```
