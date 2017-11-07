const loginElement = $('#login');
const provisionElement = $('#setup');
const loadElement = $('#load');
const errorElement = $('#error');
const errorOutElement = $('#error-out');
const statusElement = $('#status');
const codeElement = $('#code');
const outputElement = $('#output');
const emailElement = $('#email');
const passwordElement = $('#password');

findCookie = function(name) {
  var cookies = document.cookie.split(';');
  var result = null;
  cookies.forEach(function (cookie) {
    var cookieName = cookie.split('=')[0];
    var cookieValue = cookie.split('=')[1];

    if (cookieName.endsWith(name)) {
      result = cookieValue;
    }
  })

  return result;
}

var userId = findCookie('pnAdminId');
var tokenCookie = findCookie('pnAdminToken');

var client = new Client({
    session: tokenCookie,
    debug: false,
    endpoint: 'https://admin.pubnub.com'
});

displayStatus = function (statusText) {
  statusElement.show()
  statusElement.append($('<li class="list-group-item">' + statusText + '</li>'));
}

clearErrors = function() {
  errorElement.hide();
}

raiseError = function(err) {
  errorOutElement.html(err);
  errorElement.show();
}

extractError = function(err) {
  if (err && err.responseJSON && err.responseJSON.error) {
    return err.responseJSON.error;
  }
}

segmentIdentify = function() {
  analytics.identify(userId);
}

onProvisionSuccess = function(err, data) {
    if (err) {
        loadElement.hide();
        provisionElement.show();

        errorOutElement.html(err);
        errorElement.show();
    } else {
        loadElement.hide();

        let output = "";
        output += "// Make sure to import ChatEngine first!\n";
        output += "ChatEngine = ChatEngineCore.create({\n";
        output += "    publishKey: '" + data.pub + "',\n";
        output += "    subscribeKey: '" + data.sub + "'\n";
        output += "}, {\n";
        output += "    globalChannel: 'global',\n";
        output += "    endpoint: 'https://pubsub.pubnub.com/v1/blocks/sub-key/" + data.sub + "/server'\n";
        output += "});\n";

        analytics.track('chat_engine_activation');

        codeElement.text(output);
        outputElement.show();
    }
  }

onLoginRegister = function() {
  clearErrors();
  email = emailElement.val();
  password = passwordElement.val();

  if (!email || email === '') {
    raiseError('email not valid');
    return false;
  };

  if (!password || password === '') {
    raiseError('password not valid');
    return false;
  }

  client.init({
      email: email,
      password: password
  }, (err, response) => {
    if (err) {
      raiseError(extractError(err))
    } else {
      userId = response.result.user_id;
      provisionElement.show();
      loginElement.hide();
    }

  });

  segmentIdentify();

  return false;
}

onSetup = function() {
  clearErrors();

  loadElement.show();
  errorElement.hide();
  statusElement.empty();

  ProvisionAccount(client, userId, onProvisionSuccess, displayStatus);

  return false;
}

if (userId && tokenCookie) {
  provisionElement.show();
  loginElement.hide();
  segmentIdentify();
}

loginElement.submit(onLoginRegister);
provisionElement.submit(onSetup);
