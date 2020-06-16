import * as React from 'react';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {AppRegistry} from 'react-native';
import App from './App';

export default function Main() {
  return <App />;
}

AppRegistry.registerComponent('plant_y_app', () => Main);
