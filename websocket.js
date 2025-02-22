import Const from './ENV_VARS';
import {Logger} from './Logger';
export default class WS {
  static init() {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(Const.apigatewaySocket);
      this.ws.onopen = function(e) {
        console.log('Socket is connected');
        WS.sendMessage(
          'FROM_CLIENT;e0221623-fb88-4fbd-b524-6f0092463c93;VIDEO_STREAM_ON',
        );
      };
    }

    this.ws.onerror = function(e) {
      console.log('ERROR');
      Logger.saveLogs('Test', e.toString(), 'WS ERROR');
    };

    this.ws.onclose = function(e) {
      console.log(
        'Socket is closed. Reconnect will be attempted in 1 second.',
        e.reason,
      );
      Logger.saveLogs(
        'Test',
        'Socket is closed. Reconnect will be attempted in 1 second.' +
          e.reason.toString(),
        'WS ERROR',
      );
      if (e.reason.toString() === 'Stream end encountered') {
      } else {
        setTimeout(function() {
          WS.init();
          // this.ws = new WebSocket(Const.apigatewaySocket);
        }, 1000);
      }
    };
  }

  static onMessage(handler) {
    this.ws.addEventListener('message', handler);
  }

  static closeSocket(reason) {
    let code = 1001;
    this.ws.close(code, reason.toString());
  }

  static onClose(handler) {
    console.log('socket closed');
  }
  static sendMessage(message) {
    let m = JSON.stringify({
      message: message,
      action: 'message',
    });

    try {
      this.ws.send(m);
    } catch (e) {
      console.log(e);
    }
  }
}
