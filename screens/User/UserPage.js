/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
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
import {Avatar, Card as PaperCard, Card, Button, FAB} from 'react-native-paper';
import {Icon} from '@ui-kitten/components';
import ImagePicker from 'react-native-image-picker';
// import RNFetchBlob from 'react-native-fetch-blob';
import {Storage} from 'aws-amplify';
import Consts from '../../ENV_VARS';

const plantyColor = '#6f9e04';

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.navigation.getParam('user'),
      USER_TOKEN: '',
      url: '',
    };
    // this.dealWithData = this.dealWithData.bind(this);
    // this.fetchUser = this.fetchUser.bind(this);
  }
  componentDidMount(): void {
    let a = this.props.navigation.getParam('logOut');
    // console.log(a);
  }

  async loadImage() {
    let AWS = require('aws-sdk');
    let s3 = new AWS.S3({
      accessKeyId: Consts.accessKeyId,
      secretAccessKey: Consts.secretAccessKey,
      region: 'eu',
    });

    let params = {
      Bucket: 'pictures-bucket-planty',
      Key: 'aaa.jpg',
      Expires: 60,
      ResponseContentType: 'image/jpg',
    };

    new Promise((resolve, reject) => {
      s3.getSignedUrl('getObject', params, function(err, url) {
        if (err) reject(err);
        else resolve(url);
      });
    }).then(url => {
      this.setState({url: url});
      console.log(url);
    });
    await Storage.get('cucumber_img.jpg', {
      level: 'protected',
      bucket: 'plant-pictures-planty',
      region: 'eu',
    })
      .then(result => {
        this.setState({url: result});

        console.log(result);
      })
      .catch(err => console.log(err));
  }

  UNSAFE_componentWillMount(): void {
    // this.loadImage()
    //   .then(r => console.log('RES ' + r))
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

  launchCamera = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchCamera(options, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
        alert(response.customButton);
      } else {
        const source = {uri: response.uri};
        console.log('response', JSON.stringify(response));
        this.setState({
          filePath: response,
          fileData: response.data,
          fileUri: response.uri,
        });
      }
    });
  };

  render() {
    console.log(this.state);
    return (
      <View>
        <Card>
          <PaperCard.Title
            title={this.state.user.username}
            // subtitle="Card Subtitle"
            // left={props => (
            //   <Avatar.Icon
            //     {...props}
            //     style={{backgroundColor: plantyColor}}
            //     icon="account"
            //   />
            // )}
          />
          {/*<Avatar.Image*/}
          {/*  style={{alignSelf: 'center', backgroundColor: 'red'}}*/}
          {/*  size={200}*/}
          {/*  source={''}*/}
          {/*/>*/}
          {/*<FAB*/}
          {/*  style={{*/}
          {/*    position: 'absolute',*/}
          {/*    margin: 16,*/}
          {/*    // width: 50,*/}

          {/*    backgroundColor: '#6f9e04',*/}
          {/*    color: '#6f9e04',*/}
          {/*    right: 120,*/}
          {/*    // top: height - 200,*/}
          {/*    bottom: -10,*/}
          {/*  }}*/}
          {/*  large*/}
          {/*  icon="pencil"*/}
          {/*  onPress={() => {*/}
          {/*    this.launchCamera();*/}
          {/*  }}*/}
          {/*  //     this.props.navigation.navigate('AllAvailablePlants', {*/}
          {/*  //       user_token: this.state.USER_TOKEN,*/}
          {/*  //       // item: this.props.navigation.getParam('item'),*/}
          {/*  //       planterName: this.props.navigation.getParam('item').name,*/}
          {/*  //       loadPlanters: this.props.navigation.getParam('loadPlanters'),*/}
          {/*  //     })*/}
          {/*  // }*/}
          {/*/>*/}
          {/*<FAB*/}
          {/*  style={{*/}
          {/*    position: 'absolute',*/}
          {/*    margin: 16,*/}
          {/*    // width: 50,*/}

          {/*    backgroundColor: '#6f9e04',*/}
          {/*    color: '#6f9e04',*/}
          {/*    // right: 120,*/}
          {/*    // top: height - 200,*/}
          {/*    // bottom: -10,*/}
          {/*  }}*/}
          {/*  large*/}
          {/*  icon="pencil"*/}
          {/*  onPress={() => {*/}
          {/*    this.loadPic();*/}
          {/*  }}*/}
          {/*  //     this.props.navigation.navigate('AllAvailablePlants', {*/}
          {/*  //       user_token: this.state.USER_TOKEN,*/}
          {/*  //       // item: this.props.navigation.getParam('item'),*/}
          {/*  //       planterName: this.props.navigation.getParam('item').name,*/}
          {/*  //       loadPlanters: this.props.navigation.getParam('loadPlanters'),*/}
          {/*  //     })*/}
          {/*  // }*/}
          {/*/>*/}
        </Card>

        {/*<Text>{this.state.user.username}</Text></Card>*/}
        {/*<Image*/}
        {/*  style={{height: 100, width: 100}}*/}
        {/*  source={{*/}
        {/*    uri: this.state.url,*/}
        {/*  }}*/}
        {/*/>*/}
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

          {/*<Button*/}
          {/*  onPress={this.props.navigation.getParam('logOut')}*/}
          {/*  // title="Info"*/}
          {/*  // color="#fff"*/}
          {/*  // appearance="outl"*/}
          {/*  // style={{color: plantyColor}}*/}
          {/*  icon={style => {*/}
          {/*    return <Icon {...style} name="log-out-outline" />;*/}
          {/*  }}*/}
          {/*  // status="basic"*/}
          {/*>*/}
          {/*  Log Out*/}
          {/*</Button>*/}
        </Card>
      </View>
    );
  }

  loadPic() {
    console.log(this.state);
    // Storage.configure({
    //   AWSS3: {
    //     bucket: '', //Your bucket ARN;
    //     region: '', //Specify the region your bucket was created in;
    //   },
    // });

    // ImagePicker.launchImageLibrary(options, response => {
    //   if (response.didCancel) {
    //     console.log('User cancelled image picker');
    //   } else if (response.error) {
    //     console.log('ImagePicker error: ', response.error);
    //   } else {
    //     this.setState({
    //       vidFileName: response.fileName,
    //     });
    //
    //     console.log(response.uri);
    //
    //     this.putFileInS3(response.path, repsonse.filename);
    //   }
    // });
  }

  readFile = somefilePath => {
    return RNFetchBlob.fs
      .readFile(somefilePath, 'base64')
      .then(data => new Buffer(data, 'base64'));
  };

  putFileInS3 = (filePath, fileName) => {
    this.readFile(filePath).then(buffer => {
      Storage.put(fileName, buffer, {contentType: 'video/mp4'})
        .then(() => {
          console.log('successfully saved to bucket');
        })
        .catch(e => {
          console.log(e);
        });
    });
  };
}

export default UserPage;
