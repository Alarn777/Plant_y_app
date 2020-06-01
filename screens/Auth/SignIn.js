/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import React from 'react';
import {
    View,
    TouchableWithoutFeedback,
    Keyboard,
    ImageBackground,
    StatusBar,
    Image,
    Dimensions, Alert,
} from 'react-native';
StatusBar.setBarStyle('light-content', true);
import {Auth, I18n, Logger, JS} from 'aws-amplify';
import AuthPiece from './AuthPiece';
import {
  AmplifyButton,
  FormField,
  LinkCell,
  Header,
  ErrorRow,
} from '../AmplifyUI';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
// import SafeAreaView from 'react-native-safe-area-view';
import SocketIOClient from 'socket.io-client';

import {Button, TextInput} from 'react-native-paper';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {bindActionCreators} from 'redux';
import {addSocket, addUser, loadPlanters} from '../../FriendActions';
import {connect} from 'react-redux';
import WS from '../../websocket';
import {isIphone7, isIphoneX} from '../../whatDevice';
const logger = new Logger('SignIn');
import * as Keychain from 'react-native-keychain';
import TouchID from 'react-native-touch-id'
import IconButton from 'react-native-paper/src/components/IconButton';

const optionalConfigObject = {
    title: "Authentication Required", // Android
    color: "#e00606", // Android,
    fallbackLabel: "Show Passcode" // iOS (if empty, then label is hidden)
}

const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';


class SignIn extends AuthPiece {
  constructor(props) {
    super(props);

    this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
    this.state = {
      username: null,
      password: null,
      error: null,
      loginigIn: false,
      redFields: false,
      FaceIDIsOn:false,
      idIsSupported:false
    };

    this.checkContact = this.checkContact.bind(this);
    this.signIn = this.signIn.bind(this);
  }

    async checkIfIdActivated() {
        try {
            //retrieve the credentials from keychain if saved.
            let credentials = await Keychain.getGenericPassword()
            if (credentials) {
                this.setState({FaceIDIsOn:true})
            }
            else
                this.setState({FaceIDIsOn:false})
        }
        catch(err) {
            this.setState({FaceIDIsOn:false})
            // if(err.message !== 'No keychain entry found') //No password exists in the key chain...
            // else //some other error occurred.
        }

    }

  componentDidMount(): void {
      // TouchID.authenticate('to demo this react-native component', optionalConfigObject)
      //     .then(success => {
      //         Alert.alert('Authenticated Successfully');
      //     })
      //     .catch(error => {
      //         Alert.alert('Authentication Failed');
      //     });
      this.checkIftouchFaceIsSupported()
      this.checkIfIdActivated().then().catch()

  }

  checkIftouchFaceIsSupported = () => {
      TouchID.isSupported()
          .then(biometryType => {
              // Success code
              if (biometryType === 'FaceID') {
                  // console.log('FaceID is supported.');
                  this.setState({idIsSupported:true,idIcon:'face'})

              } else if (biometryType === 'TouchID'){
                  // console.log('TouchID is supported.');
                  this.setState({idIsSupported:true,idIcon:'fingerprint'})
              } else if (biometryType === true) {
                  // Touch ID is supported on Android
              }
          })
          .catch(error => {
              // Failure code if the user's device does not have touchID or faceID enabled
              console.log(error);
          });
  }


    handleTouchIDPress = () => {              // User presses the "Login using Touch ID" button

        Keychain.getGenericPassword()   // Retrieve the credentials from the keychain
            .then(credentials => {
                const { username, password } = credentials;
                // console.log(username,password)
                // Prompt the user to authenticate with Touch ID.
                // You can display the username in the prompt
                TouchID.authenticate(`to login with username "${username}"`)
                    .then(() => {

                        this.setState({username:username,password:password})
                        this.signIn()

                        // If Touch ID authentication is successful, call the `login` api
                        // login(username, password)
                        //     .then(() => {
                        //         // Handle login success
                        //     })
                        //     .catch(error => {
                        //         if (error === 'INVALID_CREDENTIALS') {
                        //             // The keychain contained invalid credentials :(
                        //             // We need to clear the keychain and the user will have to sign in manually
                        //             Keychain.resetGenericPassword();
                        //         }
                        //     })
                    });
            });
    };



    signIn() {
    this.setState({loginigIn: true});
    const username = this.getUsernameFromInput() || '';
    if (username === '') return;
    const {password} = this.state;
    logger.debug('Sign In for ' + username);
    Auth.signIn(username, password)
      .then(user => {
        logger.debug(user);
        const requireMFA = user.Session !== null;
        if (user.challengeName === 'SMS_MFA') {
          this.changeState('confirmSignIn', user);
        } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          logger.debug('require new password', user.challengeParam);
          this.changeState('requireNewPassword', user);
        } else {
          this.checkContact(user);
        }
        //create table for user
        // console.log(user.signInUserSession.idToken.jwtToken);
        const AuthStr = 'Bearer '.concat(
          user.signInUserSession.idToken.jwtToken,
        );

        //create pictures for planter table for user if not exists yet
        axios
          .post(
            Consts.apigatewayRoute + '/createPlanterPictures',
            {
              username: user.username,
            },
            {
              headers: {Authorization: AuthStr},
            },
          )
          .then(response => {
            // If request is good...
            // console.log(response.data);
            // this.dealWithUrlData(response.data);
          })
          .catch(error => {
            console.log('error ' + error);
          });

        //create planter table for user if not exists yet
        axios
          .post(
            Consts.apigatewayRoute + '/createPlanterTable',
            {
              username: user.username,
            },
            {
              headers: {Authorization: AuthStr},
            },
          )
          .then(response => {
            // If request is good...
            // console.log(response.data);
            // this.dealWithUrlData(response.data);
          })
          .catch(error => {
            console.log('error ' + error);
          });
      })
      .catch(err => {
        // this.setState({error: true});
        console.log(err);
        this.setState({redFields: true});
        this.setState({loginigIn: false});
        this.error(err);
      });
    WS.init();
  }

  renderSwitch() {
    if (isIphone7())
      return (
        <Image
          resizeMode="contain"
          style={{
            alignSelf: 'center',
            height: 200,
            width: 320,
            marginBottom: '18%',
          }}
          source={require('../../assets/logo.png')}
        />
      );
    else if (isIphoneX())
      return (
        <Image
          resizeMode="contain"
          style={{
            alignSelf: 'center',
            height: 200,
            width: 300,
            marginBottom: '21%',
          }}
          source={require('../../assets/logo.png')}
        />
      );
    else
      return (
        <Image
          resizeMode="contain"
          style={{
            alignSelf: 'center',
            height: 250,
            width: 390,
            marginBottom: '21%',
          }}
          source={require('../../assets/logo.png')}
        />
      );
  }

  showComponent(theme) {
    return (
      <View>
        <StatusBar translucent barStyle="dark-content" />
        <KeyboardAwareScrollView
          extraScrollHeight={30}
          contentContainerStyle={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
          }}>
          <ImageBackground
            source={require('../../assets/7dEVFqb.jpg')}
            style={{width: '100%', height: '100%'}}>
            <View style={theme.section}>
              {this.renderSwitch()}
              <View>
                {/*{this.renderUsernameField(theme)}*/}
                <FormField
                  // theme={theme}
                  onChangeText={text => this.setState({username: text})}
                  label={I18n.get('Username')}
                  placeholder={I18n.get('Enter your username')}
                  secureTextEntry={false}
                  required={true}
                />
                <FormField
                  // theme={theme}
                  onChangeText={text => this.setState({password: text})}
                  label={I18n.get('Password')}
                  placeholder={I18n.get('Enter your password')}
                  secureTextEntry={true}
                  required={true}
                />
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    // padding: 8,
                }}>
                <Button
                  loading={this.state.loginigIn}
                  disabled={
                    !this.getUsernameFromInput() ||
                    // !this.state.username ||
                    !this.state.password
                  }
                  mode="contained"
                  style={{padding: 10,width:'80%',height:55}}
                  backgroundColor="#6f9e04"
                  // backgroundColor={''}
                  color="#6f9e04"
                  // onPress={() => this.changeState('confirmSignUp', 'LOL')}
                  onPress={this.signIn}>
                  {/*{I18n.get('Sign In').toUpperCase()}*/}
                    {'Sign In'.toUpperCase()}
                </Button>
                  <IconButton
                      // style={{margin:'1%'}}
                      disabled={!this.state.FaceIDIsOn || !this.state.idIsSupported}
                      icon={this.state.idIcon}
                      // color={plantyColor}
                      color={'white'}
                      size={30}
                      onPress={() => this.handleTouchIDPress()}
                  />
                </View>
              </View>
              <View style={theme.sectionFooter}>
                <LinkCell
                  // theme={theme}
                  style={{with: '100%'}}
                  onPress={() => this.changeState('forgotPassword')}>
                  {I18n.get('Forgot Password')}
                </LinkCell>
                <LinkCell
                  // theme={theme}
                  onPress={() => this.changeState('signUp')}>
                  {I18n.get('Sign Up')}
                </LinkCell>
              </View>
              <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
            </View>
          </ImageBackground>
          {/*</SafeAreaView>*/}
        </KeyboardAwareScrollView>
        {/*/ </SafeAreaView>*/}
      </View>
    );
  }
}

export default SignIn;
//
// 'use strict';
// import React, {Component} from 'react';
// import {Alert, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
//
// import TouchID from 'react-native-touch-id';
//
// export default class FingerPrint extends Component<{}> {
//   constructor() {
//     super();
//
//     this.state = {
//       biometryType: null,
//     };
//   }
//
//   componentDidMount() {
//     TouchID.isSupported().then(biometryType => {
//       this.setState({biometryType});
//     });
//   }
//
//   render() {
//     return (
//       <View style={styles.container}>
//         <TouchableHighlight
//           style={styles.btn}
//           onPress={this.clickHandler}
//           underlayColor="#0380BE"
//           activeOpacity={1}>
//           <Text
//             style={{
//               color: '#fff',
//               fontWeight: '600',
//             }}>
//             {`Authenticate with ${this.state.biometryType}`}
//           </Text>
//         </TouchableHighlight>
//       </View>
//     );
//   }
//
//   clickHandler() {
//     TouchID.isSupported()
//       .then(authenticate)
//       .catch(error => {
//         Alert.alert('TouchID not supported');
//       });
//   }
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//   },
//   btn: {
//     borderRadius: 3,
//     marginTop: 200,
//     paddingTop: 15,
//     paddingBottom: 15,
//     paddingLeft: 15,
//     paddingRight: 15,
//     backgroundColor: '#0391D7',
//   },
// });
//
// function authenticate() {
//   return TouchID.authenticate()
//     .then(success => {
//       Alert.alert('Authenticated Successfully');
//     })
//     .catch(error => {
//       console.log(error);
//       Alert.alert(error.message);
//     });
// }
