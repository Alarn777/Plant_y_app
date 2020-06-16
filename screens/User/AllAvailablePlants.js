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
import {Auth, Storage} from 'aws-amplify';

import PropTypes from 'prop-types';
import {Text, Card} from '@ui-kitten/components';
import {ActivityIndicator, Card as PaperCard} from 'react-native-paper';

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
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink, addImage, addUser} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
import {Logger} from '../../Logger';
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
      picArray: [],
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
        this.dealWithPlantsData(response.data);
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'getAllAvailablePlants',
        );
        console.log(e);
      });
  }

  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS,
  ): void {
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
    const {authState, authData} = this.props;
    const user = authData;
    if (user) {
      const {usernameAttributes = []} = this.props;
      if (usernameAttributes === 'email') {
        this.setState({
          userName: user.attributes ? user.attributes.email : user.username,
        });
      }
    } else this.setState({userName: 'Guest'});

    this.loadPlants()
      .then()
      .catch(e => console.log(e));

    this.preloadImages();
    this.props.navigation.setParams({
      headerColor:
        this.props.plantyData.theme === 'light' ? 'white' : '#263238',
    });
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
    let allImages = [
      'mint',
      'potato',
      'soy',
      'sunflower',
      'tomato',
      'cucumber',
      'strawberry',
      'basil',
      'pepper',
      'oregano',
      'melissa',
    ];

    allImages.map(oneImage => {
      Storage.get(oneImage + '_img.jpg', {
        level: 'public',
        type: 'image/jpg',
      })
        .then(data => {
          this.state.picArray.push({name: oneImage, URL: data});
        })
        .catch(e => {
          Logger.saveLogs(
            this.props.plantyData.myCognitoUser.username,
            e.toString(),
            'preloadImages',
          );
          console.log(e);
        });
    });
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

    for (let i = 0; i < this.state.picArray.length; i++) {
      if (
        this.state.picArray[i].name.toLowerCase() === item.name.toLowerCase()
      ) {
        url = this.state.picArray[i].URL;
      }
    }

    item.pic = url;
    return (
      <View>
        <PaperCard
          onPress={() =>
            this.props.navigation.navigate('AddPlantScreen', {
              item: item,
              user_token: this.state.USER_TOKEN,
              planterName: this.props.navigation.getParam('planterName'),
            })
          }
          style={{width: this.state.width / 3 - 10, margin: 5, borderRadius: 5}}
          index={item.UUID}
          key={item.UUID}>
          <Image style={styles.headerImage} source={{uri: url}} />
          <Text style={styles.partyText}>{item.name}</Text>
        </PaperCard>
      </View>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <View
          style={{
            height: this.state.height,
            backgroundColor:
              this.props.plantyData.theme === 'light' ? 'white' : '#263238',
          }}>
          <ActivityIndicator
            size="large"
            color={plantyColor}
            style={{top: this.state.height / 2 - 50}}
          />
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#263238',
          position: 'relative',
        }}
        onLayout={this.onLayout}>
        <View style={styles.header}>
          <Text
            style={{
              height: 50,
              fontSize: 20,
              fontWeight: 'bold',
              padding: 10,
              marginBottom: 10,
              marginTop: 20,
              color:
                this.props.plantyData.theme === 'light'
                  ? '#263238'
                  : plantyColor,
            }}>
            All Available Plants
          </Text>
        </View>
        <ScrollView style={styles.data}>
          <FlatList
            numColumns={3}
            data={this.state.plants}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />
        </ScrollView>
        <Image
          style={{position: 'absolute', bottom: -1, zIndex: -10}}
          source={require('../../assets/grass.png')}
        />
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
    height: 50,
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    marginBottom: 10,
    marginTop: 20,
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
    padding: 5,
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
    borderRadius: 5,
  },
});
