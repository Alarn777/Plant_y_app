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
import {addUser} from '../../FriendActions';
import {bindActionCreators} from 'redux';
import {HeaderBackButton} from 'react-navigation-stack';

const plantyColor = '#6f9e04';

class planterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      userLoggedIn: true,
      userEmail: '',
      username: '',
      // width: 0,
      // height: 0,
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      // plants: this.props.navigation.getParam('item').plants,
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
      videoURL: '',
    };
    this.loadPlants = this.loadPlants.bind(this);
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
    // this.dealWithData = this.dealWithData.bind(this);
    // this.fetchUser = this.fetchUser.bind(this);
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
    // console.log('componentDidUpdate');
    // console.log(this.props.navigation.getParam('plantWasAdded'));
    if (this.props.navigation.getParam('plantWasAdded')) {
      this.loadPlants()
        .then()
        .catch();
      this.props.navigation.setParams({plantWasAdded: false});
    }
  }

  UNSAFE_componentWillMount(): void {
    console.log('componentWillMount');
    this.loadUrl()
      .then()
      .catch();
  }

  componentDidMount(): void {
    console.log('componentDidMount');
    // console.log(
    //   this.props.plantyData.myCognitoUser.signInUserSession.idToken.jwtToken,
    // );
    // let USER_TOKEN = this.props.plantyData.signInUserSession.idToken.jwtToken;
    // //
    // console.log(USER_TOKEN);
    // const {authState, authData} = this.props;
    // const user = authData;
    // if (user) {
    //   const {usernameAttributes = []} = this.props;
    //   if (usernameAttributes === 'email') {
    //     // Email as Username
    //     this.setState({
    //       username: user.attributes ? user.attributes.email : user.username,
    //     });
    //   }
    //
    //   this.setState({username: user.username});
    // } else this.setState({username: 'Guest'});

    this.loadPlants()
      .then()
      .catch(e => console.log(e));

    // this.props.addUser(user);
  }

  // dealWithData = user => {
  //   //add to redux
  //
  //   this.setState({user});
  //   if (this.state.user) this.setState({userLoggedIn: true});
  // };

  //maybe post is needed (this.props.navigation.getParam('item').stream)
  async loadUrl() {
    console.log('loadstreamUrl');
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);

    await axios
      .get(Consts.apigatewayRoute + '/streams', {
        headers: {Authorization: AuthStr},
      })
      .then(response => {
        // If request is good...
        // console.log(response.data);
        this.setState({videoURL: response.data.HLSStreamingSessionURL});
        this.setState({
          videoErrorObj: {videoErrorFlag: false, videoErrorMessage: ''},
        });
        this.forceUpdate();

        // this.dealWithUrlData(response.data);
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
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        // If request is good...
        // console.log(response.data);
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

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }

  _keyExtractor = item => item.UUID;

  _renderItem = ({item}) => {
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
                  })
                }>
                <Image style={styles.headerImage} source={{uri: item.pic}} />
              </TouchableOpacity>
            );
          }}
          // style={{width: this.state.width / 3 - 5, margin: 1}}
          style={{width: this.state.width / 3, padding: 3}}
          index={item.id}
          key={item.id}>
          <TouchableOpacity
            onPress={() =>
              this.props.navigation.navigate('PlantScreen', {
                item: item,
                user_token: this.state.USER_TOKEN,
              })
            }>
            <Text style={styles.partyText}>{item.name}</Text>
          </TouchableOpacity>
        </Card>
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
    if (this.state.plants.length > 0) {
      return (
        <View style={styles.container} onLayout={this.onLayout}>
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Planter: {this.props.navigation.getParam('item').name}
            </Text>
          </View>
          <PaperCard>
            <PaperCard.Title
              title={
                <Text style={styles.mainText}>
                  {'Climate:' + this.props.navigation.getParam('item').climate}
                </Text>
              }
            />
            <PaperCard.Content>
              <Video
                source={{uri: this.state.videoURL}} // Can be a URL or a local file.
                ref={ref => {
                  this.player = ref;
                }} // Store reference
                resizeMode="stretch"
                controls={true}
                onBuffer={this.loadBuffering} // Callback when remote video is buffering
                // onError={this.videoError}

                onError={this.videoError} // Callback when video cannot be loaded
                style={styles.backgroundVideo}
                minLoadRetryCount={10000}
                paused={true}
              />

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
                  icon="arrow-left"
                  color={plantyColor}
                  size={40}
                  onPress={() => console.log('Pressed camera')}
                />
                <IconButton
                  icon="camera"
                  color={plantyColor}
                  size={40}
                  onPress={() => console.log('Pressed left')}
                />
                <IconButton
                  icon="arrow-right"
                  color={plantyColor}
                  size={40}
                  onPress={() => console.log('Pressed right')}
                />
              </View>
              <Text style={styles.headerText}>Plants in Planter</Text>
            </PaperCard.Actions>
          </PaperCard>
          {/*<PaperCard>*/}
          {/*  <PaperCard.Title*/}
          {/*    title={<Text style={styles.headerText}>Plants in Planter</Text>}*/}
          {/*  />*/}
          {/*</PaperCard>*/}
          <ScrollView style={styles.data}>
            <FlatList
              vertical={true}
              scrollEnabled={false}
              numColumns={3}
              // style={{width: this.state.width, margin: 5}}
              data={this.state.plants}
              keyExtractor={this._keyExtractor}
              renderItem={this._renderItem}
            />
          </ScrollView>
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              // width: 50,

              backgroundColor: '#6f9e04',
              color: '#6f9e04',
              right: 0,
              // top: height - 200,
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
              // width: 50,

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
            />
            <PaperCard.Content>
              <Text>Planter is empty now, add some plants</Text>
            </PaperCard.Content>
          </PaperCard>
          <FAB
            style={
              //styles.fab
              {
                position: 'absolute',
                margin: 16,
                // width: 50,

                backgroundColor: plantyColor,
                color: plantyColor,
                right: 0,
                bottom: 10,
              }
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

        // <Text style={{flex: 1}}>No Plants in your garden</Text>
        // <ActivityIndicator
        //   style={{flex: 1}}
        //   animating={true}
        //   color={'#6f9e04'}
        // />
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
    width: '100%',
    height: 200,
    backgroundColor: '#D3D3D3',
  },
});
