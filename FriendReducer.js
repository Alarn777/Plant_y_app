import {combineReducers} from 'redux';
import Consts from './ENV_VARS';
import {onMessage} from './FriendActions';
const Sockette = require('sockette');
const INITIAL_STATE = {
  // current: [],
  // possible: [],
  // favorite_cleaners: [],
  // cleaners: [],
  plantyData: [],
  // events: [],
  // socket: [],
  // myCognitoUser: {},
  // planters: [],
};

const cleanerReducer = (state = INITIAL_STATE, action) => {
  const {myCognitoUser, avatarUrl, plantsImages, streamUrl, socket} = state;

  switch (action.type) {
    case 'CLEAN_STATE':
      return {
        streamUrl: null,
        plantsImages: [],
        avatarUrl: '',
        socket: null,
        myCognitoUser: myCognitoUser,
      };

    case 'WS_CONNECT':
      // if (socket !== null) {
      //   socket.close();
      // }

      // connect to the remote host
      let new_socket = new Sockette(Consts.apigatewaySocket, {
        timeout: 5e3,
        maxAttempts: 3,
        onopen: e => console.log('Connected!', e),
        onmessage: e => onMessage(e),
        onreconnect: e => console.log('Reconnecting...', e),
        onmaximum: e => console.log('Stop Attempting!', e),
        onclose: e => console.log('Closed!', e),
        onerror: e => console.log('Error:', e),
      });

      // websocket handlers
      // socket.onmessage = onMessage(store);
      // socket.onclose = onClose(store);
      // socket.onopen = onOpen(store);
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: new_socket,
        myCognitoUser: myCognitoUser,
      };

    case 'WS_DISCONNECT':
      if (socket !== null) {
        socket.close();
      }
      // socket = null;
      console.log('websocket closed');
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: null,
        myCognitoUser: myCognitoUser,
      };

    case 'NEW_MESSAGE':
      console.log('sending a message', action.msg);
      socket.send(
        JSON.stringify({command: 'NEW_MESSAGE', message: action.msg}),
      );
      return state;

    // case 'REMOVE_EVENT':
    //   if (events.includes(action.payload)) {
    //     const index = events.indexOf(action.payload);
    //     if (index > -1) {
    //       events.splice(index, 1);
    //     }
    //   }

    case 'ADD_SOCKET':
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: action.payload,
        myCognitoUser: myCognitoUser,
      };

    case 'ADD_STREAM_URL':
      return {
        streamUrl: action.payload,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: myCognitoUser,
      };

    // case 'REMOVE_CLEANER':
    //   if (favorite_cleaners.includes(action.payload)) {
    //     const index = favorite_cleaners.indexOf(action.payload);
    //     if (index > -1) {
    //       favorite_cleaners.splice(index, 1);
    //     }
    //   }
    //
    //   return {events, favorite_cleaners, socket};
    //

    case 'DISPATCH_ACTION':
      console.log(action.payload);
      // let actions = action.payload.split('=');
      //
      // console.log(actions);

      return {
        // waterEnabled: false,
        // lightEnabled: false,
        // temperatureIncreased: false,
        // temperatureDecreased: false,

        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: myCognitoUser,
      };

    case 'ADD_IMAGE':
      let newArr = [];
      if (!plantsImages) {
        newArr = [];
        newArr.push(action.payload);
        return {
          streamUrl: streamUrl,
          plantsImages: newArr,
          avatarUrl: avatarUrl,
          socket: socket,
          myCognitoUser: myCognitoUser,
        };
      } else {
        newArr = plantsImages;
      }

      newArr.push(action.payload);

      return {
        streamUrl: streamUrl,
        plantsImages: newArr,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: myCognitoUser,
      };

    case 'ADD_USER':
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: action.payload,
      };

    case 'ADD_AVATAR_LINK':
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: action.payload,
        socket: socket,
        myCognitoUser: myCognitoUser,
      };

    case 'FETCH_POST':
      console.log(action.payload);
      return {
        streamUrl: streamUrl,
        socket: socket,
        planters: action.payload.Items,
        myCognitoUser: action.payload,
      };

    case 'LOAD_PLANTERS':
      console.log('LOLOAD_PLANTERS');
      return state;

    default:
      return state;
  }
};

export default combineReducers({
  plantyData: cleanerReducer,
});
