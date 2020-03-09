import React from 'react';
import {
  Image,
  View,
  FlatList,
  ScrollView,
  Dimensions,
  TouchableOpacity,
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
import {addCleaner, addUser} from '../../FriendActions';
import {bindActionCreators} from 'redux';
// import {idPattern} from 'react-native-svg/\lib/typescript/lib/util';

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
    };
    this.loadPlanters = this.loadPlanters.bind(this);
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.onLayout = this.onLayout.bind(this);
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
      headerRight: () => (
        <Button
          onPress={navigation.getParam('logOut')}
          title="Info"
          // color="#fff"
          appearance="ghost"
          style={{color: plantyColor}}
          icon={style => {
            return <Icon {...style} name="log-out-outline" />;
          }}
          status="basic"
        />
      ),
    };
  };

  dealWithData = user => {
    //add to redux

    this.setState({user});
    if (this.state.user) this.setState({userLoggedIn: true});
  };
  dealWithPlantsData = plants => {
    if (plants.Items) {
      this.setState({plants: plants.Items});
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
    let USER_TOKEN = '';

    USER_TOKEN = this.props.authData.signInUserSession.idToken.jwtToken;

    this.state.USER_TOKEN = USER_TOKEN;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
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
        console.log(response.data);
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
  ): void {}

  componentWillMount() {
    this.fetchUser()
      .then(() => {
        this.props.navigation.setParams({logOut: this.logOut});

        this.props.navigation.setParams({
          userLoggedIn: this.state.userLoggedIn,
        });
      })
      .catch(e => console.log(e));
  }

  componentDidMount(): void {
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

    this.props.addUser(user);
    console.log(this); //check reducer
  }

  logOut = () => {
    // const { onStateChange } = this.props;
    Auth.signOut()
      .then(() => {
        this.props.onStateChange('signedOut');
        // onStateChange('signedOut');
      })
      .catch(e => console.log(e));

    this.state.userLoggedIn = !this.state.userLoggedIn;
    this.state.user = null;
    this.setState({userLoggedIn: false});
  };

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }

  _keyExtractor = item => item.id;

  _renderItem = ({item}) => {
    return (
      <View>
        <Card
          header={() => {
            return (
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('planterScreen', {
                    item: item,
                    user_token: this.state.USER_TOKEN,
                  })
                }>
                <Image
                  style={styles.headerImage}
                  source={require('../../assets/pot.png')}
                />
              </TouchableOpacity>
            );
          }}
          style={{width: this.state.width / 3 - 5}}
          index={item.UUID}
          key={item.UUID}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('planterScreen', {
                item: item,
                user_token: this.state.USER_TOKEN,
              })
            }>
            <Text style={styles.partyText}>{item.name}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  };

  render() {
    let height = this.state.height;
    console.log(this.props);
    if (this.state.plants.length > 0) {
      return (
        <View style={styles.container} onLayout={this.onLayout}>
          <PaperCard>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate('UserPage', {
                  user: this.state.user,
                })
              }>
              <PaperCard.Title
                title={'Welcome home,' + this.state.username}
                // subtitle="Card Subtitle"
                left={props => (
                  <Avatar.Icon
                    {...props}
                    style={{backgroundColor: plantyColor}}
                    icon="account"
                  />
                )}
              />
            </TouchableOpacity>
            <PaperCard.Content />
            <PaperCard.Cover
              source={{
                uri:
                  'https://lh3.googleusercontent.com/proxy/PoGeIblQn392nWEhprouNyYclQo5K1D7FzmTiiEqes1iTpOgvurxMyVV1xxu1yWw7qTqUQP-pS8XxSPsx3g9uIkM_3CM1HxVcoUJUy7NnmAK31FF8w',
              }}
            />
            <PaperCard.Actions>
              {/*<Button>Cancel</Button>*/}
              {/*<Button>Ok</Button>*/}
            </PaperCard.Actions>
          </PaperCard>
          <View style={styles.header}>
            <Text style={styles.headerText}>My garden</Text>
          </View>
          <ScrollView style={styles.data}>
            <FlatList
              vertical={true}
              scrollEnabled={false}
              numColumns={3}
              style={{width: this.state.width, margin: 5}}
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
              top: height - 200,
            }}
            large
            icon="plus"
            onPress={() =>
              this.props.navigation.navigate('AllAvailablePlants', {
                user_token: this.state.USER_TOKEN,
              })
            }
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container} onLayout={this.onLayout}>
          <PaperCard>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate('UserPage', {
                  user: this.state.user,
                })
              }>
              <PaperCard.Title
                title={'Welcome home,' + this.state.username}
                // subtitle="Card Subtitle"
                left={props => (
                  <Avatar.Icon
                    {...props}
                    style={{backgroundColor: plantyColor}}
                    icon="account"
                  />
                )}
              />
            </TouchableOpacity>
            <PaperCard.Content />
            <PaperCard.Cover
              source={{
                uri:
                  'https://lh3.googleusercontent.com/proxy/PoGeIblQn392nWEhprouNyYclQo5K1D7FzmTiiEqes1iTpOgvurxMyVV1xxu1yWw7qTqUQP-pS8XxSPsx3g9uIkM_3CM1HxVcoUJUy7NnmAK31FF8w',
              }}
            />
            <PaperCard.Actions>
              {/*<Button>Cancel</Button>*/}
              {/*<Button>Ok</Button>*/}
            </PaperCard.Actions>
          </PaperCard>
          <View style={styles.header}>
            <Text style={styles.headerText}>My garden</Text>
          </View>
          <ScrollView style={styles.data}>
            {/*<FlatList*/}
            {/*  vertical={true}*/}
            {/*  scrollEnabled={false}*/}
            {/*  numColumns={3}*/}
            {/*  style={{width: this.state.width, margin: 5}}*/}
            {/*  data={this.state.plants}*/}
            {/*  keyExtractor={this._keyExtractor}*/}
            {/*  renderItem={this._renderItem}*/}
            {/*/>*/}
            <Text style={{alignSelf: 'center', flex: 1}}>
              No Plants in your garden
            </Text>
          </ScrollView>
          <FAB
            style={
              //styles.fab
              {
                position: 'absolute',
                margin: 16,
                // width: 50,

                backgroundColor: '#6f9e04',
                color: '#6f9e04',
                right: 0,
                top: height - 200,
              }
            }
            large
            icon="plus"
            onPress={() =>
              this.props.navigation.navigate('AllAvailablePlants', {
                user_token: this.state.USER_TOKEN,
              })
            }
          />
        </View>

        // <Text style={{flex: 1}}>No Plants in your garden</Text>
        // <ActivityIndicator
        //   style={{flex: 1}}
        //   animating={true}
        //   color={'#6f9e04'}
        // />
      );
    }
  }
}

MainScreen.propTypes = {
  navigation: PropTypes.any,
  addEvent: PropTypes.func,
};

const mapStateToProps = state => {
  const {plantyData, cleaners, events, socket, myCognitoUsers} = state;

  return {plantyData, cleaners, events, socket, myCognitoUsers};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addUser,
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
});
