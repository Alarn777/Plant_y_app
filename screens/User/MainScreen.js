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
import {Icon, Text, Card, Button} from '@ui-kitten/components';
import {
  FAB,
  Title,
  Card as PaperCard,
  Paragraph,
  Avatar,
  ActivityIndicator,
  Colors,
  Chip,
  Searchbar,
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
  fetchAllPosts,
  addAction,
  dealWithMessage,
  cleanReduxState,
} from '../../FriendActions';
import {bindActionCreators} from 'redux';
const Sockette = require('sockette');
import WS from '../../websocket';

import {w3cwebsocket as W3CWebSocket} from 'websocket';
// const ws = new Sockette('ws://localhost:3000', {
//   timeout: 5e3,
//   maxAttempts: 3,
//   onopen: e => console.log('Connected!', e),
//   onmessage: e => console.log('Received:', e),
//   onreconnect: e => console.log('Reconnecting...', e),
//   onmaximum: e => console.log('Stop Attempting!', e),
//   onclose: e => console.log('Closed!', e),
//   onerror: e => console.log('Error:', e),
// });

import SocketIOClient from 'socket.io-client';
// import {idPattern} from 'react-native-svg/\lib/typescript/lib/util';

// import Amplify from 'aws-amplify';
// import Amplify, {Storage} from 'aws-amplify-react-native';
import Amplify, {Storage} from 'aws-amplify';

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
      // logOut: this.props.navigation.getParam('logOut'),
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
    };
    this.loadPlanters = this.loadPlanters.bind(this);
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.onLayout = this.onLayout.bind(this);

    WS.init();

    WS.onMessage(data => {
      console.log('GOT in main screen', data);
      // or something else or use redux
      // dispatch({type: 'MyType', payload: data});
    });
  }

  static navigationOptions = ({navigation}) => {
    const params = navigation.state.params || {};
    return {
      // headerShown: navigation.getParam('userLoggedIn'),
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

    let allImages = ['mint', 'potato', 'sunflower', 'tomato', 'cucumber'];

    allImages.map(oneImage => {
      Storage.get(oneImage + '_img.jpg', {
        level: 'public',
        type: 'image/jpg',
      })
        .then(data => {
          // console.log(data);
          // console.log(data);

          this.props.addImage({name: oneImage, URL: data});
          // this.setState({url: data});
          // this.props.AddAvatarLink(data);
          // this.setState({buttonMode: 'pick'});
        })
        .catch(error => {
          console.log(error);
        });
    });

    this.setState({preloadImages: true});
  };

  dealWithData = user => {
    //add to redux
    // console.log(user);
    if (!this.props.plantyData.myCognitoUser) this.props.addUser(user);

    this.setState({user});
    if (this.state.user) this.setState({userLoggedIn: true});
  };

  dealWithPlantsData = plants => {
    if (plants.Items) {
      this.setState({plants: plants.Items, allPlanters: plants.Items});
    } else this.setState({plants: []});
  };

  // reloadPlants = query => {
  //   // this.state.allPlanters = this.state.plants;
  //   if (this.state.query) console.log(true);
  //
  //   if (this.state.query !== '') {
  //     let newPlants = [];
  //     this.state.allPlanters.map(one => {
  //       if (
  //         one.name.includes(this.state.query) ||
  //         one.name === this.state.query
  //       ) {
  //         newPlants.push(one);
  //       }
  //     });
  //
  //     this.setState({plants: newPlants});
  //   } else this.setState({plants: this.state.allPlanters});
  //   this.setState({query: query});
  // };

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
    console.log('loading plants.');
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

    // this.props.fetchAllPosts(user);

    // console.log(this.props.plantyData);

    this.preloadImages();

    //socket initiation
    // const client = new W3CWebSocket(Consts.socket_connection_url);
    // client.onopen = () => {
    //   console.log('WebSocket Client Connected');
    // };
    // client.onmessage = message => {
    //   console.log(message);
    // };

    // let socket = new Sockette(Consts.apigatewaySocket, {
    //   timeout: 5e3,
    //   maxAttempts: 3,
    //   onopen: e => console.log('Connected!', e),
    //   onmessage: e => this.props.dealWithMessage(e),
    //   onreconnect: e => console.log('Reconnecting...', e),
    //   onmaximum: e => console.log('Stop Attempting!', e),
    //   onclose: e => console.log('Closed!', e),
    //   onerror: e => console.log('Error:', e),
    // });

    // this.props.connectWS();

    // this.props.addAction(this.showMessage);
  }

  showMessage = e => {
    // b; // this.props.dealWithMessage(e.data);
    // console.log(e.data);
    console.log('socket action in main screen');
    // this.loadPlanters()
    //   .then()
    //   .catch();
  };

  logOut = () => {
    // console.log('log out in main');
    // this.props.onStateChange('signedOut');
    // try {
    //   this.props.plantyData.socket.close();
    // } catch (e) {
    //   console.log(e);
    // }
    // const { onStateChange } = this.props;
    Auth.signOut()
      .then(() => {
        this.props.cleanReduxState();
        this.props.onStateChange('signedOut');
        // this.props.cleanReduxState();
        this.props.navigation.goBack();
        // onStateChange('signedOut');
      })
      .catch(e => console.log(e));

    // this.state.userLoggedIn = !this.state.userLoggedIn;
    // this.state.user = null;
    // this.setState({userLoggedIn: false});
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
        <Card
          header={() => {
            return (
              <TouchableOpacity
                onPress={() => {
                  WS.init();
                  this.props.navigation.navigate('planterScreen', {
                    item: item,
                    user_token: this.state.USER_TOKEN,
                    loadPlanters: this.loadPlanters,
                  });
                }}>
                <Image
                  style={styles.headerImage}
                  source={require('../../assets/greenhouse.png')}
                />
              </TouchableOpacity>
            );
          }}
          style={{width: this.state.width / 3 - 5, margin: 1}}
          // style={{width: '100%'}}
          index={item.UUID}
          key={item.UUID}>
          <TouchableOpacity
            onPress={() => {
              WS.init();
              this.props.navigation.navigate('planterScreen', {
                item: item,
                user_token: this.state.USER_TOKEN,
                loadPlanters: this.loadPlanters,
              });
            }}>
            <Text style={styles.partyText}>{item.name}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  };

  render() {
    // console.log(this.props);
    // console.log(this.state.plants);
    // console.log(this.state.allPlanters);

    return (
      <View style={styles.container} onLayout={this.onLayout}>
        <StatusBar translucent barStyle="dark-content" />
        <PaperCard>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('UserPage', {
                user: this.state.user,
                logOut: this.logOut,
              })
            }>
            <PaperCard.Title
              title={'Welcome home,' + this.state.username}
              // subtitle="Card Subtitle"
              left={props => (
                // <Avatar.Icon
                //   {...props}
                //   style={{backgroundColor: plantyColor}}
                //   icon="account"
                // />
                <Avatar.Image
                  // style={{alignSelf: 'center', backgroundColor: 'lightgray'}}
                  {...props}
                  // size={200}
                  source={{uri: this.props.plantyData.avatarUrl}}
                />
              )}
            />
          </TouchableOpacity>
          <PaperCard.Content />
          <PaperCard.Cover
            source={require('../../assets/background_image.jpeg')}
          />
          <PaperCard.Actions />
        </PaperCard>
        {/*<Searchbar*/}
        {/*  placeholder="Search..."*/}
        {/*  onChangeText={query => {*/}
        {/*    // this.setState({query: query});*/}
        {/*    this.reloadPlants(query);*/}
        {/*  }}*/}
        {/*  value={this.state.query}*/}
        {/*/>*/}
        <View style={styles.header}>
          <Text style={styles.headerText}>My garden</Text>
        </View>

        <ScrollView style={styles.data}>
          <FlatList
            // vertical={false}
            // horizontal={true}
            scrollEnabled={false}
            numColumns={3}
            // style={{height: 400, margin: 5}}
            data={this.state.plants}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />
        </ScrollView>
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            backgroundColor: '#6f9e04',
            color: '#6f9e04',
            right: 0,
            bottom: 10,
          }}
          large
          icon="plus"
          onPress={() =>
            this.props.navigation.navigate('addPlanterScreen', {
              user_token: this.state.USER_TOKEN,
              user: this.state.user,
              loadPlanters: this.loadPlanters,
            })
          }
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
    fontSize: 20,
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
