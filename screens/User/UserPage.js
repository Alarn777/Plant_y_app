import React from 'react';
import {bindActionCreators} from 'redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {
  Image,
  View,
  Dimensions,
  StyleSheet,
  ScrollView,
  AsyncStorage,
} from 'react-native';
import {Auth} from 'aws-amplify';
import * as Keychain from 'react-native-keychain';
import {
  Avatar,
  Card as PaperCard,
  Card,
  Button,
  FAB,
  Text,
  ActivityIndicator,
  Switch,
  Portal,
  Dialog,
  TextInput,
  Divider,
} from 'react-native-paper';
import ImagePicker from 'react-native-image-picker';
import {Storage} from 'aws-amplify';
import Buffer from 'buffer';
import connect from 'react-redux/lib/connect/connect';
import {AddAvatarLink, changeTheme, cleanReduxState} from '../../FriendActions';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import WS from '../../websocket';
import BarGraph from '../../BarGraph';
import {Logger} from '../../Logger';
import TouchID from 'react-native-touch-id';

const plantyColor = '#6f9e04';

const data = {
  labels: ['Test', 'Test', 'Test'],
  datasets: [
    {
      data: [3, 5, 3],
    },
  ],
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
      height: Dimensions.get('window').height,
      fileUrl: '',
      graphData: data,
      buttonMode: 'pick', //pick,upload,
      FaceIDIsOn: false,
      username: '',
      password: '',
      modalVisible: false,
      loadingActivation: false,
      idString: 'Touch',
    };
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
    this.props.navigation.setParams({
      headerColor:
        this.props.plantyData.theme === 'light' ? 'white' : '#263238',
    });
    this.loadGraphData();
    this.checkIfIdActivated()
      .then()
      .catch();
    this.checkIftouchFaceIsSupported();
  }

  async checkIfIdActivated() {
    try {
      //retrieve the credentials from keychain if saved.
      let credentials = await Keychain.getGenericPassword();
      if (credentials) {
        this.setState({FaceIDIsOn: true});
      } else this.setState({FaceIDIsOn: false});
    } catch (err) {
      Logger.saveLogs(
        this.props.plantyData.myCognitoUser.username,
        err.toString(),
        'addToKeyChain',
      );
      this.setState({FaceIDIsOn: false});
    }
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
      let activatedTime = one.TimeActivated;
      let currentWeek = (currentTime - activatedTime) / 86400;
      currentWeek = parseInt(currentWeek / 7);
      newData.labels.push(one.name);
      newData.datasets[0].data.push(currentWeek + 1);
    });

    this.setState({graphData: newData});
  };

  checkIftouchFaceIsSupported = () => {
    TouchID.isSupported()
      .then(biometryType => {
        if (biometryType === 'FaceID') {
          this.setState({idIsSupported: true, idString: 'Face'});
        } else if (biometryType === 'TouchID') {
          this.setState({idIsSupported: true, idString: 'Touch'});
        } else if (biometryType === true) {
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  removeFaceIDdetails = () => {
    Keychain.resetGenericPassword()
      .then(r => {
        this.setState({FaceIDIsOn: false, modalVisible: false});
      })
      .catch(e => {
        console.log(e);
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'removeFaceId',
        );
      });
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
      headerTintColor: params.headerColor,
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
        // alert(response.customButton);
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
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          err.toString(),
          'resize',
        );

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

  addToKeyChain = () => {
    this.setState({loadingActivation: true});
    const {
      username, // Get the credentials entered by the user
      password, // (We're assuming you are using controlled form inputs here)
    } = this.state;

    if (username === '' || password === '') {
      this.setState({error: true, loadingActivation: false});
      return;
    } else this.setState({error: false});

    Auth.signIn(username, password)
      .then(user => {
        Keychain.setGenericPassword(username, password)
          .then(val => {
            // console.log(val);
            this.setState({modalVisible: false, loadingActivation: false});
            this.checkIfIdActivated()
              .then()
              .catch();
            this.setState({});
          })
          .catch(e => {
            console.log(e);
            Logger.saveLogs(
              this.props.plantyData.myCognitoUser.username,
              e.toString(),
              'addToKeyChain',
            );
            this.setState({});
            this.setState({
              error: true,
              loadingActivation: false,
              modalVisible: false,
            });
          });
      })
      .catch(e => {
        console.log(e);
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'signIn',
        );
        this.setState({
          error: true,
          loadingActivation: false,
          modalVisible: false,
        });
      });
  };

  _storeData = async theme => {
    try {
      await AsyncStorage.setItem('theme', theme);
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  };

  render() {
    return (
      <ScrollView
        style={{
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#263238',
        }}>
        <Card style={{margin: 2}}>
          <PaperCard.Title
            title={
              this.state.user.username === 'Test'
                ? 'Username: Yukio'
                : 'Username: ' + this.state.user.username
            }
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
        <Card style={{margin: 2}}>
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
          <BarGraph
            color={this.props.plantyData.theme === 'light' ? 'black' : 'white'}
            data={this.state.graphData}
            // max={Math.max(...this.state.graphData.datasets[0].data)}
            formatter={'W'}
          />
          <Text style={{marginLeft: 7, color: plantyColor}}>*W - Weeks</Text>
          <Divider style={{marginTop: 10}} />
          <View
            style={{
              // flex:
              margin: 10,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
            <Text style={styles.actionsText}>
              Enable {this.state.idString} ID
            </Text>
            <Switch
              value={this.state.FaceIDIsOn}
              onValueChange={() => {
                this.setState({modalVisible: true});
              }}
            />
          </View>
          <View
            style={{
              margin: 10,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}>
            <Text style={styles.actionsText}>Enable dark mode</Text>
            <Switch
              value={this.props.plantyData.theme !== 'light'}
              onValueChange={() => {
                this._storeData(
                  this.props.plantyData.theme === 'light' ? 'dark' : 'light',
                )
                  .then()
                  .catch();
                this.props.changeTheme(
                  this.props.plantyData.theme === 'light' ? 'dark' : 'light',
                );
                this.props.navigation.getParam('theme')(
                  this.props.plantyData.theme === 'light' ? 'dark' : 'light',
                );
              }}
            />
          </View>
          <Portal>
            {this.state.FaceIDIsOn ? (
              <Dialog
                visible={this.state.modalVisible}
                onDismiss={() => this.setState({modalVisible: false})}>
                <Dialog.Title>
                  This will disable {this.state.idString} ID option
                </Dialog.Title>
                <Dialog.Content>
                  <Text>Are you sure?</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    onPress={() => {
                      this.removeFaceIDdetails();
                    }}>
                    OK
                  </Button>
                  <Button onPress={() => this.setState({modalVisible: false})}>
                    Cancel
                  </Button>
                </Dialog.Actions>
              </Dialog>
            ) : (
              <Dialog
                visible={this.state.modalVisible}
                onDismiss={() => this.setState({modalVisible: false})}>
                <Dialog.Title>Please enter your credentials:</Dialog.Title>
                <Dialog.Content>
                  <TextInput
                    style={{margin: 10}}
                    error={this.state.error}
                    label="Usename"
                    value={this.state.username}
                    onChangeText={username => this.setState({username})}
                  />
                  <TextInput
                    error={this.state.error}
                    style={{margin: 10}}
                    label="Password"
                    secureTextEntry={true}
                    value={this.state.password}
                    onChangeText={password => this.setState({password})}
                  />
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    loading={this.state.loadingActivation}
                    onPress={() => {
                      this.addToKeyChain();
                    }}>
                    Activate
                  </Button>
                  <Button
                    onPress={() =>
                      this.setState({
                        modalVisible: false,
                        FaceIDIsOn: false,
                        password: '',
                      })
                    }>
                    Cancel
                  </Button>
                </Dialog.Actions>
              </Dialog>
            )}
          </Portal>
          <Button
            style={{margin: 10}}
            icon="logout"
            mode="outlined"
            onPress={() => {
              Auth.signOut()
                .then(() => {
                  WS.sendMessage(
                    'FROM_CLIENT;e0221623-fb88-4fbd-b524-6f0092463c93;VIDEO_STREAM_OFF',
                  );
                  this.props.navigation.goBack();
                  this.props.navigation.getParam('logOut')();
                  WS.closeSocket('logOut');
                })
                .catch(e => {
                  Logger.saveLogs(
                    this.props.plantyData.myCognitoUser.username,
                    e.toString(),
                    'Auth signOut - userPage',
                  );
                  console.log(e);
                });
            }}>
            Log Out
          </Button>
          <View style={{height: 100}} />
        </Card>
      </ScrollView>
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
      changeTheme,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserPage);
