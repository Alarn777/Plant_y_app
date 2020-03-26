import axios from 'axios';
import Consts from './ENV_VARS';

export const removeCleaner = cleaner => ({
  type: 'REMOVE_CLEANER',
  payload: cleaner,
});

export const addImage = imageUrl => ({
  type: 'ADD_IMAGE',
  payload: imageUrl,
});

export const removeEvent = event => ({
  type: 'REMOVE_EVENT',
  payload: event,
});

export const addEvent = event => ({
  type: 'ADD_EVENT',
  payload: event,
});

export const cleanReduxState = event => ({
  type: 'CLEAN_STATE',
  payload: event,
});

export const addSocket = socket => ({
  type: 'ADD_SOCKET',
  payload: socket,
});

export const addStreamUrl = cleaner => ({
  type: 'ADD_STREAM_URL',
  payload: cleaner,
});

export const addUser = user => ({
  type: 'ADD_USER',
  payload: user,
});

export const loadPlanters = user => ({
  type: 'LOAD_PLANTERS',
  payload: user,
});

export const AddAvatarLink = link => ({
  type: 'ADD_AVATAR_LINK',
  payload: link,
});

export const fetchPosts = posts => {
  return {
    type: 'FETCH_POST',
    posts,
  };
};

export const dealWithMessage = message => {
  return {
    type: 'DISPATCH_ACTION',
    message,
  };
};

// export const onOpen = store => event => {
//   console.log('websocket open', event.target.url);
//   store.dispatch(actions.wsConnected(event.target.url));
// };

// export const onClose = store => () => {
//   store.dispatch(actions.wsDisconnected());
// };

export const disconnectWS = data => {
  return {
    type: 'WS_DISCONNECT',
    data,
  };
};

export const connectWS = data => {
  return {
    type: 'WS_CONNECT',
    data,
  };
};

export const onMessage = event => {
  console.log('receiving server message');
  // console.log(event);

  let job = event.data.split('=');
  console.log(job);

  // switch (payload.type) {
  //   case 'update_game_players':
  //     store.dispatch(updateGame(payload.game, payload.current_player));
  //     break;
  //   default:
  //     break;
};
