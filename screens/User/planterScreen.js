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
import {Icon, Text, Card} from '@ui-kitten/components';
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
import AmplifyTheme from '../AmplifyTheme';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import Video from 'react-native-video';
import connect from 'react-redux/lib/connect/connect';
import {addCleaner, addUser} from '../../FriendActions';
import {bindActionCreators} from 'redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {Button} from 'react-native-paper';

const plantyColor = '#6f9e04';

class planterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      userLoggedIn: true,
      userEmail: '',
      username: '',
      width: 0,
      height: 0,
      // plants: [
      // ],
      plants: this.props.navigation.getParam('item').plants,
      parties: [],
      places: null,
      change: false,
      user: null,
      USER_TOKEN: '',
      userAvatar: '',

      myCognitoUser: null,
    };
    this.loadPlants = this.loadPlants.bind(this);
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.onLayout = this.onLayout.bind(this);
  }

  static navigationOptions = ({navigation}) => {
    const params = navigation.state.params || {};
    return {
      headerShown: navigation.getParam('userLoggedIn'),
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
      headerLeft: (
        <HeaderBackButton
          title="My Garden"
          onPress={() => {
            navigation.goBack();
          }}
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
    // plants.Items.map(plant => this.state.plants.push(plant))
    //   // this.setState({plants})
    // this.setState({change:false})
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

  async loadPlants() {
    let USER_TOKEN = '';

    USER_TOKEN = this.props.authData.signInUserSession.idToken.jwtToken;

    this.state.USER_TOKEN = USER_TOKEN;

    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    // await axios
    //   .get(Consts.apigatewayRoute + '/plants', {
    //     headers: {Authorization: AuthStr},
    //   })
    //   .then(response => {
    //     // If request is good...
    //     console.log(response.data);
    //     this.dealWithPlantsData(response.data);
    //   })
    //   .catch(error => {
    //     console.log('error ' + error);
    //   });
    await axios
      .post(
        Consts.apigatewayRoute + '/plants',
        {
          username: this.props.authData.username,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        // If request is good...
        // console.log(response.data);
        this.dealWithPlantsData(response.data);
      })
      .catch(error => {
        console.log('error ' + error);
      });

    // await axios.get('https://i7maox5n5g.execute-api.eu-west-1.amazonaws.com/test').then(res => {
    //   // this.dealWithUserData(res.data[0])
    //   console.log(res);
    // }).catch(error => console.log(error))
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
    this.loadPlants()
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
                  this.props.navigation.navigate('PlantScreen', {
                    item: item,
                    user_token: this.state.USER_TOKEN,
                  })
                }>
                <Image style={styles.headerImage} source={{uri: item.pic}} />
              </TouchableOpacity>
            );
          }}
          style={{width: this.state.width / 3 - 5}}
          index={item.id}
          key={item.id}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('PlantScreen', {
                item: item,
                user_token: this.state.USER_TOKEN,
              })
            }>
            {/*    <View>*/}
            {/*    <Image*/}
            {/*        style={styles.headerImage}*/}
            {/*        source={{uri: item.pic}}*/}
            {/*    />*/}
            {/*  </TouchableOpacity>*/}
            {/*  <TouchableOpacity*/}
            {/*      onPress={() => this.props.navigation.navigate('PlantScreen', {*/}
            {/*        item: item,*/}
            {/*      })}*/}
            {/*  >*/}
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
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Planter: {this.props.navigation.getParam('item').name}
            </Text>
          </View>
          {/*<Button*/}
          {/*  style={{margin: 5}}*/}
          {/*  mode="outlined"*/}
          {/*  backgroundColor="#6f9e04"*/}
          {/*  color="#6f9e04"*/}
          {/*  onPress={() =>*/}
          {/*    this.props.navigation.navigate('AdjustPlantConditions', {*/}
          {/*      user_token: this.state.USER_TOKEN,*/}
          {/*      item: this.props.navigation.getParam('item'),*/}
          {/*    })*/}
          {/*  }>*/}
          {/*  Adjust Conditions*/}
          {/*</Button>*/}
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
              // width: 50,

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
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              // width: 50,

              backgroundColor: '#6f9e04',
              color: '#6f9e04',
              left: 0,
              top: height - 193,
            }}
            label="Adjust Conditions"
            lage
            icon="pencil"
            onPress={() =>
              this.props.navigation.navigate('AdjustPlantConditions', {
                user_token: this.state.USER_TOKEN,
                item: this.props.navigation.getParam('item'),
              })
            }
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container} onLayout={this.onLayout}>
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

                backgroundColor: plantyColor,
                color: plantyColor,
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

planterScreen.propTypes = {
  navigation: PropTypes.any,
  addEvent: PropTypes.func,
};

// export default withAuthenticator(MainScreen, false, [
//   <SignIn />,
//   <ConfirmSignIn />,
//   <VerifyContact />,
//   <SignUp />,
//   <ConfirmSignUp />,
//   <ForgotPassword />,
//   <Greetings />,
//   <RequireNewPassword />,
// ]);

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
  withAuthenticator(planterScreen, false, [
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
    height: 100,
  },
});
