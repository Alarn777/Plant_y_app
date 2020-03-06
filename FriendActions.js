export const removeCleaner = cleaner => ({
  type: 'REMOVE_CLEANER',
  payload: cleaner,
});

export const addCleaner = cleaner => ({
  type: 'ADD_CLEANER',
  payload: cleaner,
});

export const removeEvent = event => ({
  type: 'REMOVE_EVENT',
  payload: event,
});

export const addEvent = event => ({
  type: 'ADD_EVENT',
  payload: event,
});

export const reloadEvents = event => ({
  type: 'RELOAD_EVENTS',
  payload: event,
});

export const addSocket = socket => ({
  type: 'ADD_SOCKET',
  payload: socket,
});

export const reloadCleaners = cleaner => ({
  type: 'RELOAD_CLEANERS',
  payload: cleaner,
});

export const addUser = user => ({
  type: 'ADD_USER',
  payload: user,
});
