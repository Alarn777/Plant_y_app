import React from 'react';
import {
  Image,
  View,
  FlatList,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Auth} from 'aws-amplify';
import data from '../../ENV_VARS';
import Amplify, {Storage} from 'aws-amplify';
import PropTypes from 'prop-types';
import {StyleSheet} from 'react-native';
import {Icon, Text, Card, Spinner} from '@ui-kitten/components';
import {
  FAB,
  Title,
  Card as PaperCard,
  Paragraph,
  Avatar,
  ActivityIndicator,
  Colors,
  Chip,
  Button,
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
import AmplifyTheme from '../AmplifyTheme';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import Video from 'react-native-video';
import connect from 'react-redux/lib/connect/connect';
import {AddAvatarLink, addStreamUrl, addUser} from '../../FriendActions';
import {bindActionCreators} from 'redux';
import {HeaderBackButton} from 'react-navigation-stack';
import RNFS from 'react-native-fs';
import Buffer from 'buffer';

const plantyColor = '#6f9e04';

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
      loading: true,
      streamUrl: '',
      loadingActions: false,
    };
    this.loadPlants = this.loadPlants.bind(this);
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    this.onLayout = this.onLayout.bind(this);
  }

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
  }

  componentWillUnmount(): void {}

  UNSAFE_componentWillMount(): void {
    // this.loadUrl()
    //   .then(() => this.forceUpdate())
    //   .catch();
  }

  componentDidMount(): void {
    this.loadUrl()
      .then()
      .catch(e => console.log(e));
    // this.setState({
    //   streamUrl:
    //     'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
    // });

    this.loadPlants()
      .then()
      .catch(e => console.log(e));
  }

  async loadUrl() {
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
          // console.log(this.props.plantyData);
          if (
            this.props.plantyData.streamUrl === undefined ||
            this.props.plantyData.streamUrl === null
          ) {
            console.log('SETTING URL');
            console.log(response.data);

            this.addUrl(response.data.HLSStreamingSessionURL);
            // this.setState({videoUrl: this.props.plantyData.streamUrl});
            // this.setState({videoUrl: response.data.HLSStreamingSessionURL});
            // this.setState({videoUrl: response.data.HLSStreamingSessionURL});
          } else {
            console.log('NOT SETTING URL');
            console.log(response.data);
            this.setState({streamUrl: this.props.plantyData.streamUrl});
          }
        } else {
          console.log('No stream data URL');
          console.log(response);

          // this.setState({videoUrl: ''});
          // this.props.addStreamUrl(null);

          // this.setState({videoUrl: response.data.HLSStreamingSessionURL});
          // else this.setState({videoUrl: this.props.plantyData.streamUrl});

          // this.setState({
          //   videoErrorObj: {videoErrorFlag: false, videoErrorMessage: ''},
          // });
        }
      })
      .catch(error => {
        console.log('error ' + error);

        this.setState({
          videoErrorObj: {
            videoErrorFlag: true,
            videoErrorMessage: error.errorMessage,
          },
        });
      });
  }

  addUrl = url => {
    console.log(url);
    this.props.addStreamUrl(url);
    this.setState({streamUrl: this.props.plantyData.streamUrl});

    this.btnRef = React.createRef();

    this.forceUpdate();
    this.forceUpdate();
    this.forceUpdate();
  };

  async loadPlants() {
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
      .catch(error => {
        console.log('error ' + error);
      });
  }

  dealWithPlantsData = plants => {
    if (plants) {
      this.setState({plants: plants});
    } else this.setState({plants: []});
    this.setState({loading: false});
  };

  async sendAction(action) {
    this.setState({loadingActions: true});
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/sendMessageToQueue',
        {
          username: this.props.authData.username,
          action: action,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.setState({loadingActions: false});
      })
      .catch(error => {
        this.setState({loadingActions: false});
        console.log('error ' + error);
      });
  }

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
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.setState({loadingActions: false});
      })
      .catch(error => {
        this.setState({loadingActions: false});
        console.log('error ' + error);
      });
  }

  uploadImage = uri => {
    this.setState({loadingActions: true});
    let timestamp = new Date().toISOString();
    timestamp = timestamp.replace('.', '');

    RNFS.readFile(uri, 'base64')
      .then(fileData => {
        const bufferedImageData = new Buffer.Buffer(fileData, 'base64');
        let uploadedImageKey =
          this.props.plantyData.myCognitoUser.username +
          '/' +
          this.props.navigation.getParam('item').name +
          '/' +
          timestamp +
          '_capture.jpg';

        Storage.put(uploadedImageKey, bufferedImageData, {
          contentType: 'image/jpg',
          level: 'public',
        })
          .then(result => {
            console.log(result);
            this.setState({loadingActions: false});
          })
          .catch(error => {
            console.log(error);
            this.setState({loadingActions: false});
          });
      })
      .catch(error => {
        console.log(error);
        this.setState({loadingActions: false});
      });
  };

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
        <Card
          header={() => {
            return (
              <TouchableOpacity
                onPress={() =>
                  this.props.navigation.navigate('PlantScreen', {
                    item: item,
                    user_token: this.state.USER_TOKEN,
                    planterName: this.props.navigation.getParam('item').name,
                    planterUUID: this.props.navigation.getParam('item').UUID,
                  })
                }>
                <Image style={styles.headerImage} source={{uri: url}} />
              </TouchableOpacity>
            );
          }}
          style={{width: this.state.width / 3, padding: 3}}
          index={item.id}
          key={item.id}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('PlantScreen', {
                item: item,
                user_token: this.state.USER_TOKEN,
                planterName: this.props.navigation.getParam('item').name,
                planterUUID: this.props.navigation.getParam('item').UUID,
              })
            }>
            <Text style={styles.partyText}>{item.name}</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  };

  loadBuffering = () => {
    console.log('loadBuffering');
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

  videoError = () => {
    return (
      <View>
        <Text syle={{color: 'red'}}>Error loading Video</Text>
      </View>
    );
  };

  showVideoError = () => {
    if (this.state.videoErrorObj.videoErrorFlag)
      return (
        <View>
          <Text syle={{color: 'red'}}>
            {this.state.videoErrorObj.videoErrorMessage}
          </Text>
        </View>
      );
    else return <View />;
  };

  renderVideo = () => {
    if (
      this.state.streamUrl === '' ||
      this.state.streamUrl === undefined ||
      this.state.streamUrl === null
    ) {
      return <ActivityIndicator size="large" color={plantyColor} />;
    } else
      return (
        <Video
          source={{uri: this.state.streamUrl, type: 'm3u8'}} // Can be a URL or a local file.
          ref={ref => {
            this.player = ref;
          }} // Store reference
          resizeMode="stretch"
          paused={false}
          controls={true}
          onBuffer={this.loadBuffering} // Callback when remote video is buffering
          onError={this.videoError} // Callback when video cannot be loaded
          style={styles.backgroundVideo}
          minLoadRetryCount={10}
        />
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
      );
    }

    let height = this.state.height;
    if (this.state.plants.length > 0) {
      // let refToCapture = this.btnRef;
      return (
        <View style={styles.container} onLayout={this.onLayout}>
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
              <Text style={styles.mainText}>Camera Controllers</Text>
              <View
                style={{
                  // flex:
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  padding: 8,
                }}>
                <IconButton
                  icon={this.state.loadingActions ? 'reload' : 'arrow-left'}
                  color={plantyColor}
                  disabled={this.state.loadingActions || !this.state.streamUrl}
                  size={40}
                  onPress={() => {
                    this.sendAction('left')
                      .then(r => console.log())
                      .catch(error => console.log(error));
                  }}
                />
                <IconButton
                  icon={this.state.loadingActions ? 'reload' : 'camera'}
                  color={plantyColor}
                  size={40}
                  disabled={this.state.loadingActions || !this.state.streamUrl}
                  // onPress={this.takeScreenShot}

                  // onPress={() => {
                  //   console.log('capture');
                  //   this.btnRef.current.capture().then(uri => {
                  //     this.uploadImage(uri);
                  //   });
                  // }}

                  onPress={() => {
                    this.takePicture()
                      .then(r => console.log())
                      .catch(error => console.log(error));
                  }}
                />
                <IconButton
                  icon={this.state.loadingActions ? 'reload' : 'arrow-right'}
                  color={plantyColor}
                  size={40}
                  disabled={this.state.loadingActions || !this.state.streamUrl}
                  onPress={() => {
                    this.sendAction('right')
                      .then(r => console.log())
                      .catch(error => console.log(error));
                  }}
                />
              </View>
              <Text style={styles.headerText}>Plants in Planter</Text>
            </PaperCard.Actions>
          </PaperCard>
          <ScrollView style={styles.data}>
            <FlatList
              vertical={true}
              scrollEnabled={false}
              numColumns={3}
              data={this.state.plants}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
          </ScrollView>
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              backgroundColor: '#6f9e04',
              color: '#6f9e04',
              right: 0,
              bottom: 10,
            }}
            large
            icon="plus"
            onPress={() =>
              this.props.navigation.navigate('AllAvailablePlants', {
                user_token: this.state.USER_TOKEN,
                // item: this.props.navigation.getParam('item'),
                planterName: this.props.navigation.getParam('item').name,
                loadPlanters: this.props.navigation.getParam('loadPlanters'),
              })
            }
          />
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              backgroundColor: '#6f9e04',
              color: '#6f9e04',
              left: 0,
              bottom: 14,
            }}
            label="Adjust Conditions"
            lage
            icon="pencil"
            onPress={() =>
              this.props.navigation.navigate('AdjustPlantConditions', {
                user_token: this.state.USER_TOKEN,
                item: this.props.navigation.getParam('item'),
              })
            }
          />
        </View>
      );
    } else {
      return (
        <View style={styles.container} onLayout={this.onLayout}>
          <PaperCard>
            <PaperCard.Title
              title={'Planter:' + this.props.navigation.getParam('item').name}
              subtitle={
                'Status: ' +
                this.props.navigation.getParam('item').planterStatus
              }
            />
            <PaperCard.Content>
              {this.props.navigation.getParam('item').planterStatus ===
              'pending' ? (
                <Text>We are preparing your planter...</Text>
              ) : (
                <Text>Planter is empty now, add some plants</Text>
              )}
            </PaperCard.Content>
          </PaperCard>
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              backgroundColor: plantyColor,
              color: plantyColor,
              right: 0,
              bottom: 10,
            }}
            disabled={
              this.props.navigation.getParam('item').planterStatus === 'pending'
            }
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
    flexDirection: 'row',
  },
  headerImage: {
    flex: 1,
    // margin: 10,
    height: 100,
    // width: 100,
  },
  backgroundVideo: {
    // position: 'absolute',
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
