import { combineReducers } from 'redux'

const INITIAL_STATE = {
  current: [],
  possible: [],
  favorite_cleaners: [],
  cleaners: [],
  events: [],
  socket: []
}

const cleanerReducer = (state = INITIAL_STATE, action) => {
  const { favorite_cleaners, events, socket } = state

  switch (action.type) {
    case 'ADD_SOCKET':
      socket.push(action.payload)
      return { events, favorite_cleaners, socket }

    case 'RELOAD_EVENTS':
      return { events: [], favorite_cleaners, socket }

    case 'REMOVE_EVENT':
      if (events.includes(action.payload)) {
        const index = events.indexOf(action.payload)
        if (index > -1) {
          events.splice(index, 1)
        }
      }

      return { events, favorite_cleaners, socket }

    case 'ADD_EVENT':
      if (
        events.findIndex(e => {
          return e._id === action.payload._id
        }) < 0
      )
        events.push(action.payload)

      return { events, favorite_cleaners, socket }

    case 'REMOVE_CLEANER':
      if (favorite_cleaners.includes(action.payload)) {
        const index = favorite_cleaners.indexOf(action.payload)
        if (index > -1) {
          favorite_cleaners.splice(index, 1)
        }
      }

      return { events, favorite_cleaners, socket }

    case 'ADD_CLEANER':
      if (
        favorite_cleaners.indexOf(c => {
          return c._id === action.payload._id
        }) < 0
      ) {
        favorite_cleaners.push(action.payload)
      }
      return { events, favorite_cleaners, socket }

    case 'RELOAD_CLEANERS':
      return { events, favorite_cleaners: [], socket }
    default:
      return state
  }
}

export default combineReducers({
  cleaners: cleanerReducer
})
