import React from 'react';
import {
  Image,
  View,
  ScrollView,
  Dimensions,
  ImageBackground,
  Text as TextNative,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {Auth} from 'aws-amplify';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';
import {Text, Spinner} from '@ui-kitten/components';
import {
  FAB,
  Card as PaperCard,
  ActivityIndicator,
  Button,
  IconButton,
  Portal,
  Snackbar,
  Dialog,
  Paragraph,
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
import axios from 'axios';
import Consts from '../../ENV_VARS';
import connect from 'react-redux/lib/connect/connect';
import {AddAvatarLink, addStreamUrl, addUser} from '../../FriendActions';
import {bindActionCreators} from 'redux';
import {HeaderBackButton} from 'react-navigation-stack';
import WS from '../../websocket';
import {PLAYER_STATES} from 'react-native-media-controls';
import Player from './VideoPlayer';
import {isIphoneX} from '../../whatDevice';
import {Logger} from '../../Logger';

const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';
const surfaceColor = '#435055';

class planterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      userLoggedIn: true,
      userEmail: '',
      username: '',
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      plants: [],
      planter: this.props.navigation.getParam('item'),
      parties: [],
      places: null,
      change: false,
      user: null,
      USER_TOKEN: '',
      userAvatar: '',
      loadBuffering: true,
      videoErrorObj: {videoErrorFlag: false, videoErrorMessage: ''},
      myCognitoUser: null,
      loading: false,
      streamUrl: '',
      loadingActions: false,
      loadingPlanters: false,
      refreshingPlants: false,
      sickPlantDetected: this.props.navigation.getParam('item')
        .sickPlantDetected,
      currTemperature: '',
      currUV: '',
      currHumidity: '',
      currentTime: 0,
      duration: 0,
      isFullScreen: false,
      isLoading: true,
      paused: false,
      playerState: PLAYER_STATES.PLAYING,
      screenType: 'content',
      pictureAlertIsOn: false,
      pictureAlertText: '',
      modalVisible: false,
      deletingPlanter: false,
      streamTurnedOn: false,
    };
    this.loadPlants = this.loadPlants.bind(this);
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    this.onLayout = this.onLayout.bind(this);

    WS.onMessage(data => {
      // console.log('GOT in planter screen', data.data);

      let instructions = data.data.split(';');
      if (instructions.length > 2)
        switch (instructions[2]) {
          case 'FAILED':
            this.forceUpdate();
            break;
          case 'IMAGE_STATUS':
            let sick = 0;
            if (instructions[4] === 'sick') {
              this.state.planter.sickPlantDetected = true;
              this.setState({sickPlantDetected: true});
            }
            break;
          case 'STREAM_STARTED':
            setTimeout(() => {
              this.setTimePassed();
            }, 4000);
            break;
          case 'STREAM_ON':
            this.setState({
              streamTurnedOn: true,
            });
            setTimeout(() => {
              this.setTimePassed();
            }, 1000);
            break;
          case 'STREAM_OFF':
            this.setState({
              streamTurnedOn: false,
            });
            WS.sendMessage(
              'FROM_CLIENT;e0221623-fb88-4fbd-b524-6f0092463c93;VIDEO_STREAM_ON',
            );

            break;

          case 'MEASUREMENTS':
            if (this.state.planter.UUID === instructions[1]) {
              let temp = instructions[3].split(':')[1];
              temp = Math.floor(parseFloat(temp));
              this.setState({
                currTemperature: temp,
                currUV: instructions[4].split(':')[1],
                currHumidity: instructions[5].split(':')[1],
              });
            }

            break;
          default:
            break;
        }
    });
  }

  setTimePassed = () => {
    this.loadUrl()
      .then()
      .catch(e => console.log(e));
  };

  static navigationOptions = ({navigation}) => {
    const params = navigation.state.params || {};
    return {
      headerShown: navigation.getParam('userLoggedIn'),
      headerTitle: (
        <Image
          resizeMode="contain"
          style={{height: 40, width: 40}}
          source={require('../../assets/logo.png')}
        />
      ),
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
      },
      headerStyle: {
        backgroundColor: params.headerColor,
      },
      headerLeft: (
        <HeaderBackButton
          title="My Garden"
          onPress={() => {
            navigation.goBack();
          }}
        />
      ),
    };
  };

  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS,
  ): void {
    if (
      this.props.navigation.getParam('plantWasRemoved') ||
      this.props.navigation.getParam('plantWasAdded')
    ) {
      this.loadPlants()
        .then()
        .catch();
      this.props.navigation.setParams({plantWasAdded: false});
      this.props.navigation.setParams({plantWasRemoved: false});
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

  handleRefresh = () => {
    this.setState({refreshingPlants: true});
  };

  componentDidMount(): void {
    this.props.navigation.setParams({
      headerColor:
        this.props.plantyData.theme === 'light' ? 'white' : '#263238',
    });

    Auth.currentAuthenticatedUser()
      .then()
      .then()
      .catch(() => {
        console.log('failed to get user');
        this.props.navigation.getParam('logOut')();
      });

    this.loadPlanter()
      .then()
      .catch(e => console.log(e));

    this.loadPlants()
      .then()
      .catch(e => console.log(e));

    this.checkStream();
  }

  checkStream = () => {
    if (WS.ws)
      WS.sendMessage(
        'FROM_CLIENT;' + this.state.planter.UUID + ';VIDEO_STREAM_STATUS',
      );
  };

  async loadPlanter() {
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/getPlanter',
        {
          username: this.props.authData.username,
          UUID: this.state.planter.UUID,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.setState({
          sickPlantDetected: response.data.sickPlantDetected,
          planter: response.data,
        });
      })
      .catch(error => {
        this.fetchUser();
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          'loadPlanter',
        );
      });
  }

  async loadUrl() {
    if (
      this.props.plantyData.streamUrl === undefined ||
      this.props.plantyData.streamUrl === null
    ) {
    }
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    this.setState({USER_TOKEN: USER_TOKEN});
    await axios
      .get(Consts.apigatewayRoute + '/streams', {
        headers: {Authorization: AuthStr},
      })
      .then(response => {
        if (response.data) {
          if (
            this.props.plantyData.streamUrl === undefined ||
            this.props.plantyData.streamUrl === null
          ) {
            if (response.data.errorMessage) {
              return;
            }
            this.setState({errorText: ''});
            this.addUrl(response.data.HLSStreamingSessionURL);
          } else {
            this.setState({errorText: ''});
            this.setState({streamUrl: this.props.plantyData.streamUrl});
          }
        } else {
          this.setState({errorText: 'Reload the app'});
          console.log('No stream data URL');
          console.log(response);
        }
      })
      .catch(error => {
        console.log('error ' + error);
        this.setState({errorText: error.toString()});
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          'loadUrl',
        );

        this.fetchUser()
          .then()
          .catch();
        this.setState({
          videoErrorObj: {
            videoErrorFlag: true,
            videoErrorMessage: error.errorMessage,
          },
        });
      });
  }

  async fetchUser() {
    await Auth.currentAuthenticatedUser({
      bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    })
      .then(user => {
        this.dealWithUserData(user);
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'fetchUser - planterScreen',
        );
        console.log(e);
      });
  }

  dealWithUserData = user => {
    this.props.addUser(user);
  };

  addUrl = url => {
    this.props.addStreamUrl(url);
  };

  async loadPlants() {
    this.setState({loading: true, plants: []});
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/getPlantsInPlanter',
        {
          username: this.props.authData.username,
          planterName: this.props.navigation.getParam('item').name,
          planterUUID: this.props.navigation.getParam('item').UUID,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.dealWithPlantsData(response.data);
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'loadPlants',
        );
        console.log(e);
      });
  }

  async deletePlanter() {
    this.setState({deletingPlanter: true});
    const AuthStr = 'Bearer '.concat(
      this.props.plantyData.myCognitoUser.signInUserSession.idToken.jwtToken,
    );

    await axios
      .post(
        Consts.apigatewayRoute + '/changeStatusOfPlanter',
        {
          username: this.props.plantyData.myCognitoUser.username,
          planterUUID: this.state.planter.UUID,
          planterStatus: 'inactive',
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        console.log(response);
        this.successDeleting();
      })
      .catch(error => {
        this.failureDeleting();
        console.log('error ' + error);
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          'deletePlanter',
        );
      });
  }

  successDeleting = () => {
    this.setState({
      deletingPlanter: false,
    });
    setTimeout(this.goBack, 1000);
  };
  failureDeleting = () => {
    this.setState({
      deletingPlanter: false,
    });
  };

  async acknoledgeSickPlant() {
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/acknoledgeSickPlant',
        {
          username: this.props.authData.username,
          sickPlantDetected: false,
          UUID: this.props.navigation.getParam('item').UUID,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.state.planter.sickPlantDetected = false;
        this.setState({sickPlantDetected: false});
        this.props.navigation.getParam('loadPlanters')();
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'acknoledgeSickPlant',
        );
        console.log(e);
      });
  }

  dealWithPlantsData = plants => {
    if (plants) {
      plants.map(one => {
        if (one.plantStatus === 'inactive') {
        } else this.state.plants.push(one);
      });
      this.forceUpdate();
    } else this.setState({plants: []});

    this.setState({refreshingPlants: false});
    this.setState({loading: false});
  };

  async takePicture() {
    this.setState({loadingActions: true});
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/takePlanterPicture',
        {
          username: this.props.authData.username,
          planter: this.props.navigation.getParam('item').name,
          url: this.props.plantyData.streamUrl,
          configuration: 'normal',
          humidity: this.state.currHumidity.toString(),
          temperature: this.state.currTemperature.toString(),
          UV: this.state.currUV.toString(),
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.setState({loadingActions: false});
        this.setState({
          pictureAlertIsOn: true,
          pictureAlertText: 'Saved picture to your gallery',
        });
      })
      .catch(error => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          'takePicture',
        );

        this.setState({loadingActions: false});
        console.log('error ' + error);
        this.setState({
          pictureAlertIsOn: true,
          pictureAlertText: 'Failed to take picture',
        });
      });
  }

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }

  _keyExtractor = item => item.UUID;

  _renderItem = ({item}) => {
    if (item.plantStatus === 'inactive') {
      return;
    }

    let url = '';
    for (let i = 0; i < this.props.plantyData.plantsImages.length; i++) {
      if (
        this.props.plantyData.plantsImages[i].name.toLowerCase() ===
        item.name.toLowerCase()
      ) {
        url = this.props.plantyData.plantsImages[i].URL;
      }
    }
    item.pic = url;
    return (
      <View>
        <PaperCard
          onPress={() =>
            this.props.navigation.navigate('PlantScreen', {
              item: item,
              user_token: this.state.USER_TOKEN,
              planterName: this.props.navigation.getParam('item').name,
              planterUUID: this.props.navigation.getParam('item').UUID,
            })
          }
          style={{width: this.state.width / 3 - 6, margin: 3, borderRadius: 5}}
          index={item.id}
          key={item.id}>
          <Image style={styles.headerImage} source={{uri: url}} />
          <Text style={styles.partyText}>{item.name}</Text>
        </PaperCard>
      </View>
    );
  };

  loadBuffering = () => {
    return (
      <View
        style={{
          alignSelf: 'center',
        }}>
        <Spinner
          style={{
            alignSelf: 'center',
            backgroundColor: plantyColor,
          }}
          status="basic"
        />
      </View>
    );
  };

  goBack = () => {
    this.props.navigation.navigate('HomeScreenUser', {
      planterWasRemoved: true,
    });
  };

  showVideoError = () => {
    if (this.state.videoErrorObj.videoErrorFlag)
      return (
        <View>
          <Text syle={{color: errorColor}}>
            {this.state.videoErrorObj.videoErrorMessage}
          </Text>
        </View>
      );
    else return <View />;
  };

  renderVideo = () => {
    if (
      this.props.plantyData.streamUrl === '' ||
      this.props.plantyData.streamUrl === undefined ||
      this.props.plantyData.streamUrl === null
    ) {
      return <ActivityIndicator size="large" color={plantyColor} />;
    } else
      return (
        <View style={{height: 200}}>
          <Player url={this.props.plantyData.streamUrl} />
        </View>
      );
  };

  renderStreamError = () => {
    if (this.state.errorText === '') {
      return <View />;
    } else
      return (
        <Text style={{color: errorColor, marginTop: 20}}>
          {this.state.errorText}
        </Text>
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
            style={{
              top: this.state.height / 2 - 50,
            }}
          />
        </View>
      );
    }

    if (this.state.planter.askedToSend === 'sent') {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor:
              this.props.plantyData.theme === 'light' ? 'white' : '#263238',
          }}
          onLayout={this.onLayout}>
          <ImageBackground
            source={require('../../assets/field_sky_grass_summer.jpg')}
            style={{width: '100%', height: '100%'}}>
            <PaperCard>
              <PaperCard.Title
                title={'Planter:' + this.state.planter.name}
                subtitle={'Status: ' + this.state.planter.planterStatus}
              />
              <PaperCard.Content>
                <Text>Plants are on their way to you</Text>
                <Text style={{marginTop: 10}}>
                  Name:{' '}
                  {
                    <Text style={{fontWeight: 'bold'}}>
                      {this.state.planter.sendDetails.name}
                    </Text>
                  }
                </Text>
                <Text style={{marginTop: 10}}>
                  Phone:{' '}
                  {
                    <Text style={{fontWeight: 'bold'}}>
                      {this.state.planter.sendDetails.phoneNumber}
                    </Text>
                  }
                </Text>
                <Text style={{marginTop: 10}}>
                  Address:{' '}
                  {
                    <Text style={{fontWeight: 'bold'}}>
                      {this.state.planter.sendDetails.address}
                    </Text>
                  }
                </Text>
                <Text style={{marginTop: 10}}>
                  Instructions:{' '}
                  {
                    <Text style={{fontWeight: 'bold'}}>
                      {this.state.planter.sendDetails.instructions}
                    </Text>
                  }
                </Text>
              </PaperCard.Content>
            </PaperCard>
          </ImageBackground>
        </View>
      );
    }

    if (this.state.plants.length > 0) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor:
              this.props.plantyData.theme === 'light' ? 'white' : '#263238',
          }}
          onLayout={this.onLayout}>
          <PaperCard>
            <View>
              <PaperCard.Title
                title={'Planter:' + this.props.navigation.getParam('item').name}
                subtitle={
                  'Climate:' + this.props.navigation.getParam('item').climate
                }
                right={props => (
                  <IconButton
                    icon="image-multiple"
                    color={plantyColor}
                    size={40}
                    onPress={() =>
                      this.props.navigation.navigate('planterImagesGallery', {
                        planter: this.state.planter,
                      })
                    }
                  />
                )}
              />
            </View>
            <PaperCard.Content>
              {this.renderVideo()}
              {this.showVideoError()}
            </PaperCard.Content>
            <PaperCard.Actions
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                padding: 8,
              }}>
              <IconButton
                icon={'reload'}
                color={plantyColor}
                size={20}
                style={{position: 'absolute', left: 5, top: 0}}
                onPress={() => {
                  this.props.addStreamUrl(undefined);
                  this.loadUrl()
                    .then()
                    .catch();
                }}
              />
              {this.renderStreamError()}
              <Text style={styles.mainText}>Camera Controllers</Text>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  padding: 8,
                }}>
                <IconButton
                  icon={
                    this.state.loadingActions
                      ? 'reload'
                      : require('../../assets/icons/arrowhead-left-outline.png')
                  }
                  color={plantyColor}
                  disabled={
                    this.state.loadingActions ||
                    !this.props.plantyData.streamUrl
                  }
                  size={isIphoneX() ? 30 : 40}
                  onPress={() => {
                    WS.sendMessage(
                      'FROM_CLIENT;' +
                        this.props.navigation.getParam('item').UUID +
                        ';MOVE_CAMERA_LEFT_LONG',
                    );
                  }}
                />
                <IconButton
                  icon={
                    this.state.loadingActions
                      ? 'reload'
                      : require('../../assets/icons/arrow-ios-back-outline.png')
                  }
                  color={plantyColor}
                  disabled={
                    this.state.loadingActions ||
                    !this.props.plantyData.streamUrl
                  }
                  size={isIphoneX() ? 30 : 40}
                  onPress={() => {
                    WS.sendMessage(
                      'FROM_CLIENT;' +
                        this.props.navigation.getParam('item').UUID +
                        ';MOVE_CAMERA_LEFT',
                    );
                  }}
                />
                <IconButton
                  icon={this.state.loadingActions ? 'reload' : 'camera'}
                  color={plantyColor}
                  size={isIphoneX() ? 30 : 40}
                  disabled={
                    this.state.loadingActions ||
                    !this.props.plantyData.streamUrl
                  }
                  onPress={() => {
                    this.takePicture()
                      .then(r => console.log())
                      .catch(error => console.log(error));
                  }}
                />
                <IconButton
                  icon={
                    this.state.loadingActions
                      ? 'reload'
                      : require('../../assets/icons/arrow-ios-forward-outline.png')
                  }
                  color={plantyColor}
                  size={isIphoneX() ? 30 : 40}
                  disabled={
                    this.state.loadingActions ||
                    !this.props.plantyData.streamUrl
                  }
                  onPress={() => {
                    WS.sendMessage(
                      'FROM_CLIENT;' +
                        this.props.navigation.getParam('item').UUID +
                        ';MOVE_CAMERA_RIGHT',
                    );
                  }}
                />
                <IconButton
                  icon={
                    this.state.loadingActions
                      ? 'reload'
                      : require('../../assets/icons/arrowhead-right-outline.png')
                  }
                  color={plantyColor}
                  size={isIphoneX() ? 30 : 40}
                  disabled={
                    this.state.loadingActions ||
                    !this.props.plantyData.streamUrl
                  }
                  onPress={() => {
                    WS.sendMessage(
                      'FROM_CLIENT;' +
                        this.props.navigation.getParam('item').UUID +
                        ';MOVE_CAMERA_RIGHT_LONG',
                    );
                  }}
                />
              </View>
              <Text style={styles.headerText}>Plants in Planter</Text>
            </PaperCard.Actions>
          </PaperCard>
          <Portal>
            <Snackbar
              duration={99999999}
              theme={{colors: {accent: 'white'}}}
              style={{backgroundColor: errorColor, top: 0, borderRadius: 5}}
              visible={this.state.sickPlantDetected}
              onDismiss={() => this.setState({sickPlantDetected: false})}
              action={{
                label: 'OK',

                onPress: () => {
                  this.acknoledgeSickPlant()
                    .then()
                    .catch();
                },
              }}>
              <TextNative style={{color: 'white'}}>
                We detected a sick plant in your garden,please tend to it!
              </TextNative>
            </Snackbar>
          </Portal>
          <Portal>
            <Dialog
              style={{
                backgroundColor:
                  this.props.plantyData.theme === 'light' ? 'white' : '#263238',
              }}
              visible={this.state.pictureAlertIsOn}
              onDismiss={() => this.setState({pictureAlertIsOn: false})}>
              <Dialog.Title>{this.state.pictureAlertText}</Dialog.Title>
              <Dialog.Actions>
                <Button
                  onPress={() => this.setState({pictureAlertIsOn: false})}>
                  OK
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <ScrollView
            style={{
              flexWrap: 'wrap',
              flex: 1,
              flexDirection: 'row',
              backgroundColor:
                this.props.plantyData.theme === 'light' ? 'white' : '#263238',
            }}>
            <FlatList
              vertical={true}
              scrollEnabled={false}
              numColumns={3}
              data={this.state.plants}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
              refreshing={this.state.refreshingPlants}
              onRefresh={this.handleRefresh}
            />
          </ScrollView>
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              backgroundColor:
                this.props.plantyData.theme === 'light'
                  ? 'white'
                  : surfaceColor,
              color: '#6f9e04',
              right: 0,
              bottom: 10,
              zIndex: 1,
            }}
            color={plantyColor}
            large
            icon="plus"
            onPress={() =>
              this.props.navigation.navigate('AllAvailablePlants', {
                user_token: this.state.USER_TOKEN,
                planterName: this.props.navigation.getParam('item').name,
                loadPlanters: this.props.navigation.getParam('loadPlanters'),
              })
            }
          />
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              backgroundColor:
                this.props.plantyData.theme === 'light'
                  ? 'white'
                  : surfaceColor,
              color: '#6f9e04',
              left: 0,
              zIndex: 1,
              bottom: 14,
            }}
            label="Manage planter"
            lage
            color={plantyColor}
            icon="pencil"
            onPress={() =>
              this.props.navigation.navigate('AdjustPlantConditions', {
                user_token: this.state.USER_TOKEN,
                item: this.state.planter,
              })
            }
          />
          <Image
            style={{position: 'absolute', bottom: -1, zIndex: 0}}
            source={require('../../assets/grass.png')}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor:
              this.props.plantyData.theme === 'light' ? 'white' : '#263238',
          }}
          // onLayout={this.onLayout}
        >
          <ImageBackground
            source={require('../../assets/field_sky_grass_summer.jpg')}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor:
                this.props.plantyData.theme === 'light' ? 'white' : '#263238',
            }}>
            <PaperCard>
              <PaperCard.Title
                title={'Planter:' + this.state.planter.name}
                subtitle={'Status: ' + this.state.planter.planterStatus}
              />
              <PaperCard.Content>
                {this.state.planter.planterStatus === 'pending' ? (
                  <View>
                    <Text style={{alignSelf: 'center'}}>
                      We are preparing your planter...
                    </Text>
                    <Image
                      style={{alignSelf: 'center', height: 100, width: 90}}
                      source={require('../../assets/happy_plant.png')}
                    />
                  </View>
                ) : (
                  <Text>Planter is empty now, add some plants</Text>
                )}
                <Button
                  style={{marginTop: 10}}
                  icon="delete"
                  mode="outlined"
                  loading={this.state.deletingPlanter}
                  onPress={() => {
                    this.setState({modalVisible: true});
                  }}>
                  Delete planter
                </Button>
              </PaperCard.Content>
            </PaperCard>
            <FAB
              style={{
                position: 'absolute',
                margin: 16,
                backgroundColor: plantyColor,
                color: plantyColor,
                right: 0,
                zIndex: 1,
                bottom: 10,
              }}
              disabled={this.state.planter.planterStatus === 'pending'}
              large
              icon="plus"
              onPress={() =>
                this.props.navigation.navigate('AllAvailablePlants', {
                  user_token: this.state.USER_TOKEN,
                  planterName: this.state.planter.name,
                  loadPlanters: this.props.navigation.getParam('loadPlanters'),
                })
              }
            />
          </ImageBackground>
          <Portal>
            <Dialog
              visible={this.state.modalVisible}
              onDismiss={() => this.setState({modalVisible: false})}>
              <Dialog.Title>
                Delete planter {this.state.planter.name}?
              </Dialog.Title>
              <Dialog.Content>
                <Paragraph>
                  This will permanently delete this planter from your account
                </Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button
                  onPress={() => {
                    this.setState({modalVisible: false});
                    this.deletePlanter()
                      .then(r => this.goBack())
                      .catch(error => console.log(error));
                  }}>
                  Delete
                </Button>
                <Button onPress={() => this.setState({modalVisible: false})}>
                  Cancel
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </View>
      );
    }
  }
}

planterScreen.propTypes = {
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
      AddAvatarLink,
      addStreamUrl,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  withAuthenticator(planterScreen, false, [
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
    fontSize: 14,
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
    width: '100%',
    padding: -10,
    borderRadius: 5,
  },
  backgroundVideo: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: 100,
    width: '100%',
    height: 200,
    backgroundColor: '#D3D3D3',
  },
});
