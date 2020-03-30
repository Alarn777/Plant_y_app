import * as React from 'react';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import {AppRegistry} from 'react-native';
import App from './App';

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
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent('plant_y_app', () => Main);
