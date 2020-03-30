import React from 'react';
import {
  Image,
  View,
  FlatList,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Auth} from 'aws-amplify';

import PropTypes from 'prop-types';
import {Icon, Text, Card, Button} from '@ui-kitten/components';
import {ActivityIndicator, FAB} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialIcons';
import {
  withAuthenticator,
  //Greetings,
  Loading,
} from 'aws-amplify-react-native';
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
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink, addImage, addUser} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
const plantyColor = '#6f9e04';

class AllAvailablePlants extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      userLoggedIn: true,
      userEmail: '',
      userName: '',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      plants: [],
      parties: [],
      loading: false,
      change: false,
      user: null,
      USER_TOKEN: this.props.navigation.getParam('user_token'),
      planterToAddTo: this.props.navigation.getParam('planterName'),
    };
    this.loadPlants = this.loadPlants.bind(this);
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.onLayout = this.onLayout.bind(this);
  }

  dealWithData = user => {
    this.setState({user});
    if (this.state.user) this.setState({userLoggedIn: true});
  };

  dealWithPlantsData = plants => {
    this.setState({loading: false, plants: plants.Items});
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
    this.setState({loading: true});
    USER_TOKEN = this.props.authData.signInUserSession.idToken.jwtToken;

    this.state.USER_TOKEN = USER_TOKEN;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios
      .get(Consts.apigatewayRoute + '/getAllAvailablePlants', {
        headers: {Authorization: AuthStr},
      })
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

  componentDidMount(): void {
    const {authState, authData} = this.props;
    const user = authData;
    if (user) {
      const {usernameAttributes = []} = this.props;
      if (usernameAttributes === 'email') {
        // Email as Username
        this.setState({
          userName: user.attributes ? user.attributes.email : user.username,
        });
      }
    } else this.setState({userName: 'Guest'});

    this.loadPlants()
      .then()
      .catch(e => console.log(e));
  }

  static navigationOptions = ({navigation, screenProps}) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: (
        <Image
          resizeMode="contain"
          style={{height: 40, width: 40}}
          source={require('../../assets/logo.png')}
        />
      ),
      headerLeft: (
        <HeaderBackButton
          onPress={() => {
            navigation.goBack();
          }}
        />
      ),

      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
      },
    };
  };

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }

  _keyExtractor = item => item.id;

  _renderItem = ({item}) => {
    let url = '';
    // console.log(item.name);

    for (let i = 0; i < this.props.plantyData.plantsImages.length; i++) {
      if (
        this.props.plantyData.plantsImages[i].name.toLowerCase() ===
        item.name.toLowerCase()
      ) {
        url = this.props.plantyData.plantsImages[i].URL;
      }
    }
    item.pic = url;

    return (
      <View>
        <Card
          header={() => {
            return (
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('AddPlantScreen', {
                    item: item,
                    user_token: this.state.USER_TOKEN,
                    planterName: this.props.navigation.getParam('planterName'),
                  })
                }>
                <Image style={styles.headerImage} source={{uri: url}} />
              </TouchableOpacity>
            );
          }}
          style={{width: this.state.width / 3 - 5}}
          index={item.UUID}
          key={item.UUID}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('AddPlantScreen', {
                item: item,
                user_token: this.state.USER_TOKEN,
                loadPlanters: this.props.navigation.getParam('loadPlanters'),
                planterName: this.props.navigation.getParam('planterName'),
              });
            }}>
            <Text style={styles.partyText}>{item.name}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <ActivityIndicator
          size="large"
          color={plantyColor}
          style={{top: this.state.height / 2 - 50}}
        />
      );
    }

    return (
      <View style={styles.container} onLayout={this.onLayout}>
        <View style={styles.header}>
          <Text style={styles.headerText}>All Available Plants</Text>
        </View>
        <ScrollView style={styles.data}>
          <FlatList
            numColumns={3}
            style={{width: this.state.width, margin: 5}}
            data={this.state.plants}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />
        </ScrollView>
      </View>
    );
  }
}

AllAvailablePlants.propTypes = {
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
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  withAuthenticator(AllAvailablePlants, false, [
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
    // margin: 5,
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
