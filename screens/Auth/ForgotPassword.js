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
import {View, ImageBackground, AsyncStorage} from 'react-native';
import {Auth, I18n, Logger} from 'aws-amplify';
import {
  FormField,
  AmplifyButton,
  LinkCell,
  Header,
  ErrorRow,
} from '../AmplifyUI';
import AuthPiece from './AuthPiece';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const logger = new Logger('ForgotPassword');

export default class ForgotPassword extends AuthPiece {
  constructor(props) {
    super(props);

    this._validAuthStates = ['forgotPassword'];
    this.state = {delivery: null, theme: 'light'};

    this.send = this.send.bind(this);
    this.submit = this.submit.bind(this);
  }

  send() {
    const username = this.getUsernameFromInput();
    if (!username) {
      this.error('Username cannot be empty');
      return;
    }
    Auth.forgotPassword(username)
      .then(data => {
        logger.debug(data);
        this.setState({delivery: data.CodeDeliveryDetails});
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          'ForgotPassword',
        );
        this.error(err);
      });
  }

  submit() {
    const {code, password} = this.state;
    const username = this.getUsernameFromInput();
    Auth.forgotPasswordSubmit(username, code, password)
      .then(data => {
        logger.debug(data);
        this.changeState('signIn');
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          'ForgotPasswordSubmit',
        );
        this.error(err);
      });
  }

  forgotBody(theme, my_theme) {
    return (
      <View style={theme.sectionBody}>
        {this.renderUsernameField(theme, my_theme)}
        <AmplifyButton
          text={I18n.get('Send').toUpperCase()}
          // theme={theme}
          style={{color: '#6f9e04'}}
          onPress={this.send}
          disabled={!this.getUsernameFromInput()}
        />
      </View>
    );
  }

  submitBody(theme) {
    return (
      <KeyboardAwareScrollView
        extraScrollHeight={30}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>
        <View style={theme.sectionBody}>
          <FormField
            my_theme={this.state.theme}
            onChangeText={text => this.setState({code: text})}
            label={I18n.get('Confirmation Code')}
            placeholder={I18n.get('Enter your confirmation code')}
            required={true}
          />
          <FormField
            my_theme={this.state.theme}
            onChangeText={text => this.setState({password: text})}
            label={I18n.get('Password')}
            placeholder={I18n.get('Enter your new password')}
            secureTextEntry={true}
            required={true}
          />
          <AmplifyButton
            text={I18n.get('Submit')}
            theme={theme}
            onPress={this.submit}
            disabled={!(this.state.code && this.state.password)}
          />
          <View style={theme.sectionFooter}>
            <LinkCell onPress={() => this.changeState('signIn')}>
              {I18n.get('Back to Sign In')}
            </LinkCell>
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }

  componentDidMount(): void {
    this._retrieveData()
      .then()
      .catch();
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('theme');
      if (value !== null) {
        this.setState({theme: value});
      }
    } catch (error) {
      console.log(error);
    }
  };

  showComponent(theme) {
    return (
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
          source={
            this.state.theme === 'light'
              ? require('../../assets/7dEVFqb.jpg')
              : require('../../assets/dark_background.jpg')
          }
          style={{width: '100%', height: '100%'}}>
          <View style={theme.section}>
            <Header theme={theme}>{I18n.get('Forgot Password')}</Header>
            <View style={theme.sectionBody}>
              {!this.state.delivery && this.forgotBody(theme, this.state.theme)}
              {this.state.delivery && this.submitBody(theme)}
              <View style={theme.sectionFooter} />
            </View>
            <View style={theme.sectionFooter}>
              <LinkCell onPress={() => this.changeState('signIn')}>
                {I18n.get('Back to Sign In')}
              </LinkCell>
            </View>
            <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
          </View>
        </ImageBackground>
      </KeyboardAwareScrollView>
    );
  }
}
