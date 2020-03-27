import Const from './ENV_VARS';
// const Sockette = require('sockette');

export default class WS {
  static init() {
    this.ws = new WebSocket(Const.apigatewaySocket);
  }
  static onMessage(handler) {
    this.ws.addEventListener('message', handler);
  }
  static sendMessage(message) {
    // You can have some transformers here.
    // Object to JSON or something else...

    this.ws.json({
      message: message,
      action: 'message',
    });
    // this.ws.send(message);
  }
}
