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
import {View, TouchableWithoutFeedback, Keyboard, Text, ImageBackground, Image} from 'react-native';
import { Auth, I18n, Logger } from 'aws-amplify';
import {
	FormField,
	LinkCell,
	Header,
	ErrorRow,
	AmplifyButton,
} from '../AmplifyUI';
import AuthPiece from './AuthPiece';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

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
		const { username, code } = this.state;
		logger.debug('Confirm Sign Up for ' + username);
		Auth.confirmSignUp(username, code)
			.then(data => this.changeState('signedUp'))
			.catch(err => this.error(err));
	}

	resend() {
		const { username } = this.state;
		logger.debug('Resend Sign Up for ' + username);
		Auth.resendSignUp(username)
			.then(() => logger.debug('code sent'))
			.catch(err => this.error(err));
	}

	componentWillReceiveProps(nextProps) {
		const username = nextProps.authData;
		if (username && !this.state.username) {
			this.setState({ username });
		}
	}

	showComponent(theme) {
		return (
			<KeyboardAwareScrollView extraScrollHeight={30} contentContainerStyle={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				height:"100%",
				width:"100%"}}>
			{/*<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>*/}


					<ImageBackground
						source={require('../../assets/iphone11Wallpaper.jpg')}
						style={{ width: '100%', height: '100%' }}
					>
				<View style={theme.section}>
					<Header theme={theme}>{I18n.get('             Thank you for the registration                ')}</Header>
					<View style={theme.sectionBody}>
						<Text>Please confirm your email address by proceeding to the link you will get in your inbox</Text>
						<View style={theme.sectionFooter}>
							<LinkCell theme={theme} onPress={() => this.changeState('signIn')}>
								{I18n.get('Back to Sign In')}
							</LinkCell>
						</View>
					</View>
					<ErrorRow theme={theme}>{this.state.error}</ErrorRow>
					<Image
						// resizeMode="contain"
						resizeMode='stretch'
						style={{flex:1, height: 20,width: 400, marginBottom: 0}}
						source={require('../../assets/logo.png')}
					/>
				</View>
			{/*</TouchableWithoutFeedback>*/}

					</ImageBackground>
			</KeyboardAwareScrollView>

				// </KeyboardAwareScrollView>

		);
	}
}
