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
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
import AmplifyTheme from '../AmplifyTheme';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {HeaderBackButton} from 'react-navigation-stack';
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
    // console.log(plants.Items);
    // this.setState({loading: false});
    this.setState({loading: false, plants: plants.Items});
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
        console.log(response.data);
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

  UNSAFE_componentWillMount() {
    // this.fetchUser()
    //   .then(() => {
    //     this.props.navigation.setParams({logOut: this.logOut});
    //
    //     this.props.navigation.setParams({
    //       userLoggedIn: this.state.userLoggedIn,
    //     });
    //   })
    //   .catch(e => console.log(e));
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
      // headerShown: navigation.getParam('userLoggedIn'),
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
                <Image style={styles.headerImage} source={{uri: item.pic}} />
              </TouchableOpacity>
            );
          }}
          style={{width: this.state.width / 3 - 5}}
          index={item.id}
          key={item.id}>
          <TouchableOpacity
            onPress={() => {
              console.log(this.props.navigation);
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
        // <View>
        <ActivityIndicator
          // style={{flex: 1}}
          size="large"
          color={plantyColor}
          style={{top: this.state.height / 2 - 50}}
        />
        // </View>
      );
    }

    let height = this.state.height;
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

export default withAuthenticator(AllAvailablePlants, false, [
  <SignIn />,
  <ConfirmSignIn />,
  <VerifyContact />,
  <SignUp />,
  <ConfirmSignUp />,
  <ForgotPassword />,
  <Greetings />,
  <RequireNewPassword />,
]);

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
    // backgroundColor: '#66ffcc',
    // height: '10%',
    // borderRadius:5
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
  // fab: {
  //   position: 'absolute',
  //   margin: 16,
  //   right: 0,
  //   top: this.state.height,
  //   bottom: 0,
  //   alignSelf: 'flex-end',
  // },
});
