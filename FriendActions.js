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

// export const fetchAllPosts = user => {
//   // console.log(user.username);
//   // console.log(user.signInUserSession.idToken.jwtToken);
//
//   // return dispatch => {
//   //   return axios
//   //     .post(
//   //       Consts.apigatewayRoute + '/getuserplanters',
//   //       {
//   //         username: this.props.authData.username,
//   //       },
//   //       {
//   //         headers: {Authorization: AuthStr},
//   //       },
//   //     )
//   //     .then(response => {
//   //       console.log(response.data);
//   //       // return {
//   //       //   planters: response.data.Items,
//   //       //   myCognitoUser: action.payload,
//   //       // };
//   //       dispatch(fetchPosts(response.data));
//   //
//   //       // this.dealWithPlantsData(response.data);
//   //     })
//   //     .catch(error => {
//   //       console.log('error ' + error);
//   //       throw error;
//   //     });
//   //   // return axios.get(apiUrl)
//   //   //     .then(response => {
//   //   //       dispatch(fetchPosts(response.data))
//   //   //     })
//   //   //     .catch(error => {
//   //   //       throw(error);
//   //   //     });
//   // };
// };
