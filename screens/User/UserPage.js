/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {Provider} from 'react-redux';
import {bindActionCreators, createStore} from 'redux';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator, HeaderBackButton} from 'react-navigation-stack';
import {Image, Text, TouchableOpacity, View, Dimensions} from 'react-native';
import {Auth} from 'aws-amplify';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';
import {
  Avatar,
  Card as PaperCard,
  Card,
  Button,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';
import {Icon} from '@ui-kitten/components';
import socketIO from 'socket.io-client';
import ImagePicker from 'react-native-image-picker';
// import RNFetchBlob from 'react-native-fetch-blob';
import Consts from '../../ENV_VARS';
import {Notifications} from 'react-native-notifications';
import Amplify, {Storage} from 'aws-amplify';
import {getWSService} from '../websocket';
// global.Buffer = global.Buffer || require('buffer').Buffer;
import Buffer from 'buffer';
import connect from 'react-redux/lib/connect/connect';
import {AddAvatarLink, addSocket, cleanReduxState} from '../../FriendActions';
import ImageResizer from 'react-native-image-resizer';
// li RNFS = require('react-native-fs');
import RNFS from 'react-native-fs';

const plantyColor = '#6f9e04';

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.navigation.getParam('user'),
      USER_TOKEN: '',
      url: this.props.plantyData.avatarUrl,
      fileName: '',

      filePath: null,
      fileData: null,
      fileUri: '',
      fileUrl: '',
      buttonMode: 'pick', //pick,upload
    };
  }

  componentDidMount(): void {
    // console.log(this.props.plantyData.avatarUrl);
    // let a = this.props.navigation.getParam('logOut');
    // // console.log(a);
    // console.log('didmount');
    // Storage.get('Test_avatar.jpg', {
    //   level: 'public',
    //   type: 'image/jpg',
    // })
    //   .then(data => {
    //     console.log(data);
    //     // this.setState({url: data});
    //     // this.props.AddAvatarLink(data);
    //     // this.setState({buttonMode: 'pick'});
    //   })
    //   .catch(error => console.log(error));
    // let userAvatarKey = this.state.user.username + '_avatar.jpg';
    //
    // Storage.get(userAvatarKey, {
    //   level: 'public',
    //   type: 'image/jpg',
    //   // bucket: 'plant-pictures-planty',
    //   // region: 'eu',
    // })
    //   .then(data => {
    //     // console.log(data);
    //     this.setState({url: data});
    //   })
    //   .catch(error => console.log(error));
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

  renderAvatarButton = () => {
    if (this.state.buttonMode === 'pick') {
      return (
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            // width: 50,

            backgroundColor: '#6f9e04',
            color: '#6f9e04',
            right: 120,
            // top: height - 200,
            bottom: -10,
          }}
          large
          icon="pencil"
          onPress={() => {
            this.launchCamera();
          }}
        />
      );
    }
    if (this.state.buttonMode === 'upload') {
      return (
        <View>
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              // width: 50,

              backgroundColor: '#6f9e04',
              color: '#6f9e04',
              right: 120,
              // top: height - 200,
              bottom: -10,
            }}
            large
            icon="cloud-upload-outline"
            onPress={() => {
              this.resize();
              // this.uploadImage();
            }}
          />
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              // width: 50,

              backgroundColor: '#6f9e04',
              color: '#6f9e04',
              left: 120,
              // top: height - 200,
              bottom: -10,
            }}
            large
            icon="close"
            onPress={() => {
              this.setState({
                filePath: null,
                fileData: null,
                fileUri: '',
                buttonMode: 'pick',
                url: this.props.plantyData.avatarUrl,
              });
            }}
          />
        </View>
      );
    }
    if (this.state.buttonMode === 'loading') {
      return (
        <ActivityIndicator
          // style={{flex: 1}}
          size="huge"
          color={plantyColor}
          style={{position: 'relative', top: -140}}
        />
      );
    }
  };

  launchCamera = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchCamera(options, response => {
      // console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        this.setState({
          filePath: response,
          fileData: response.data,
          fileUri: response.uri,
          buttonMode: 'upload',
          url: response.uri, //showPic
        });
      }
    });
  };

  resize = () => {
    ImageResizer.createResizedImage(this.state.fileUri, 500, 500, 'JPEG', 100)
      .then(({uri}) => {
        this.setState({
          fileUri: uri,
        });
        this.uploadImage();
      })
      .catch(err => {
        console.log(err);
      });
  };

  uploadImage = () => {
    this.setState({buttonMode: 'loading'});

    RNFS.readFile(this.state.fileUri, 'base64')
      .then(fileData => {
        // console.log(fileData);
        const bufferedImageData = new Buffer.Buffer(fileData, 'base64');

        let userAvatarKey =
          'user_avatars/' + this.state.user.username + '_avatar.jpeg';

        // console.log(userAvatarKey);

        Storage.put(userAvatarKey, bufferedImageData, {
          contentType: 'image/jpg',
          level: 'public',
        })
          .then(result => {
            Storage.get(userAvatarKey, {
              level: 'public',
              type: 'image/jpeg',
            })
              .then(data => {
                // console.log(data);
                // this.setState({url: data});
                this.props.AddAvatarLink(data);
                this.setState({buttonMode: 'pick'});
              })
              .catch(error => console.log(error));
          })
          .catch(err => console.log(err));
      })
      .catch(error => console.log(error));

    // const bufferedImageData = new Buffer.Buffer(this.state.fileData, 'base64');
    //
    // let userAvatarKey = this.state.user.username + '_avatar.jpg';
    // Storage.put(userAvatarKey, bufferedImageData, {
    //   contentType: 'image/jpg',
    //   level: 'public',
    // })
    //   .then(result => {
    //     Storage.get(userAvatarKey, {
    //       level: 'public',
    //       type: 'image/jpg',
    //     })
    //       .then(data => {
    //         // console.log(data);
    //         // this.setState({url: data});
    //         this.props.AddAvatarLink(data);
    //         this.setState({buttonMode: 'pick'});
    //       })
    //       .catch(error => console.log(error));
    //   })
    //   .catch(err => console.log(err));
  };

  loadTestImg = () => {
    Storage.get('test/plant.JPG', {
      level: 'public',
      type: 'image/jpg',
    })
      .then(data => {
        console.log(data);
        // this.setState({testImgUrl: data});
      })
      .catch(error => console.log(error));
  };

  render() {
    // console.log(this.state.user);
    return (
      <View>
        <Card>
          <PaperCard.Title
            title={'Username: ' + this.state.user.username}
            subtitle={'Email: ' + this.state.user.attributes.email}
          />

          <Avatar.Image
            style={{
              alignSelf: 'center',
              backgroundColor: 'lightgray',
              margin: 20,
            }}
            size={200}
            source={{uri: this.state.url}}
          />
          {this.renderAvatarButton()}
        </Card>
        <Card>
          <LineChart
            data={{
              labels: ['January', 'February', 'March', 'April', 'May', 'June'],
              datasets: [
                {
                  data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                  ],
                },
              ],
            }}
            width={Dimensions.get('window').width} // from react-native
            height={210}
            yAxisLabel="$"
            yAxisSuffix="k"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              // backgroundColor: '#e26a00',
              // backgroundGradientFrom: '#fb8c00',
              // backgroundGradientTo: '#ffa726',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                // stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              margin: 5,
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
          <Button
            icon="logout"
            mode="outlined"
            onPress={() => {
              Auth.signOut()
                .then(() => {
                  // this.props.onStateChange('signedOut');
                  this.props.navigation.goBack();
                  this.props.navigation.getParam('logOut')();
                  // onStateChange('signedOut');
                })
                .catch(e => console.log(e));
              // this.props.navigation.getParam('logOut')();
              // this.props.navigation.goBack();
            }}
            // this.props.navigation.getParam('logOut')}>
          >
            Log Out
          </Button>
          <Button onPress={this.loadTestImg}>test</Button>
        </Card>
      </View>
    );
  }
}

const mapStateToProps = state => {
  const {plantyData} = state;

  return {plantyData};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      AddAvatarLink,
      cleanReduxState,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(UserPage);

// export default UserPage;
