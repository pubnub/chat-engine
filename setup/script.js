const provisionElement = $('#provision');
const loadElement = $('#load');
const errorElement = $('#error');
const errorOutElement = $('#error-out');
const statusElement = $('#status');
const codeElement = $('#code');
const outputElement = $('#output');
const emailElement = $('#email');
const passwordElement = $('#password');

provisionElement.submit(() => {
  provisionElement.hide();
  loadElement.show();
  errorElement.hide();
  statusElement.empty();

  Provision(emailElement.val(), passwordElement.val(), function(err, data) {

    if(err) {

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
      output += "    endpoint: 'https://pubsub.pubnub.com/v1/blocks/sub-key/" + data.sub + "/chat-engine-server'\n";
      output += "});\n";

      codeElement.text(output);
      outputElement.show();

    }

  }, function(statusText){

    statusElement.append($('<li class="list-group-item">' + statusText + '</li>'));

  });

  return false;

});