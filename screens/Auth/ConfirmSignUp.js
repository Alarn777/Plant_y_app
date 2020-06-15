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
import {View, Text, ImageBackground} from 'react-native';
import {Auth, I18n, Logger} from 'aws-amplify';
import {LinkCell, Header, ErrorRow} from '../AmplifyUI';
import AuthPiece from './AuthPiece';

const logger = new Logger('ConfirmSignUp');

export default class ConfirmSignUp extends AuthPiece {
  constructor(props) {
    super(props);

    this._validAuthStates = ['confirmSignUp'];
    this.state = {
      username: null,
      code: null,
      error: null,
    };

    this.confirm = this.confirm.bind(this);
    this.resend = this.resend.bind(this);
  }

  confirm() {
    const {username, code} = this.state;
    logger.debug('Confirm Sign Up for ' + username);
    Auth.confirmSignUp(username, code)
      .then(data => this.changeState('signedUp'))
      .catch(err => this.error(err));
  }

  resend() {
    const {username} = this.state;
    logger.debug('Resend Sign Up for ' + username);
    Auth.resendSignUp(username)
      .then(() => logger.debug('code sent'))
      .catch(err => this.error(err));
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const username = nextProps.authData;
    if (username && !this.state.username) {
      this.setState({username});
    }
  }

  showComponent(theme) {
    return (
      <ImageBackground
        source={require('../../assets/7dEVFqb.jpg')}
        style={{width: '100%', height: '100%'}}>
        <View style={theme.section}>
          <Header theme={theme}>
            {I18n.get(
              '             Thank you for the registration                ',
            )}
          </Header>
          <View style={{width: '100%'}}>
            <Text>
              Please confirm your email address by proceeding to the link you
              will get in your inbox
            </Text>
            <View style={theme.sectionFooter}>
              <LinkCell
                style={{color: '#6f9e04', alignContent: 'center'}}
                onPress={() => this.changeState('signIn')}>
                {I18n.get('Back to Sign In')}
              </LinkCell>
            </View>
          </View>
          <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
        </View>
      </ImageBackground>
    );
  }
}
