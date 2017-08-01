
## Install NodeJS

"Hey, I thought we were building a front end app!?"" We are, but if you haven't been keeping up to date, you might not have noticed that NodeJS has become the go-to option for working with javascript packages.

In this tutorial I'll be using NodeJS v6.11 which is the latest version as of this time of writing.

If you're using NVM (Node Version Manager), you can install this version by running:

```
nvm install v6.11
```

If you need help installing NodeJS, check out [this handy list of guides for every OS](https://nodejs.org/en/download/package-manager/).

You can verify that you're running the correct version of NodeJS with by running:

```
node -v
```

## Create a new NPM project

Since we'll be installing dependencies, it's helpful to create a new ```package.json``` to keep track of all of the packages we're going to install.

In your project directory, run this command to create a new package. Complete the interactive set up guide and we'll be ready to go.

```
npm init
```

That'll create a ```package.json``` in your poject directory.

```json
{
  "name": "chat-engine-tutorial",
  "version": "0.0.1",
  "description": "An example PubNub Chat Engine Tutorial",
  "main": "index.js",
  "author": "Ian Jennings"
}

```
