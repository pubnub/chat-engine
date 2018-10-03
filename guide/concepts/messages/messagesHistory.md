The {@link Chat#search| ```chat.search()``` } method can be used to retrieve old events that were fired before ChatEngine was loaded or when users were {@link Chat#event:$"."offline"."disconnect| disconnected} from chat.

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

If no ```limit``` is set, search will stop after looking through the ```1,000``` most recent messages and then {@link Chat#emit| ```emit()``` } the {@link Search#event:$"."search"."pause| ```$.search.pause``` } event. The {@link Search#next| ```chat.search.next()``` } method can be used to search an additional ```1,000``` events. The code sample below shows how to implement {@link Search#event:$"."search"."pause| ```$.search.pause``` } and get the next set of messages if {@link Search#hasMore| ```Search.hasMore``` } is ```true```.

```js
let mySearch = chat.search({
    event: 'message',
    pages: 2
});

mySearch.on('message', (payload) => {
    console.log('got an old message ', payload.data.text);
})
.on('$.search.pause', () => {    
    console.log('searched 2 pages for messages');
    if(mySearch.hasMore){
        mySearch.next(); //call next() to try another 2 pages
    }
});
```
