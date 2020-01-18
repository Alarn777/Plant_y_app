/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */



import React from 'react';
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from "react-navigation-stack"
import Reducer from './FriendReducer'
import Login from './screens/Login'
import Register from './screens/Register'


import {ApplicationProvider, Button, Icon, IconRegistry, Layout, Text} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { mapping, light as lightTheme } from '@eva-design/eva';
import HomeScreenUser from "./screens/User/MainScreen"
import PlantScreen from "./screens/User/PlantScreen"

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
    VerifyContact
} from './screens/Auth';
import {Image} from 'react-native';


const store = createStore(Reducer)

const AppNavigator = createStackNavigator(
    {
      HomeScreenUser: {
        name: 'HomeScreenUser',
        screen: HomeScreenUser,
        navigationOptions: {
          gesturesEnabled: false
        }
      },
        PlantScreen: {
            name: 'PlantScreen',
            screen: PlantScreen,
            navigationOptions: {
                gesturesEnabled: false
            }
        },
      Login,
      Register,

    },
    {
      initialRouteName: 'HomeScreenUser'
    }
)



const AppContainer = createAppContainer(AppNavigator)

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerShown:true,
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
                alignSelf: 'center'
            }
        }
    }

  logOut = async () => {
        await  Auth.signOut()
            .then(data => console.log(data))
            .catch(err => console.log(err));
        this.rerender()
    }

  render() {
    return (
        <Provider store={store}>
            <IconRegistry icons={EvaIconsPack} />
            <ApplicationProvider mapping={mapping} theme={lightTheme}>
                <AppContainer screenProps={() => this.logOut} />
            </ApplicationProvider>
        </Provider>
    )
  }

  // render(){
  //     return (
  //         <React.Fragment>
  //             <Provider store={store}>
  //                 {/*<IconRegistry icons={EvaIconsPack} />*/}
  //                 <ApplicationProvider mapping={mapping} theme={lightTheme}>
  //                     <AppContainer />
  //                 </ApplicationProvider>
  //             </Provider>
  //         </React.Fragment>
  //        )
  // }

}

export default withAuthenticator(App, false, [
    <SignIn/>,
    <ConfirmSignIn/>,
    <VerifyContact/>,
    <SignUp/>,
    <ConfirmSignUp/>,
    <ForgotPassword/>,
    // <Greetings/>,
    <RequireNewPassword />
]);


