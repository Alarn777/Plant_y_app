import React from 'react';
import {
  Image,
  View,
  FlatList,
  ScrollView,
  Dimensions,
  StatusBar,
  AsyncStorage,
} from 'react-native';
import {Auth} from 'aws-amplify';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';
import {Text} from '@ui-kitten/components';
import {
  FAB,
  Card as PaperCard,
  Avatar,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import {withAuthenticator} from 'aws-amplify-react-native';
import {
  ConfirmSignIn,
  ConfirmSignUp,
  ForgotPassword,
  RequireNewPassword,
  SignIn,
  SignUp,
  VerifyContact,
  Greetings,
} from '../Auth';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import connect from 'react-redux/lib/connect/connect';
import {
  AddAvatarLink,
  addSocket,
  addUser,
  addImage,
  connectWS,
  addAction,
  dealWithMessage,
  cleanReduxState,
  changeTheme,
} from '../../FriendActions';
import {bindActionCreators} from 'redux';
import WS from '../../websocket';
import {Storage} from 'aws-amplify';
import {isIphone7} from '../../whatDevice';
import {Logger} from '../../Logger';

const plantyColor = '#6f9e04';
const surfaceColor = '#435055';

class MainScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      userLoggedIn: true,
      userEmail: '',
      username: '',
      width: 0,
      height: 0,
      planters: [],
      parties: [],
      places: null,
      change: false,
      user: null,
      USER_TOKEN: '',
      userAvatar: '',
      myCognitoUser: null,
      url: '',
      planterWasRemoved: false,
      query: '',
      allPlanters: [],
      preloadImagesFlag: true,
      socket: null,
    };
    this.loadPlanters = this.loadPlanters.bind(this);
    this.dealWithPlantersData = this.dealWithPlantersData.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.onLayout = this.onLayout.bind(this);

    if (WS.ws === undefined) WS.init();
    WS.onMessage(data => {
      // console.log('GOT in main screen', data.data);
      let instructions = data.data.split(';');
      if (instructions.length > 2)
        switch (instructions[2]) {
          case 'UPDATE_STATE':
            this.loadPlanters()
              .then()
              .catch();
            break;
          case 'FAILED':
            this.forceUpdate();
            break;
        }
    });
  }

  static navigationOptions = ({navigation}) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: (
        <Image
          resizeMode="contain"
          style={{height: 40, width: 40}}
          source={require('../../assets/logo.png')}
        />
      ),
      headerStyle: {
        backgroundColor: params.headerColor,
      },
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
      },
    };
  };

  preloadImages = () => {
    if (!this.state.preloadImagesFlag) return;
    Storage.list('', {
      level: 'public',
      type: 'image/jpg',
    })
      .then(result => {
        result.map(one => {
          if (one.key.endsWith('.jpg') && !one.key.includes('/')) {
            Storage.get(one.key, {
              level: 'public',
              type: 'image/jpg',
            })
              .then(data => {
                this.props.addImage({
                  name: one.key.replace('_img.jpg', ''),
                  URL: data,
                });
              })
              .catch(error => {
                console.log(error);
                Logger.saveLogs(
                  this.props.plantyData.myCognitoUser.username,
                  error.toString(),
                  'preloadImages',
                );
              });
          }
        });
      })
      .catch(err => {
        console.log(err);
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          'preloadImages',
        );
      });
    this.setState({preloadImagesFlag: true});
  };

  dealWithData = user => {
    if (!this.props.plantyData.myCognitoUser) this.props.addUser(user);

    this.setState({user});
    if (this.state.user) this.setState({userLoggedIn: true});
  };

  dealWithPlantersData = planters => {
    if (planters.Items) {
      let filteredPlanters = [];

      planters.Items.map(one => {
        if (one.planterStatus !== 'inactive') {
          filteredPlanters.push(one);
        }
      });

      this.setState({
        planters: filteredPlanters,
        allPlanters: filteredPlanters,
      });
    } else this.setState({planters: []});
  };

  async fetchUser() {
    await Auth.currentAuthenticatedUser({
      bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    })
      .then(user => {
        this.dealWithData(user);
      })
      .catch(err => console.log(err));
  }

  async loadPlanters() {
    this.setState({planters: []});
    let USER_TOKEN = '';

    USER_TOKEN = this.props.authData.signInUserSession.idToken.jwtToken;
    this.state.USER_TOKEN = USER_TOKEN;

    const AuthStr = 'Bearer '.concat(this.state.USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/getuserplanters',
        {
          username: this.props.authData.username,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.dealWithPlantersData(response.data);
      })
      .catch(err => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          'loadPlanters',
        );
        this.fetchUser();
      });
  }

  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS,
  ): void {
    if (this.props.navigation.getParam('planterWasRemoved')) {
      this.loadPlanters()
        .then()
        .catch();
      this.props.navigation.setParams({planterWasRemoved: false});
    }
    Auth.currentAuthenticatedUser()
      .then()
      .catch(() => this.logOut());

    let condition =
      this.props.navigation.getParam('headerColor') === 'white'
        ? 'light'
        : 'dark';
    if (this.props.plantyData.theme !== condition)
      this.props.navigation.setParams({
        headerColor:
          this.props.plantyData.theme === 'light' ? 'white' : '#263238',
      });
  }

  componentDidMount(): void {
    this._retrieveData()
      .then()
      .catch();
    this.onLayout();
    this.fetchUser()
      .then(() => {
        this.props.navigation.setParams({logOut: this.logOut});

        this.props.navigation.setParams({
          userLoggedIn: this.state.userLoggedIn,
        });
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'fetchUser - mainScreen',
        );
        console.log(e);
      });

    const {authState, authData} = this.props;
    const user = authData;
    if (user) {
      const {usernameAttributes = []} = this.props;
      if (usernameAttributes === 'email') {
        this.setState({
          username: user.attributes ? user.attributes.email : user.username,
        });
      }

      this.setState({username: user.username});
    } else this.setState({username: 'Guest'});
    this.loadPlanters()
      .then()
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'loadPlanters',
        );
        console.log(e);
      });
    this.props.addUser(user);
    let userAvatarKey = 'user_avatars/' + user.username + '_avatar.jpeg';
    Storage.get(userAvatarKey, {
      level: 'public',
      type: 'image/jpg',
    })
      .then(data => {
        this.props.AddAvatarLink(data);
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'getUserAvatar',
        );
        console.log(e);
      });
    this.preloadImages();
  }

  logOut = () => {
    Auth.signOut()
      .then(() => {
        this.props.cleanReduxState();
        this.props.onStateChange('signedOut');
        this.props.navigation.goBack();
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'logOut',
        );
        console.log(e);
      });
  };

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('theme');
      if (value !== null) {
        console.log('_retrieveData ', value);
        this.props.changeTheme(value);
        this.props.screenProps.func(value);
      }
    } catch (error) {
      console.log(error);
    }
  };

  _keyExtractor = item => item.UUID;

  _renderItem = ({item}) => {
    if (item.planterStatus === 'inactive') {
      return;
    }

    return (
      <View>
        <PaperCard
          onPress={() =>
            this.props.navigation.navigate('planterScreen', {
              item: item,
              user_token: this.state.USER_TOKEN,
              loadPlanters: this.loadPlanters,
            })
          }
          style={{width: this.state.width / 3 - 6, margin: 3, borderRadius: 5}}
          index={item.UUID}
          key={item.UUID}>
          <Image
            style={styles.headerImage}
            source={require('../../assets/greenhouse.png')}
          />
          <Text style={styles.partyText}>{item.name}</Text>
        </PaperCard>
      </View>
    );
  };

  render() {
    let logo_width = this.state.width;
    if (isIphone7()) logo_width = 414;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
          position: 'relative',
        }}
        onLayout={this.onLayout}>
        <PaperCard style={{margin: 5}}>
          <PaperCard.Title
            title={
              this.state.username === 'Test'
                ? 'Hello: Yukio'
                : 'Hello: ' + this.state.username
            }
            left={props => (
              <Avatar.Image
                {...props}
                source={{uri: this.props.plantyData.avatarUrl}}
              />
            )}
            right={props => (
              <IconButton
                {...props}
                style={{
                  backgroundColor:
                    this.props.plantyData.theme === 'light'
                      ? 'white'
                      : '#27323a',
                }}
                icon={require('../../assets/icons/settings-2-outline.png')}
                color={plantyColor}
                onPress={() =>
                  this.props.navigation.navigate('UserPage', {
                    user: this.state.user,
                    logOut: this.logOut,
                    theme: this.props.screenProps.func,
                    planters: this.state.planters,
                  })
                }
              />
            )}
          />
        </PaperCard>
        <PaperCard style={{margin: 5}}>
          <Image
            resizeMode="contain"
            style={{
              height: 100,
              width: logo_width,
              marginTop: 10,
              alignSelf: 'center',
              marginBottom: 5,
            }}
            source={require('../../assets/logo_text.png')}
          />
          <PaperCard.Actions />
        </PaperCard>
        <PaperCard style={{margin: 5}}>
          <View style={styles.header}>
            <Text style={styles.headerText}>My garden</Text>
          </View>
          <IconButton
            icon={'reload'}
            color={plantyColor}
            size={20}
            style={{position: 'absolute', left: -5, top: -5}}
            onPress={() => {
              this.loadPlanters()
                .then()
                .catch();
            }}
          />
        </PaperCard>
        <ScrollView style={styles.data}>
          {this.state.planters.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={plantyColor}
              style={{
                alignItems: 'center',
                marginLeft: this.state.width / 2 - 30,
              }}
            />
          ) : (
            <FlatList
              scrollEnabled={false}
              numColumns={3}
              data={this.state.planters}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
          )}
        </ScrollView>
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            backgroundColor:
              this.props.plantyData.theme === 'light' ? 'white' : surfaceColor,
            color: plantyColor,

            right: 0,
            bottom: 10,
          }}
          large
          icon="plus"
          color={plantyColor}
          onPress={() =>
            this.props.navigation.navigate('addPlanterScreen', {
              user_token: this.state.USER_TOKEN,
              user: this.state.user,
              loadPlanters: this.loadPlanters,
            })
          }
        />
        <Image
          style={{position: 'absolute', bottom: -10, left: -10, zIndex: -10}}
          source={require('../../assets/grass.png')}
        />
      </View>
    );
  }
}

MainScreen.propTypes = {
  navigation: PropTypes.any,
  addEvent: PropTypes.func,
};
//
const mapStateToProps = state => {
  const {plantyData} = state;

  return {plantyData};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addUser,
      addImage,
      AddAvatarLink,
      cleanReduxState,
      addSocket,
      dealWithMessage,
      connectWS,
      addAction,
      changeTheme,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  withAuthenticator(MainScreen, false, [
    <SignIn />,
    <ConfirmSignIn />,
    <VerifyContact />,
    <SignUp />,
    <ConfirmSignUp />,
    <ForgotPassword />,
    <Greetings />,
    <RequireNewPassword />,
  ]),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '98%',
    margin: '1%',
    backgroundColor: 'white',
    position: 'relative',
  },
  headerText: {
    marginBottom: 5,
    height: 30,
    fontWeight: 'bold',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 20,
    marginTop: 10,
    flexDirection: 'row',
  },
  partyText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    justifyContent: 'center',
    width: '20%',
    borderRadius: 5,
    height: '80%',
    marginLeft: 30,
    borderColor: 'blue',
    backgroundColor: 'lightblue',
  },
  data: {
    flexWrap: 'wrap',
    flex: 1,
    flexDirection: 'row',
  },
  headerImage: {
    flex: 1,
    width: 100,
    margin: 5,
    alignSelf: 'center',
    height: 100,
  },
  parent: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  child: {
    flexBasis: '33%',
  },
});
