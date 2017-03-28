import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import OpenChatFramework from '../../../src/index.js'

const now = new Date().getTime();
const username = ['user', now].join('-');

const OCF = OpenChatFramework.config({
    rltm: {
        service: 'pubnub', 
        config: {
            publishKey: 'pub-c-ea1b85f7-8895-4514-b0e0-b505eaaa1b62',
            subscribeKey: 'sub-c-7397fa12-43a3-11e6-bfbb-02ee2ddab7fe',
        }
    },
    globalChannel: 'ocf-demo-react'
});

OCF.connect(username, {
    signedOnTime: now
});

var Message = React.createClass({
  render: function() {
    return (
      <div>
        {this.props.uuid}: {this.props.text}
      </div>
    );
  }
});

var Chat = React.createClass({
  
  getInitialState: function() {
    return {
        messages: [],
        chatInput: ''
    };
  },

  setChatInput: function(event) {
    this.setState({chatInput: event.target.value})
  },

  sendChat: function() {
    
    if(this.state.chatInput) {
        
        OCF.globalChat.send('message', {
            text: this.state.chatInput
        });

        this.setState({chatInput: ''})

    }

  },

  componentDidMount: function() {
    
    OCF.globalChat.on('message', (payload) => {

        let messages = this.state.messages;

        messages.push(
            <Message key={this.state.messages.length} uuid={payload.sender.uuid} text={payload.data.text} />
        );

        this.setState({
            messages: messages
        });

    });

  },

  _handleKeyPress: function(e) {
    if (e.key === 'Enter') {
      this.sendChat();
    }
  },

  render: function() {
    return (
        <div>
            <div id="chat-output">{this.state.messages}</div>
            <input id="chat-input" type="text" name=""  value={this.state.chatInput} onChange={this.setChatInput}  onKeyPress={this._handleKeyPress} />
            <input type="button" onClick={this.sendChat} value="Send Chat" />
        </div>
    );
  },
});

ReactDOM.render(
  <Chat />,
  document.getElementById('root')
);
