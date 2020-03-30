import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Reducer from './FriendReducer';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {mapping, light as lightTheme} from '@eva-design/eva';
import HomeScreenUser from './screens/User/MainScreen';
import PlantScreen from './screens/User/PlantScreen';
import AllAvailablePlants from './screens/User/AllAvailablePlants';
import AddPlantScreen from './screens/User/AddPlantScreen';
import planterScreen from './screens/User/planterScreen';

import UserPage from './screens/User/UserPage';

import Amplify, {Auth} from 'aws-amplify';
import awsConfig from './aws-exports';

Amplify.configure(awsConfig);
import {
  withAuthenticator,
  // Greetings,
  Loading,
} from 'aws-amplify-react-native';

import {
  SignUp,
  SignIn,
  Greetings,
  ForgotPassword,
  RequireNewPassword,
  ConfirmSignIn,
  ConfirmSignUp,
  VerifyContact,
} from './screens/Auth';
import {Image} from 'react-native';
import AdjustPlantConditions from './screens/User/AdjustPlanterConditions';
import addPlanterScreen from './screens/User/addPlanterScreen';
import planterImagesGallery from './screens/User/planterImagesGallery';
import Picture from './screens/User/Picture';
const store = createStore(Reducer);

const AppNavigator = createStackNavigator(
  {
    HomeScreenUser: {
      name: 'Home',
      screen: HomeScreenUser,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    PlantScreen: {
      name: 'Plant',
      screen: PlantScreen,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    AllAvailablePlants: {
      name: 'All Available Plants',
      screen: AllAvailablePlants,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    AddPlantScreen: {
      name: 'Add Plant',
      screen: AddPlantScreen,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    UserPage: {
      name: 'User Page',
      screen: UserPage,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    planterScreen: {
      name: 'Planter Screen',
      screen: planterScreen,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    AdjustPlantConditions: {
      name: 'Adjust Plant Conditions Screen',
      screen: AdjustPlantConditions,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    addPlanterScreen: {
      name: 'Add Planter Screen',
      screen: addPlanterScreen,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    planterImagesGallery: {
      name: 'Image Gallery',
      screen: planterImagesGallery,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    Picture: {
      name: 'Picture',
      screen: Picture,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
  },
  {
    initialRouteName: 'HomeScreenUser',
  },
);

const AppContainer = createAppContainer(AppNavigator);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  static navigationOptions = ({navigation}) => {
    const params = navigation.state.params || {};
    return {
      headerShown: true,
      headerTitle: (
        <Image
          resizeMode="contain"
          style={{height: 40}}
          source={require('./assets/logo.png')}
        />
      ),
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
      },
    };
  };

  logOut = async () => {
    await Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  };

  render() {
    return (
      <Provider store={store}>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider mapping={mapping} theme={lightTheme}>
          <AppContainer screenProps={() => this.logOut} />
        </ApplicationProvider>
      </Provider>
    );
  }
}

export default withAuthenticator(App, false, [
  <SignIn />,
  <ConfirmSignIn />,
  <VerifyContact />,
  <SignUp />,
  <ConfirmSignUp />,
  <ForgotPassword />,
  <RequireNewPassword />,
]);

// elif command=="VIDEO_STREAM_ON": videoStreamOn()
// elif command=="VIDEO_STREAM_OFF": videoStreamOff()
// else:
// print("Unknown Command: {0}".format(command))
