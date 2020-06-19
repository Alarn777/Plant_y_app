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

import {Storage} from 'aws-amplify';
import PropTypes from 'prop-types';

import {
  ActivityIndicator,
  Card as PaperCard,
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
import Consts from '../../ENV_VARS';
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink, addImage, addUser} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
import axios from 'axios';
import {Logger} from '../../Logger';
const plantyColor = '#6f9e04';

class planterImagesGallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      planter: this.props.navigation.getParam('planter'),
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      user: null,
      pictures: [],
      picWasRemoved: false,
    };
    this.onLayout = this.onLayout.bind(this);
  }

  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS,
  ): void {
    if (this.props.navigation.getParam('picWasRemoved')) {
      this.listPicturesData()
        .then()
        .catch(e => {
          Logger.saveLogs(
            this.props.plantyData.myCognitoUser.username,
            e.toString(),
            'planterImagesGallery - didmount',
          );
          console.log(e);
        });
      this.props.navigation.setParams({picWasRemoved: false});
    }
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

  async preloadImages(images_array) {
    await images_array.map(oneImage => {
      Storage.get(oneImage.image_key, {
        level: 'public',
        type: 'image/jpg',
      })
        .then(data => {
          let date = new Date(oneImage.timestamp * 1e3)
            .toISOString()
            .replace(/-/g, '/')
            .replace(/T/g, ' ')
            .replace(/Z/g, '')
            .slice(0, 19);

          let obj = {
            UUID: oneImage.UUID,
            url: data,
            timestamp: date,
            timestamp_seconds: oneImage.timestamp,
            UV: oneImage.UV,
            temperature: oneImage.temperature,
            humidity: oneImage.humidity,
            key: oneImage.image_key,
          };
          this.setState(prevState => ({
            pictures: [...prevState.pictures, obj],
          }));
        })
        .catch(e => {
          Logger.saveLogs(
            this.props.plantyData.myCognitoUser.username,
            e.toString(),
            'preloadImages - gallery',
          );
          console.log(e);
        });
    });
  }

  componentDidMount(): void {
    this.listPicturesData()
      .then()
      .catch();
    this.props.navigation.setParams({
      headerColor:
        this.props.plantyData.theme === 'light' ? 'white' : '#263238',
    });
  }

  async listPicturesData() {
    this.setState({pictures: []});

    //dynamoDB
    let USER_TOKEN = this.props.authData.signInUserSession.idToken.jwtToken;

    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/getPlanterPictures',
        {
          username: this.props.authData.username,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.dealWithPicsData(response.data.Items);
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'listPicturesData - gallery',
        );
        console.log(e);
      });
  }

  dealWithPicsData = pic_array => {
    let sorted_array = [];
    pic_array.map(one => {
      let planterName = one.image_key.split('/')[1];
      if (planterName === this.state.planter.name) {
        sorted_array.push(one);
      }
    });

    this.preloadImages(sorted_array)
      .then()
      .catch(error => console.log(error));
  };

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

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }

  _keyExtractor = item => item.UUID;

  _renderItem = ({item}) => {
    if (!item.key.endsWith('.jpg') && !item.key.endsWith('.JPG')) {
      return;
    }

    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate('Picture', {
            picture: item,
            planterName: this.state.planter.name,
          })
        }
        index={item.UUID}
        key={item.UUID}>
        <PaperCard
          style={{
            width: this.state.width / 2 - 5,
            height: 200,
            margin: 2,
            borderRadius: 3,
          }}>
          <Image
            style={{
              width: this.state.width / 2 - 14,
              height: 190,
              margin: 5,
              borderRadius: 3,
            }}
            source={{uri: item.url}}
          />
        </PaperCard>
      </TouchableOpacity>
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
      <View
        style={{
          flex: 1,
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
          position: 'relative',
        }}
        onLayout={this.onLayout}>
        <PaperCard>
          <View style={{}}>
            <PaperCard.Title
              title={'Your Image Gallery'}
              subtitle={
                'Planter:' + this.props.navigation.getParam('planter').name
              }
              right={props => (
                <IconButton
                  icon={require('../../assets/icons/camera-outline.png')}
                  color={plantyColor}
                  size={40}
                  onPress={() =>
                    this.props.navigation.navigate('AITesting', {
                      planter: this.state.planter,
                    })
                  }
                />
              )}
            />
          </View>
        </PaperCard>
        <ScrollView style={styles.data}>
          {this.state.pictures.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={plantyColor}
              style={{
                marginTop: 5,
                alignItems: 'center',
                marginLeft: this.state.width / 2 - 30,
              }}
            />
          ) : (
            <FlatList
              numColumns={2}
              data={this.state.pictures}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
          )}
        </ScrollView>
        <Image
          style={{position: 'absolute', bottom: -1, zIndex: -10}}
          source={require('../../assets/grass.png')}
        />
      </View>
    );
  }
}

planterImagesGallery.propTypes = {
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
  withAuthenticator(planterImagesGallery, false, [
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
    margin: 1,
    flexDirection: 'row',
  },
  headerImage: {
    flex: 1,
    height: 100,
  },
});
