import React from 'react';
import {bindActionCreators} from 'redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {Image, View, Dimensions, StyleSheet, ScrollView} from 'react-native';
import {
  Card as PaperCard,
  Card,
  FAB,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import {Storage} from 'aws-amplify';
import Buffer from 'buffer';
import connect from 'react-redux/lib/connect/connect';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import WS from '../../websocket';
import {Icon} from '@ui-kitten/components';
import {RNCamera} from 'react-native-camera';
import {isIphone7} from '../../whatDevice';
import {Logger} from '../../Logger';

const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

const data = {
  labels: ['Test', 'Test', 'Test'],
  datasets: [
    {
      data: [3, 5, 3],
    },
  ],
};

class AITesting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: '',
      planter: this.props.navigation.getParam('planter'),
      filePath: null,
      fileData: null,
      fileUri: '',
      fileUrl: '',
      graphData: data,
      buttonMode: 'pick', //pick,upload,
      modalVisible: false,
      height: Dimensions.get('window').height,
      testingPlant: false,
      plant_tested: false,
      testingPlanticon: 'check',
      testingPlantText: 'Test Successful',
      plantHealthStatus: 100,
    };

    WS.onMessage(data => {
      // console.log('GOT in Picture screen', data.data);

      let instructions = data.data.split(';');
      if (instructions.length > 2)
        switch (instructions[2]) {
          case 'IMAGE_STATUS_RAND':
            if (instructions[4] === 'FAILED') {
              break;
            }

            let sick = 0;
            if (instructions[4] === 'sick') sick = 100;
            else sick = 0.0;
            this.setState({plantHealthStatus: 100 - sick});
            this.successTesting();
            break;
          default:
            break;
        }
    });
  }

  componentDidMount(): void {
    this.props.navigation.setParams({
      headerColor:
        this.props.plantyData.theme === 'light' ? 'white' : '#263238',
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

  successTesting = () => {
    this.setState({
      testingPlant: false,
      plant_tested: true,
      testingPlanticon: 'check',
      testingPlantText: 'Test Successful',
      buttonMode: 'upload',
    });
    setTimeout(this.changeBack, 5000);
  };

  changeBack = () => {
    this.setState({
      plant_tested: false,
    });
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
            right: 160,
            top: 450,
          }}
          large
          loading={this.state.iconMode === 'loading'}
          icon={require('../../assets/icons/camera-outline.png')}
          onPress={() => {
            this.takePicture()
              .then()
              .catch();
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
              right: 20,

              top: 0,
            }}
            large
            icon={'clipboard-play-outline'}
            label={'Evaluate'}
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
              left: 20,
              top: 0,
            }}
            large
            icon="close"
            onPress={() => {
              this.cancelFileUpload();
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
          style={{position: 'relative', top: -200}}
        />
      );
    }
  };

  takePicture = async () => {
    this.setState({iconMode: 'loading'});

    if (this.camera) {
      const options = {quality: 1, base64: true};
      const response = await this.camera.takePictureAsync(options);
      this.setState({
        filePath: response,
        fileData: response.data,
        fileUri: response.uri,
        buttonMode: 'upload',
        url: response.uri, //showPic
      });
    } else {
      Logger.saveLogs(
        this.props.plantyData.myCognitoUser.username,
        'Failed to access camera on devise',
        'takePicture',
      );
    }
  };

  resize = () => {
    ImageResizer.createResizedImage(this.state.fileUri, 256, 256, 'JPEG', 100)
      .then(({uri}) => {
        this.setState({
          fileUri: uri,
        });
        this.uploadImage();
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'resize',
        );
        console.log(e);
      });
  };

  renderTestResults = () => {
    if (!this.state.plant_tested) {
      return <View />;
    } else
      return (
        <View style={{marginTop: 90}}>
          {this.state.plantHealthStatus === 100 ? (
            <View>
              <Text
                style={{
                  color: plantyColor,
                  alignSelf: 'center',
                  margin: 9,
                  height: 40,
                  fontSize: 20,
                }}>
                Good job, your plant looks healthy!
              </Text>
              <Icon
                style={{width: 50, height: 50, alignSelf: 'center'}}
                fill={plantyColor}
                name="checkmark-circle-outline"
              />
            </View>
          ) : (
            <View>
              <Text
                style={{
                  alignSelf: 'center',
                  color: errorColor,
                  margin: 9,
                  height: 40,
                  fontSize: 25,
                }}>
                Please tend to your plant!
              </Text>
              <Icon
                style={{width: 50, height: 50, alignSelf: 'center'}}
                fill={errorColor}
                name="alert-circle-outline"
              />
            </View>
          )}
        </View>
      );
  };

  uploadImage = () => {
    this.setState({buttonMode: 'loading', iconMode: ''});

    RNFS.readFile(this.state.fileUri, 'base64')
      .then(fileData => {
        const bufferedImageData = new Buffer.Buffer(fileData, 'base64');

        let ImageKey =
          this.props.plantyData.myCognitoUser.username +
          '/' +
          this.state.planter.name +
          '/testImages/testImage.jpg';

        Storage.put(ImageKey, bufferedImageData, {
          contentType: 'image/jpg',
          level: 'public',
        })
          .then(result => {
            WS.sendMessage(
              'FROM_CLIENT;PHONE' + ';CHECK_IMAGE_RAND;' + result.key + ';;',
            );
          })
          .catch(e => {
            Logger.saveLogs(
              this.props.plantyData.myCognitoUser.username,
              e.toString(),
              'uploadImage',
            );
            console.log(e);
          });
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'FileReadInUloadImage',
        );
        console.log(e);
      });
  };

  render() {
    return (
      <ScrollView
        style={{
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
          position: 'relative',
        }}>
        <Card style={{height: this.state.height - 60}}>
          <PaperCard.Title
            title={'Test your plants'}
            subtitle={"Take a picture of a plant's leaf and we will test it"}
          />

          {this.renderCamera()}
          {this.renderAvatarButton()}
          {this.renderTestResults()}
        </Card>
        <Image
          style={
            isIphone7()
              ? {position: 'absolute', bottom: -90, zIndex: 10}
              : {position: 'absolute', bottom: -60, zIndex: 10}
          }
          source={require('../../assets/grass.png')}
        />
      </ScrollView>
    );
  }

  renderCamera() {
    if (this.state.buttonMode === 'pick')
      return (
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          type={RNCamera.Constants.Type.back}
          style={{
            alignSelf: 'center',
            margin: 20,
            height: 350,
            width: 350,
            borderRadius: 5,
          }}
          captureAudio={false}>
          <Image
            style={{
              height: 350,
              width: 350,
            }}
            source={require('../../assets/cam-over.png')}
          />
        </RNCamera>
      );
    else return <Image style={styles.image} source={{uri: this.state.url}} />;
  }

  cancelFileUpload = () => {
    const filePath = this.state.filePath.uri.split('///').pop();
    try {
      RNFS.exists(filePath).then(res => {
        if (res) {
          RNFS.unlink(filePath)
            .then(() => {
              this.setState({
                filePath: null,
                fileData: null,
                fileUri: '',
                buttonMode: 'pick',
                url: '',
                iconMode: '',
              });
            })
            .catch(e => {
              Logger.saveLogs(
                this.props.plantyData.myCognitoUser.username,
                e.toString(),
                'unlinkFile',
              );
              console.log(e);
            });
        }
      });
    } catch (e) {
      Logger.saveLogs(
        this.props.plantyData.myCognitoUser.username,
        e.toString(),
        'cancelFileUpload',
      );
      console.log(e);
    }
  };
}

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
    backgroundColor: 'lightgray',
    margin: 20,
    height: 350,
    width: 350,
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

export default connect(mapStateToProps)(AITesting);
