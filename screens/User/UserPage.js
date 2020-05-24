import React from 'react';
import {bindActionCreators} from 'redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {Image, View, Dimensions, StyleSheet} from 'react-native';
import {Auth} from 'aws-amplify';
import {BarChart, LineChart} from 'react-native-chart-kit';
import {
  Avatar,
  Card as PaperCard,
  Card,
  Button,
  FAB,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import ImagePicker from 'react-native-image-picker';
import {Storage} from 'aws-amplify';
import Buffer from 'buffer';
import connect from 'react-redux/lib/connect/connect';
import {AddAvatarLink, cleanReduxState} from '../../FriendActions';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import WS from '../../websocket';

const plantyColor = '#6f9e04';

const data = {
  labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
    },
  ],
};

const chartConfig = {
  backgroundGradientFrom: plantyColor,
  decimalPlaces: 2, // optional, defaults to 2dp
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.navigation.getParam('user'),
      USER_TOKEN: '',
      url: this.props.plantyData.avatarUrl,
      fileName: '',
      planters: this.props.navigation.getParam('planters'),
      filePath: null,
      fileData: null,
      fileUri: '',
      fileUrl: '',
      graphData: data,
      buttonMode: 'pick', //pick,upload
    };
  }

  componentDidMount(): void {
    this.loadGraphData();
  }

  loadGraphData = () => {
    let newData = {
      labels: [],
      datasets: [
        {
          data: [],
        },
      ],
    };
    let currentTime = new Date().getTime() / 1000;

    this.state.planters.map(one => {
      // console.log(one);
      // return;
      let activatedTime = one.TimeActivated;
      let currentWeek = (currentTime - activatedTime) / 86400;
      // currentWeek = currentWeek / 24;
      currentWeek = parseInt(currentWeek / 7);
      newData.labels.push(one.name);
      newData.datasets[0].data.push(currentWeek);
    });

    this.setState({graphData: newData});
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

  renderAvatarButton = () => {
    if (this.state.buttonMode === 'pick') {
      return (
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            backgroundColor: '#6f9e04',
            color: '#6f9e04',
            right: 120,
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

              backgroundColor: '#6f9e04',
              color: '#6f9e04',
              right: 120,

              bottom: -10,
            }}
            large
            icon="cloud-upload-outline"
            onPress={() => {
              this.resize();
            }}
          />
          <FAB
            style={{
              position: 'absolute',
              margin: 16,

              backgroundColor: '#6f9e04',
              color: '#6f9e04',
              left: 120,

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
        const bufferedImageData = new Buffer.Buffer(fileData, 'base64');

        let userAvatarKey =
          'user_avatars/' + this.state.user.username + '_avatar.jpeg';

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
                this.props.AddAvatarLink(data);
                this.setState({buttonMode: 'pick'});
              })
              .catch(error => console.log(error));
          })
          .catch(err => console.log(err));
      })
      .catch(error => console.log(error));
  };

  render() {
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
          <Text
            style={{
              marginLeft: 5,
              fontSize: 20,
              padding: 5,
              alignSelf: 'center',
              // fontWeight: 'bold',
            }}>
            Planter Lifetimes
          </Text>
          <BarChart
            data={this.state.graphData}
            width={Dimensions.get('window').width - 10} // from react-native
            height={220}
            // yAxisLabel="Weeks"
            yAxisSuffix={' W'}
            // horizontalLabelRotation={45}
            showValuesOnTopOfBars={true}
            // showBarTops={true}
            // formatYLabel={val => {

            //   // console.log(val);
            //   // let val1 = parseFloat(val) * 100;
            //   return Math.floor(val).toString() + 'Weekss';
            // }}
            fromZero={true}
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <Text style={{marginLeft: 7, color: plantyColor}}>*W - Weeks</Text>
          <Button
            style={{margin: 10}}
            icon="logout"
            mode="outlined"
            onPress={() => {
              Auth.signOut()
                .then(() => {
                  this.props.navigation.goBack();
                  this.props.navigation.getParam('logOut')();
                  WS.sendMessage(
                    'FROM_CLIENT;e0221623-fb88-4fbd-b524-6f0092463c93;VIDEO_STREAM_OFF',
                  );
                  WS.closeSocket();
                })
                .catch(e => console.log(e));
            }}>
            Log Out
          </Button>
        </Card>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  chart: {
    margin: 5,
    marginVertical: 8,
    borderRadius: 10,
  },
  container: {
    padding: 25,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalText: {},
  conditionsText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionsText: {
    marginTop: 7,
    marginBottom: 7,
  },
});

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

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserPage);
