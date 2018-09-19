## On Request Function
At the time of writing, no ```On Request``` docs exist so here goes.

Unlike the other PubNub Function types listed above, the ```On Request``` Function operates differently in that the ```On Request``` Function does not listen to msgs sent on a pub/sub channel. Rather, similar to any other RESTful API, an HTTP request is made to the specified Function URL which uses a string as the API URL endpoint. An example ```On Request``` Function REST url could look like the following:
