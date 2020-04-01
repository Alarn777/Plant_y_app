import Const from './ENV_VARS';
// const Sockette = require('sockette');
// import ReconnectingWebSocket from 'react-native-reconnecting-websocket';
// import WebSocket from 'WebSocket';
export default class WS {
  static init() {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(Const.apigatewaySocket);
      // this.ws.onopen = console.log('Socket is connected');
      console.log(this.ws);
    }
    // this.ws.onclose = WS.displayAlert;
    this.ws.onclose = function(e) {
      console.log(
        'Socket is closed. Reconnect will be attempted in 1 second.',
        e.reason,
      );
      setTimeout(function() {
        this.ws = new WebSocket(Const.apigatewaySocket);
      }, 1000);
    };
  }

  // static displayAlert() {
  //
  // }

  static onMessage(handler) {
    this.ws.addEventListener('message', handler);
  }

  static closeSocket() {
    this.ws.close();
  }

  static onClose(handler) {
    console.log('socket closed');
  }
  static sendMessage(message) {
    // You can have some transformers here.
    // Object to JSON or something else...

    let m = JSON.stringify({
      message: message,
      action: 'message',
    });
    // console.log(m);
    // let obj = JSON.parse({
    //   message: message,
    //   action: 'message',
    // });

    // if (this.ws.readyState === WebSocket.CLOSED) {
    //   // Do your stuff...
    // }

    // console.log(this.ws);
    try {
      this.ws.send(m);
    } catch (e) {
      console.log(e);
    }

    // this.ws.send(message);
  }
}
