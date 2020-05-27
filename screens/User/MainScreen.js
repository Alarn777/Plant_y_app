import React from 'react';
import {
  Image,
  View,
  FlatList,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {Auth} from 'aws-amplify';

import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';
import {Icon, Text, Card} from '@ui-kitten/components';
import {
  FAB,
  Title,
  Button,
  Card as PaperCard,
  Paragraph,
  Avatar,
  ActivityIndicator,
  Colors,
  Chip,
  Searchbar,
  IconButton,
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
} from '../../FriendActions';
import {bindActionCreators} from 'redux';
import WS from '../../websocket';
import {Storage} from 'aws-amplify';
import Const from '../../ENV_VARS';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const plantyColor = '#6f9e04';

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
      plants: [],
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
      preloadImages: true,
      socket: null,
    };
    this.loadPlanters = this.loadPlanters.bind(this);
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.onLayout = this.onLayout.bind(this);

    // console.log('Websocket: ', WS.ws);
    if (WS.ws === undefined) WS.init();
    // WS.init();
    //
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
            // alert('Failed to communicate with server');
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
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
      },
    };
  };

  preloadImages = () => {
    if (!this.state.preloadImages) return;

    let allImages = [
      'mint',
      'potato',
      'soy',
      'sunflower',
      'tomato',
      'cucumber',
      'strawberry',
    ];

    allImages.map(oneImage => {
      Storage.get(oneImage + '_img.jpg', {
        level: 'public',
        type: 'image/jpg',
      })
        .then(data => {
          console.log({name: oneImage, URL: data});
          this.props.addImage({name: oneImage, URL: data});
        })
        .catch(error => {
          console.log(error);
        });
    });

    this.setState({preloadImages: true});
  };

  dealWithData = user => {
    if (!this.props.plantyData.myCognitoUser) this.props.addUser(user);

    this.setState({user});
    if (this.state.user) this.setState({userLoggedIn: true});
  };

  dealWithPlantsData = plants => {
    if (plants.Items) {
      let planters = [];
      plants.Items.map(one => {
        if (one.planterStatus !== 'inactive') {
          planters.push(one);
        }
      });

      this.setState({plants: planters, allPlanters: planters});
    } else this.setState({plants: []});
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
    // console.log('loading plants.');
    this.setState({plants: []});

    // console.log('called reload plants');
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
        // console.log(response.data);
        this.dealWithPlantsData(response.data);
      })
      .catch(error => {
        console.log('error ' + error);
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
      // .then(data => console.log(data))
      .catch(() => this.logOut());
  }

  componentDidMount(): void {
    this.fetchUser()
      .then(() => {
        this.props.navigation.setParams({logOut: this.logOut});

        this.props.navigation.setParams({
          userLoggedIn: this.state.userLoggedIn,
        });

        //open socket
      })
      .catch(e => console.log(e));

    const {authState, authData} = this.props;
    const user = authData;
    if (user) {
      const {usernameAttributes = []} = this.props;
      if (usernameAttributes === 'email') {
        // Email as Username
        this.setState({
          username: user.attributes ? user.attributes.email : user.username,
        });
      }

      this.setState({username: user.username});
    } else this.setState({username: 'Guest'});
    this.loadPlanters()
      .then()
      .catch(e => console.log(e));

    // if (!this.props.plantyData.myCognitoUser) this.props.addUser(user);

    this.props.addUser(user);

    let userAvatarKey = 'user_avatars/' + user.username + '_avatar.jpeg';

    Storage.get(userAvatarKey, {
      level: 'public',
      type: 'image/jpg',
      // bucket: 'plant-pictures-planty',
      // region: 'eu',
    })
      .then(data => {
        // console.log(data);
        this.props.AddAvatarLink(data);
        // this.setState({url: data});
      })
      .catch(error => console.log(error));
    this.preloadImages();

    // WS.sendMessage(
    //   'FROM_CLIENT;e0221623-fb88-4fbd-b524-6f0092463c93;VIDEO_STREAM_ON',
    // );
  }

  logOut = () => {
    Auth.signOut()
      .then(() => {
        this.props.cleanReduxState();
        this.props.onStateChange('signedOut');
        // this.props.cleanReduxState();
        this.props.navigation.goBack();
        // onStateChange('signedOut');
      })
      .catch(e => console.log(e));
  };

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }

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
          style={{width: this.state.width / 3 - 9, margin: 3, borderRadius: 5}}
          index={item.UUID}
          key={item.UUID}>
          <Image
            style={styles.headerImage}
            source={require('../../assets/greenhouse.png')}
          />
          <Text style={styles.partyText}>{item.name}</Text>
          {/*</TouchableOpacity>*/}
        </PaperCard>

        {/*<Card*/}
        {/*  header={() => {*/}
        {/*    return (*/}
        {/*      <TouchableOpacity*/}
        {/*        onPress={() => {*/}
        {/*          // WS.init();*/}
        {/*          this.props.navigation.navigate('planterScreen', {*/}
        {/*            item: item,*/}
        {/*            user_token: this.state.USER_TOKEN,*/}
        {/*            loadPlanters: this.loadPlanters,*/}
        {/*          });*/}
        {/*        }}>*/}
        {/*        <Image*/}
        {/*          style={styles.headerImage}*/}
        {/*          source={require('../../assets/greenhouse.png')}*/}
        {/*        />*/}
        {/*      </TouchableOpacity>*/}
        {/*    );*/}
        {/*  }}*/}
        {/*  style={{width: this.state.width / 3 - 5, margin: 1}}*/}
        {/*  index={item.UUID}*/}
        {/*  key={item.UUID}>*/}
        {/*  <TouchableOpacity*/}
        {/*    onPress={() => {*/}
        {/*      this.props.navigation.navigate('planterScreen', {*/}
        {/*        item: item,*/}
        {/*        user_token: this.state.USER_TOKEN,*/}
        {/*        loadPlanters: this.loadPlanters,*/}
        {/*      });*/}
        {/*    }}>*/}
        {/*    <Text style={styles.partyText}>{item.name}</Text>*/}
        {/*  </TouchableOpacity>*/}
        {/*</Card>*/}
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container} onLayout={this.onLayout}>
        <StatusBar translucent barStyle="dark-content" />
        <PaperCard>
          <PaperCard.Title
            title={
              this.state.username === 'Test'
                ? 'Username: Yukio'
                : 'Username: ' + this.state.username
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
                style={{backgroundColor: 'white'}}
                icon={require('../../assets/icons/settings-2-outline.png')}
                color={plantyColor}
                onPress={() =>
                  this.props.navigation.navigate('UserPage', {
                    user: this.state.user,
                    logOut: this.logOut,
                    planters: this.state.plants,
                  })
                }
              />
            )}
          />
        </PaperCard>
        <PaperCard style={{marginTop: 5, marginBottom: 5}}>
          <Image
            resizeMode={'center'}
            style={{
              height: 100,
              width: this.state.width,
              marginTop: 10,
              marginBottom: 5,
            }}
            source={require('../../assets/logo_text.png')}
          />
          <PaperCard.Actions />
        </PaperCard>

        {/*<Card>*/}
        <PaperCard style={{marginTop: 0, marginBottom: 5}}>
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
        {/*</Card>*/}

        <ScrollView style={styles.data}>
          <FlatList
            scrollEnabled={false}
            numColumns={3}
            data={this.state.plants}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />
        </ScrollView>
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            backgroundColor: 'white',
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
    // fontSize: 20,
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
