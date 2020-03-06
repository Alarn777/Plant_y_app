// /**
//  * @format
//  */
//
// import 'react-native-gesture-handler'
// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';
//
//
//
//
// // AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerComponent("Plant_y_app", () => App);

import * as React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as StoreProvider} from 'react-redux';
import {AppRegistry} from 'react-native';
import App from './App';

import configureStore from './store';

const store = configureStore();

export default function Main() {
  return (
    // <StoreProvider store={store}>
    <PaperProvider>
      <App />
    </PaperProvider>
    // </StoreProvider>
  );
}

AppRegistry.registerComponent('Plant_y_app', () => Main);
