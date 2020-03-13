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
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {AppRegistry} from 'react-native';
import App from './App';

import configureStore from './store';
import {SafeAreaProvider} from 'react-native-safe-area-context';

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6f9e04',
    accent: '#6f9d00',
  },
};

export default function Main() {
  return (
    <PaperProvider theme={theme}>
      {/*<SafeAreaProvider>*/}
      <App />
      {/*</SafeAreaProvider>*/}
    </PaperProvider>
  );
}

AppRegistry.registerComponent('Plant_y_app', () => Main);
