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
import {View, TouchableWithoutFeedback, Keyboard, ImageBackground, Image} from 'react-native';
import { Auth, I18n, Logger, JS } from 'aws-amplify';
import AuthPiece from './AuthPiece';
import {
	AmplifyButton,
	FormField,
	LinkCell,
	Header,
	ErrorRow,
} from '../AmplifyUI';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const logger = new Logger('SignIn');

export default class SignIn extends AuthPiece {
	constructor(props) {
		super(props);

		this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
		this.state = {
			username: null,
			password: null,
			error: null,
		};

		this.checkContact = this.checkContact.bind(this);
		this.signIn = this.signIn.bind(this);
	}

	signIn() {
		const username = this.getUsernameFromInput() || '';
		if(username === '') return
		const { password } = this.state;
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
			})
			.catch(err => this.error(err));
	}

	showComponent(theme) {
		return (
			<KeyboardAwareScrollView extraScrollHeight={30} contentContainerStyle={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				height:"100%",
				width:"100%"}}>
			<ImageBackground
				source={require('../../assets/iphone11Wallpaper.jpg')}
				style={{ width: '100%', height: '100%' }}
			>
			{/*<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>*/}

				<View style={theme.section}>
					<Image
						// resizeMode="contain"
						resizeMode='stretch'
						style={{flex:1, height: 50,width:350, marginBottom: 20}}
						source={require('../../assets/logo.png')}
					/>
					<Header theme={theme}>{I18n.get("Welcome to Plant'y")}
					</Header>

					<View style={theme.sectionBody}>

						{this.renderUsernameField(theme)}
						<FormField
							// theme={theme}
							onChangeText={text => this.setState({ password: text })}
							label={I18n.get('Password')}
							placeholder={I18n.get('Enter your password')}
							secureTextEntry={true}
							required={true}
						/>
						<AmplifyButton
							text={I18n.get('Sign In').toUpperCase()}
							// theme={theme}
							onPress={this.signIn}
							disabled={!this.getUsernameFromInput() && this.state.password}
						/>
					</View>
					<View style={theme.sectionFooter}>
						<LinkCell
							// theme={theme}
							style={{with: "100%"}}
							onPress={() => this.changeState('forgotPassword')}
						>
							{I18n.get('Forgot Password')}
						</LinkCell>
						<LinkCell theme={theme} onPress={() => this.changeState('signUp')}>
							{I18n.get('Sign Up')}
						</LinkCell>
					</View>
					<ErrorRow theme={theme}>{this.state.error}</ErrorRow>
				</View>
			{/*</TouchableWithoutFeedback>*/}
			</ImageBackground>
			</KeyboardAwareScrollView>
		);
	}
}
