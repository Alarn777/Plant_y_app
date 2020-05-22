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
import Consts from '../../ENV_VARS';
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink, addImage, addUser} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
import axios from 'axios';
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
        .catch();
      this.props.navigation.setParams({picWasRemoved: false});
    }
  }

  async preloadImages(images_array) {
    console.log('Now loading images');
    // console.log(images_array);
    await images_array.map(oneImage => {
      // console.log(oneImage);
      // if (oneImage.image_key.endsWith('/')) return;

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
          console.log(obj);

          this.setState(prevState => ({
            pictures: [...prevState.pictures, obj],
          }));
        })
        .catch(error => console.log(error));
    });

    // await images_array.map(oneImage => {
    //   if (oneImage.key.endsWith('/')) return;
    //
    //   Storage.get(oneImage.key, {
    //     level: 'public',
    //     type: 'image/jpg',
    //   })
    //     .then(data => {
    //       let obj = {
    //         UUID: oneImage.eTag,
    //         url: data,
    //         lastModified: oneImage.lastModified,
    //         size: oneImage.size,
    //         key: oneImage.key,
    //       };
    //       console.log(obj);
    //
    //       this.setState(prevState => ({
    //         pictures: [...prevState.pictures, obj],
    //       }));
    //     })
    //     .catch(error => console.log(error));
    // });
  }

  componentDidMount(): void {
    this.listPicturesData()
      .then()
      .catch();
  }

  async listPicturesData() {
    this.setState({pictures: []});

    // let bucketUrl =
    //   this.props.plantyData.myCognitoUser.username +
    //   '/' +
    //   this.state.planter.name;
    //
    // Storage.list(bucketUrl, {level: 'public'})
    //   .then(result => {
    //     let res_arr = [];
    //     result.map(one => {
    //       if (one.key === bucketUrl + '/') {
    //       } else res_arr.push(one);
    //     });
    //     this.preloadImages(res_arr)
    //       .then(r => console.log())
    //       .catch(error => console.log(error));
    //   })
    //   .catch(err => console.log(err));

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
        // console.log(response.data.Items);
        this.dealWithPicsData(response.data.Items);
        // this.setState({pictures:response.data.Items})
      })
      .catch(error => {
        console.log('error ' + error);
      });
  }

  dealWithPicsData = pic_array => {
    let sorted_array = [];
    pic_array.map(one => {
      console.log(one);
      let planterName = one.image_key.split('/')[1];
      if (planterName === this.state.planter.name) {
        sorted_array.push(one);
      }
    });

    this.preloadImages(sorted_array)
      .then(r => console.log())
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
        <PaperCard>
          <Image
            style={{width: this.state.width / 2 - 11, height: 200, margin: 5}}
            source={{uri: item.url}}
          />
        </PaperCard>
      </TouchableOpacity>
    );

    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate('Picture', {
            picture: item,
            planterName: this.state.planter.name,
          })
        }
        style={{width: this.state.width / 2, backgroundColor: 'red'}}
        index={item.UUID}
        key={item.UUID}>
        <Image height={100} width={100} source={{uri: item.url}} />
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
      <View style={styles.container} onLayout={this.onLayout}>
        <PaperCard>
          <View style={{}}>
            <PaperCard.Title
              title={'Your Image Gallery'}
              subtitle={
                'Planter:' + this.props.navigation.getParam('planter').name
              }
            />
          </View>
        </PaperCard>
        <ScrollView style={styles.data}>
          <FlatList
            numColumns={2}
            data={this.state.pictures}
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
    margin: 1,
    flexDirection: 'row',
  },
  headerImage: {
    flex: 1,
    height: 100,
  },
});
