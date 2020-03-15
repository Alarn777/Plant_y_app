import {combineReducers} from 'redux';
import axios from 'axios';
import Consts from './ENV_VARS';

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
  const {myCognitoUser, avatarUrl, plantsImages} = state;

  switch (action.type) {
    // case 'RELOAD_EVENTS':
    //   return {events: [], favorite_cleaners, socket};
    //
    // case 'REMOVE_EVENT':
    //   if (events.includes(action.payload)) {
    //     const index = events.indexOf(action.payload);
    //     if (index > -1) {
    //       events.splice(index, 1);
    //     }
    //   }
    //
    //   return {events, favorite_cleaners, socket};
    //
    // case 'ADD_EVENT':
    //   if (
    //     events.findIndex(e => {
    //       return e._id === action.payload._id;
    //     }) < 0
    //   )
    //     events.push(action.payload);
    //
    //   return {events, favorite_cleaners, socket};
    //
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

    case 'ADD_IMAGE':
      let newArr = [];
      if (!plantsImages) {
        newArr = [];
      } else {
        newArr = plantsImages;
      }

      if (
        newArr.indexOf(c => {
          return c.name === action.payload.name;
        }) < 0
      ) {
        newArr.push(action.payload);
      }
      return {
        // events: [],
        // favorite_cleaners: [],
        // socket: [],
        plantsImages: newArr,
        avatarUrl: avatarUrl,
        myCognitoUser: myCognitoUser,
      };
    //
    // case 'RELOAD_CLEANERS':
    //   return {events, favorite_cleaners: [], socket};

    case 'ADD_USER':
      // console.log(action.payload);
      // return {myCognitoUser: tempMyCognitoUser};
      // if (
      //   myCognitoUsers.indexOf(c => {
      //     return c.username === action.payload.username;
      //   }) < 0
      // ) {
      //   myCognitoUsers.push(action.payload);
      // }
      // myCognitoUsers.push(action.payload);

      // console.log(myCognitoUsers);
      return {
        // events: [],
        // favorite_cleaners: [],
        // socket: [],
        plantsImages: plantsImages,
        avatarUrl: avatarUrl,
        myCognitoUser: action.payload,
      };

    case 'ADD_AVATAR_LINK':
      return {
        // events: [],
        // favorite_cleaners: [],
        // socket: [],
        plantsImages: plantsImages,
        avatarUrl: action.payload,
        myCognitoUser: myCognitoUser,
      };

    case 'FETCH_POST':
      console.log(action.payload);
      return {
        // events: [],
        // favorite_cleaners: [],
        // socket: [],
        planters: action.payload.Items,
        myCognitoUser: action.payload,
      };
    // return action.Items;

    case 'LOAD_PLANTERS':
      console.log('LOLOAD_PLANTERS');
      // axios
      //   .post(
      //     Consts.apigatewayRoute + '/getuserplanters',
      //     {
      //       username: this.props.authData.username,
      //     },
      //     {
      //       headers: {Authorization: AuthStr},
      //     },
      //   )
      //   .then(response => {
      //     console.log(response.data);
      //     return {
      //       planters: response.data.Items,
      //       myCognitoUser: action.payload,
      //     };
      //     // this.dealWithPlantsData(response.data);
      //   })
      //   .catch(error => {
      //     console.log('error ' + error);
      //     return {
      //       planters: [],
      //       myCognitoUser: action.payload,
      //     };
      //   });
      return state;

    default:
      return state;
  }
};

export default combineReducers({
  plantyData: cleanerReducer,
});
