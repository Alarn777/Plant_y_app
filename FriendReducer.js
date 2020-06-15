import {combineReducers} from 'redux';
import Consts from './ENV_VARS';
import {onMessage, reconnect} from './FriendActions';
const Sockette = require('sockette');

const INITIAL_STATE = {
  streamUrl: null,
  plantsImages: [],
  avatarUrl: '',
  socket: null,
  theme: 'light',
  myCognitoUser: null,
  controls: {
    waterEnabled: false,
    lightEnabled: false,
    temperatureIncreased: false,
    temperatureDecreased: false,
  },

  socketActions: [],
};

const cleanerReducer = (state = INITIAL_STATE, action) => {
  const {
    myCognitoUser,
    avatarUrl,
    plantsImages,
    streamUrl,
    socket,
    controls,
    theme,
    lightStatus,
    socketActions,
  } = state;

  switch (action.type) {
    case 'CHANGE_THEME':
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        theme: action.payload,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };
    case 'CLEAN_STATE':
      return {
        streamUrl: null,
        plantsImages: [],
        avatarUrl: '',
        socket: null,
        theme: theme,
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
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: new_socket,
        myCognitoUser: myCognitoUser,
        theme: theme,
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
      console.log('websocket closed');
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: null,
        theme: theme,
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
      socket.json({action: 'message', message: action.message});
      return state;

    case 'TOGGLE_LIGHT':
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        theme: theme,
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
      socketActions.map(one => one());

      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: socket,
        theme: theme,
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
      return {
        streamUrl: streamUrl,
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        socket: action.payload,
        theme: theme,
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
        theme: theme,
        myCognitoUser: myCognitoUser,
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,
      };

    case 'DISPATCH_ACTION':
      return {
        controls: {
          waterEnabled: controls.waterEnabled,
          lightEnabled: controls.lightEnabled,
          temperatureIncreased: controls.temperatureIncreased,
          temperatureDecreased: controls.temperatureDecreased,
        },
        socketActions: socketActions,

        streamUrl: streamUrl,
        theme: theme,
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
          theme: theme,
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
        theme: theme,
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
        theme: theme,
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
        theme: theme,
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
        theme: theme,
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
          theme: theme,
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
        theme: theme,
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
