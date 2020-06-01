import {combineReducers} from 'redux';
import Consts from './ENV_VARS';
import {onMessage, reconnect} from './FriendActions';
const Sockette = require('sockette');

const INITIAL_STATE = {
  // current: [],
  // possible: [],
  // favorite_cleaners: [],
  // cleaners: [],
  // plantyData: [],

  streamUrl: null,
  plantsImages: [],
  avatarUrl: '',
  socket: null,
  myCognitoUser: null,
  controls: {
    waterEnabled: false,
    lightEnabled: false,
    temperatureIncreased: false,
    temperatureDecreased: false,
  },

  socketActions: [],

  // events: [],
  // socket: [],
  // myCognitoUser: {},
  // planters: [],
};

const cleanerReducer = (state = INITIAL_STATE, action) => {
  // console.log(state);

  const {
    myCognitoUser,
    avatarUrl,
    plantsImages,
    streamUrl,
    socket,
    controls,
    lightStatus,
    socketActions,
  } = state;

  switch (action.type) {
    case 'CLEAN_STATE':
      return {
        streamUrl: null,
        plantsImages: [],
        avatarUrl: '',
        socket: null,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: false,
          lightEnabled: false,
          temperatureIncreased: false,
          temperatureDecreased: false,
        },
        socketActions: [],
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
        onclose: e => reconnect(e),
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
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
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
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    case 'NEW_MESSAGE':
      // console.log(action.message);

      // console.log('sending a message', action.payload);
      // socket.send(JSON.stringify({action: 'message', message: action.payload}));
      socket.json({action: 'message', message: action.message});
      return state;

    // case 'REMOVE_EVENT':
    //   if (events.includes(action.payload)) {
    //     const index = events.indexOf(action.payload);
    //     if (index > -1) {
    //       events.splice(index, 1);
    //     }
    //   }
    case 'TOGGLE_LIGHT':
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: action.payload,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    case 'ACTION':
      //parce action here'

      // console.log('in reducer action');
      // console.log(action);

      socketActions.map(one => one());

      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    case 'ADD_SOCKET':
      // console.log(action.payload);

      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: action.payload,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    case 'ADD_STREAM_URL':
      return {
        streamUrl: action.payload,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
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
      // console.log(action.payload);
      // let actions = action.payload.split('=');
      //
      // console.log(actions);

      return {
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,

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
          controls: {
            waterEnabled: controls.waterEnabled,
            lightEnabled: controls.lightEnabled,
            temperatureIncreased: controls.temperatureIncreased,
            temperatureDecreased: controls.temperatureDecreased,
          },
          socketActions: socketActions,
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
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    case 'ADD_USER':
      // console.log(state);
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: action.payload,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    case 'ADD_AVATAR_LINK':
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: action.payload,
        socket: socket,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    case 'FETCH_POST':
      // console.log(action.payload);
      return {
        streamUrl: streamUrl,
        socket: socket,
        planters: action.payload.Items,
        myCognitoUser: action.payload,
      };

    case 'LOAD_PLANTERS':
      // console.log('LOLOAD_PLANTERS');
      return state;

    case 'ADD_ACTION':
      let newActionsArr = [];
      if (!socketActions) {
        newActionsArr = [];
        newActionsArr.push(action.payload);
        return {
          streamUrl: streamUrl,
          plantsImages: plantsImages,
          avatarUrl: avatarUrl,
          socket: socket,
          myCognitoUser: myCognitoUser,
          controls: {
            waterEnabled: controls.waterEnabled,
            lightEnabled: controls.lightEnabled,
            temperatureIncreased: controls.temperatureIncreased,
            temperatureDecreased: controls.temperatureDecreased,
          },
          socketActions: newActionsArr,
        };
      } else {
        newActionsArr = socketActions;
      }
      socketActions.push(action.payload);
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    default:
      return state;
  }
};

// export default cleanerReducer;

export default combineReducers({
  plantyData: cleanerReducer,
});
