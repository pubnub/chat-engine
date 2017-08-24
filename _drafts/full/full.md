# Set up tutorial with index.html, bootstrap, jQuery

Let's get started. In this tutorial, we'll be using:

- NodeJS
- Twitter Bootstrap
- jQuery
- PubNub Chat Engine

If you're not familiar with these, don't worry. They'll be helpful links along
the way.


## Install Twitter Bootstrap

Twitter Bootstrap will make it easy for us to create user interface elements for our chat application.

In fact, when using PubNub Chat Engine, creating the UI and hooking it up to the framework is about all you have to do.

We'll use bootstrap 3 since it's the latest stable version. You can install it using npm by running:

```
npm install bootstrap@3 --save
```

## Install jQuery

jQuery will provide us with some simple utilities for Javascript that will make programming our chat application easier. You can install it using npm by running:

```sh
npm install jquery --save
```

> You don't have to use jQuery with PubNub Chat Engine. We could use Angular, React, or just vanilla Javscript. The [Chat Engine Examples](https://github.com/pubnub/chat-engine-examples) page has examples for these other frameworks.

## Install http-server globally

Finally, we need a way to run our app. Sure, we could just load them with the ```file://``` protocol, but that creates all sorts of security issues and problems in the future. It's better to start with ```localhost```.

Install ```http-server``` globally using npm:

```sh
npm install http-server -g
```

This allows us to run a small http server on ```localhost``` that will serve our files properly.

# Build an example page and load dependencies

Alright, now it's time for the fun stuff. Let's create an example page.

Create a new page called ```index.html``` and paste the following page in. It will load the CSS, JS, and there's even a small script to test that all the libraries have been loaded.

```html
<html>
  <head>
    <link rel="stylesheet" type="text/css" href="node_modules/bootstrap/dist/css/bootstrap.css" />
  </head>
  <body>
    <div class="container">
        <div class="row">
            <div class="col-lg-12">
                <h1>Does it work?</h1>
                <div class="alert alert-info">Let's find out.</div>
            </div>
        </div>
    </div>
    <script type="text/javascript" src="node_modules/jquery/dist/jquery.js"></script>
    <script type="text/javascript" src="node_modules/bootstrap/dist/js/bootstrap.js"></script>
    <script type="text/javascript" src="node_modules/chat-engine/dist/chat-engine.js"></script>
    <script type="text/javascript">
    if(typeof $ == "undefined") {
      alert('Failed to load jQuery!');
    }
    if(typeof ChatEngineCore == "undefined") {
      alert('Failed to load PubNub Chat Engine');
    }
    if($ && ChatEngineCore) {
      alert('It works!');
    }
    </script>
  </body>
</html>
```

Once you've pasted this code, run the ```http-server``` command in your terminal and load the webpage in your browser.

```sh
http-server
Starting up http-server, serving ./
Available on:
  http://127.0.0.1:8080
  http://192.168.0.8:8080
Hit CTRL-C to stop the server
```

Load http://127.0.0.1:8080 in your browser and see if the webpage looks like this screenshot:

![](/guide/getting-started/assets/README-988df6e2.png)

If you get an error alert, make sure you ran all the previous setup instructions properly. If the design does not look correct, make sure you installed the correct version of Twitter Bootstrap.
