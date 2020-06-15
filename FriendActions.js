export const addImage = imageUrl => ({
  type: 'ADD_IMAGE',
  payload: imageUrl,
});

export const addAction = event => ({
  type: 'ADD_ACTION',
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

export const toggleLight = lightStatus => ({
  type: 'TOGGLE_LIGHT',
  payload: lightStatus,
});

export const addUser = user => ({
  type: 'ADD_USER',
  payload: user,
});

export const loadPlanters = user => ({
  type: 'LOAD_PLANTERS',
  payload: user,
});

export const changeTheme = theme => ({
  type: 'CHANGE_THEME',
  payload: theme,
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

export const sendMessage = message => {
  // console.log(message);

  // console.log(this);

  return {
    type: 'NEW_MESSAGE',
    message,
  };
};

export const onMessage = event => {
  // console.log(event);

  // console.log(this);

  return dispatch => {
    // you may want to use an action creator function
    // instead of creating the object inline here
    dispatch({
      type: 'ACTION',
      event,
    });
  };

  // return {
  //   type: 'ACTION',
  //   event,
  // };
};

export const reconnect = data => {
  return {
    type: 'WS_CONNECT',
    data,
  };
};
