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
  FAB,
  Card as PaperCard,
  IconButton,
  Title,
  Paragraph,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialIcons';

import {withAuthenticator, Loading} from 'aws-amplify-react-native';
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
import {bindActionCreators} from 'redux';
import {AddAvatarLink, addImage, addUser} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
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

  async preloadImages(images_array) {
    console.log('Now loading images');
    console.log(images_array);

    await images_array.map(oneImage => {
      Storage.get(oneImage.key, {
        level: 'public',
        type: 'image/jpg',
      })
        .then(data => {
          let obj = {
            UUID: oneImage.eTag,
            url: data,
            lastModified: oneImage.lastModified,
            size: oneImage.size,
            key: oneImage.key,
          };

          this.setState(prevState => ({
            pictures: [...prevState.pictures, obj],
          }));
        })
        .catch(error => console.log(error));
    });
  }

  componentDidMount(): void {
    this.listPicturesData()
      .then()
      .catch();
  }

  async listPicturesData() {
    this.setState({pictures: []});

    let bucketUrl =
      this.props.plantyData.myCognitoUser.username +
      '/' +
      this.state.planter.name;

    Storage.list(bucketUrl, {level: 'public'})
      .then(result => {
        let res_arr = [];
        result.map(one => {
          if (one.key === bucketUrl + '/') {
          } else res_arr.push(one);
        });
        this.preloadImages(res_arr)
          .then(r => console.log())
          .catch(error => console.log(error));
      })
      .catch(err => console.log(err));
  }

  static navigationOptions = ({navigation, screenProps}) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: (
        <Image
          resizeMode="contain"
          // style={{height: 40, width: 40}}
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
        // style={{width: this.state.width / 2, backgroundColor: 'red'}}
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
        {/*<PaperCard style={{width: this.state.width, height: 200}}>*/}
        {/*<Image height={100} width={100} source={{uri: item.url}} />*/}
        {/*<PaperCard.Cover style={{padding: 1}} source={{uri: item.url}} />*/}
        {/*</PaperCard>*/}
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
