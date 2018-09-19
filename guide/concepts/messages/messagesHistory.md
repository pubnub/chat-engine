## Messages History

The {@link Chat#search| ```chat.search()``` } method can be used to retrieve old events that were fired before ChatEngine was loaded or when you were disconnected from a chat.

```js
chat.search({
    event: 'message',
    limit: 50
}).on('message', (event) => {
    console.log('this is an old event!', event);
}).on('$.search.finish', () => {
    console.log('we have all our results!')
});
```

{@link Search} will stop after looking through after 1,0000 messages and then emit the ```$.search.pause``` event [TODO: gotta add this event to source code comments!!!].

The ```chat.search.next()``` method can be used to search an additional 1,000 events. Below code sample shows how to implement ```$.search.pause``` and get the next set of messages if {@link Search#hasMore| ```search.hasMore``` } is ```true```.

```js
let mySearch = chat.search({
    event: 'message',
    start: downloadAllStart,
    end:   downloadAllEnd,
    pages: 2
});

mySearch.on('message', (data) => {
    messageBody = data.data
    messageBody.timestamp = parseInt(data.timetoken)                    

    if(typeof(messageBody.time) === 'number')
        messageBody.time = messageBody.time + ""

    if(typeof(messageBody.avatar) === 'string' || messageBody.avatar == undefined)
        this.connections[chatID].downloadedMessages.push(messageBody);
})
.on('$.search.finish', () => {
    this.updateAndSave("finished_loading", chatID);
    this.connections[chatID].messagesLoading = false
})
.on('$.search.pause', () => {
    console.log("pausing search");
    this.updateAndSave(null, chatID);

    if (search.hasMore) {
        mySearch.next();
    }
});
```

### TODO: History Pagination
