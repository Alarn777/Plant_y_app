import Const from './ENV_VARS';
// const Sockette = require('sockette');
import ReconnectingWebSocket from 'react-native-reconnecting-websocket';

export default class WS {
  static init() {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new ReconnectingWebSocket(Const.apigatewaySocket);
    }
    this.ws.onclose = WS.displayAlert;
  }

  // static displayAlert() {
  //
  // }

  static onMessage(handler) {
    this.ws.addEventListener('message', handler);
  }

  static displayAlert(message) {
    console.log(message);
    if (!this.ws) {
      this.ws = new ReconnectingWebSocket(Const.apigatewaySocket);
    }
    this.ws.reconnect();
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
