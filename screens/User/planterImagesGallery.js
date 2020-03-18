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
import Amplify, {Storage} from 'aws-amplify';
import PropTypes from 'prop-types';
import {Icon, Text, Card, Button} from '@ui-kitten/components';
import {
  ActivityIndicator,
  FAB,
  Card as PaperCard,
  IconButton,
  Title,
  Paragraph,
} from 'react-native-paper';
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
      // USER_TOKEN: this.props.navigation.getParam('user_token'),
      // planterToAddTo: this.props.navigation.getParam('planterName'),
    };
    // this.loadPlants = this.loadPlants.bind(this);
    // this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    // this.dealWithData = this.dealWithData.bind(this);
    // this.fetchUser = this.fetchUser.bind(this);
    this.onLayout = this.onLayout.bind(this);
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
    // let allImages = ['mint', 'potato', 'sunflower', 'tomato', 'cucumber'];
    let new_img_array = [];
    await images_array.map(oneImage => {
      Storage.get(oneImage.key, {
        level: 'public',
        type: 'image/jpg',
      })
        .then(data => {
          // console.log(data);
          // new_img_array.push({
          //   UUID: oneImage.eTag,
          //   url: data,
          //   lastModified: oneImage.lastModified,
          //   size: oneImage.size,
          // });
          let obj = {
            UUID: oneImage.eTag,
            url: data,
            lastModified: oneImage.lastModified,
            size: oneImage.size,
            key: oneImage.key,
          };
          // this.props.addImage({name: oneImage, URL: data});
          // this.setState({url: data});
          // this.props.AddAvatarLink(data);
          // this.setState({buttonMode: 'pick'});
          // console.log(obj);
          this.setState(prevState => ({
            pictures: [...prevState.pictures, obj],
          }));

          // this.setState({pictures: [...this.state.pictures, obj]});
        })
        .catch(error => console.log(error));
      // console.log(new_img_array);
      // console.log(this.state.pictures);
      // this.setState({images: new_img_array});
    });
  }

  componentDidMount(): void {
    // let USER_TOKEN = this.props.plantyData.myCognitoUser.username;

    let bucketUrl =
      this.props.plantyData.myCognitoUser.username +
      '/' +
      this.state.planter.name;

    Storage.list(bucketUrl, {level: 'public'})
      .then(result => {
        // console.log(result);
        let res_arr = [];
        result.map(one => {
          if (one.key === bucketUrl + '/') {
          } else res_arr.push(one);
        });
        this.preloadImages(res_arr)
          .then(r => console.log())
          .catch(error => console.log(error));
        // this.setState({pictures: res_arr});
      })
      .catch(err => console.log(err));

    // this.setState({userName: 'Guest'});

    // this.preloadImages()
    //   .then()
    //   .catch(e => console.log(e));
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

  _keyExtractor = item => item.UUID;

  _renderItem = ({item}) => {
    let url = '';
    // console.log(item.name);
    // for (let i = 0; i < this.props.plantyData.plantsImages.length; i++) {
    //   if (
    //     this.props.plantyData.plantsImages[i].name.toLowerCase() ===
    //     item.name.toLowerCase()
    //   ) {
    //     url = this.props.plantyData.plantsImages[i].URL;
    //   }
    // console.log(this.props.plantyData.plantsImages[i].name);
    // }
    // console.log(url);
    // item.pic = url;

    // console.log(item);
    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate('Picture', {
            picture: item,
            planterName: this.state.planter.name,
            // user_token: this.state.USER_TOKEN,
          })
        }
        style={{width: this.state.width / 2 - 4}}
        index={item.UUID}
        key={item.UUID}>
        <PaperCard>
          <PaperCard.Cover style={{padding: 1}} source={{uri: item.url}} />
        </PaperCard>
      </TouchableOpacity>
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

// export default withAuthenticator(AllAvailablePlants, false, [
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
  const {plantyData} = state;

  return {plantyData};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addUser,
      // fetchAllPosts,
      // addSocket,
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
    margin: 1,
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
