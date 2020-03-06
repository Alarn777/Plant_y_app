import {combineReducers} from 'redux';

const INITIAL_STATE = {
  // current: [],
  // possible: [],
  // favorite_cleaners: [],
  // cleaners: [],
  plantyData: [],
  // events: [],
  // socket: [],
  myCognitoUser: {},
};

const cleanerReducer = (state = INITIAL_STATE, action) => {
  const {myCognitoUser} = state;

  switch (action.type) {
    // case 'ADD_SOCKET':
    //   socket.push(action.payload);
    //   return {events, favorite_cleaners, socket};
    //
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
    // case 'ADD_CLEANER':
    //   if (
    //     favorite_cleaners.indexOf(c => {
    //       return c._id === action.payload._id;
    //     }) < 0
    //   ) {
    //     favorite_cleaners.push(action.payload);
    //   }
    //   return {events, favorite_cleaners, socket};
    //
    // case 'RELOAD_CLEANERS':
    //   return {events, favorite_cleaners: [], socket};

    case 'ADD_USER':
      console.log('LOAD');
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
        myCognitoUser: action.payload,
      };

    default:
      return state;
  }
};

export default combineReducers({
  plantyData: cleanerReducer,
});
