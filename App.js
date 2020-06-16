import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Reducer from './FriendReducer';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {mapping, light as lightTheme, dark as darkTheme} from '@eva-design/eva';
import HomeScreenUser from './screens/User/MainScreen';
import PlantScreen from './screens/User/PlantScreen';
import AllAvailablePlants from './screens/User/AllAvailablePlants';
import AddPlantScreen from './screens/User/AddPlantScreen';
import planterScreen from './screens/User/planterScreen';
import History from './screens/User/history';
import UserPage from './screens/User/UserPage';
import AITesting from './screens/User/AITesting';
import SendMyPlanter from './screens/User/SendMyPlanter';
import Amplify, {Auth} from 'aws-amplify';
import awsConfig from './aws-exports';
import {StatusBar} from 'react-native';

Amplify.configure(awsConfig);

import {withAuthenticator} from 'aws-amplify-react-native';

import {
  SignUp,
  SignIn,
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
import GrowthPlan from './screens/User/growthPlan';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';

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
      waitForRender: true,
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
    growthPlan: {
      name: 'GrowthPlan',
      screen: GrowthPlan,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    history: {
      name: 'History',
      screen: History,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    AITesting: {
      name: 'AITesting',
      screen: AITesting,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
    SendMyPlanter: {
      name: 'SendMyPlanter',
      screen: SendMyPlanter,
      navigationOptions: {
        gesturesEnabled: false,
      },
    },
  },
  {
    initialRouteName: 'HomeScreenUser',
    cardStyle: {background: 'transparent', backgroundColor: '#263238'},
  },
);

const AppContainer = createAppContainer(AppNavigator);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      styleTypes: ['default', 'dark-content', 'light-content'],
      status_bar: 'dark-content',
      current_theme: 'light',
      dark_theme: {
        ...DefaultTheme,
        roundness: 2,
        dark: true,
        colors: {
          background: '#27323a',
          surface: '#435055',
          primary: '#6f9e04',
          accent: '#6f9d00',
          text: 'white',
          disabled: 'white',
        },
      },
      theme: {
        ...DefaultTheme,
        roundness: 2,
        colors: {
          ...DefaultTheme.colors,
          primary: '#6f9e04',
          accent: '#6f9d00',
        },
      },
    };
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

  changeTheme = theme => {
    this.setState({
      current_theme: theme,
      status_bar:
        this.state.status_bar === 'dark-content'
          ? 'light-content'
          : 'dark-content',
    });
  };

  logOut = async () => {
    await Auth.signOut()
      .then(data => console.log(data))
      .catch(err => console.log(err));
  };

  render() {
    StatusBar.setBarStyle(this.state.status_bar, true);
    return (
      <Provider store={store}>
        <PaperProvider
          theme={
            this.state.current_theme === 'light'
              ? this.state.theme
              : this.state.dark_theme
          }>
          <IconRegistry icons={EvaIconsPack} />
          <ApplicationProvider
            mapping={mapping}
            theme={
              this.state.current_theme === 'light' ? lightTheme : darkTheme
            }>
            <AppContainer screenProps={{func: this.changeTheme.bind(this)}} />
          </ApplicationProvider>
        </PaperProvider>
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
