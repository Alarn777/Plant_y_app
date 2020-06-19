import React from 'react';
import {Image, View, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {Icon, Text, Card} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {Button, Card as PaperCard} from 'react-native-paper';

//redux
import {connect} from 'react-redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink} from '../../FriendActions';
import {Storage} from 'aws-amplify';
import WS from '../../websocket';
import {Logger} from '../../Logger';
const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

class Picture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plant: this.props.navigation.getParam('picture'),
      URL: '',
      planterName: this.props.navigation.getParam('planterName'),
      loadBuffering: false,
      loading: false,
      deletingPic: false,
      testingPlantText: 'Health Evaluation',
      testingPlant: false,
      testingPlanticon: 'clipboard-play-outline',
      healthStatus: 0,
      plant_tested: false,
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    };

    WS.onMessage(data => {
      // console.log('GOT in Picture screen', data.data);

      let instructions = data.data.split(';');
      if (instructions.length > 2)
        switch (instructions[2]) {
          case 'IMAGE_STATUS':
            if (instructions[4] === 'FAILED') {
              break;
            }

            let sick = 0;
            if (instructions[4] === 'sick') sick = 100;
            else sick = 0.0;
            this.setState({healthStatus: 100 - sick});
            this.successTesting();
            break;
          default:
            break;
        }
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
          title="My Garden"
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

  //left in case we need to roll back to aws-rekognition
  async checkPlantHealth() {
    this.setState({testingPlantText: 'Testing...'});
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);

    //recognition
    await axios
      .post(
        Consts.apigatewayRoute + '/testPlantPicture',
        {
          key: this.props.navigation.getParam('picture').key,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        let labels_array = response.data.body.CustomLabels;

        let sick = 0.0;
        labels_array.map(one => {
          if (one.Name === 'sick') {
            sick = parseFloat(one.Confidence);
          }
        });
        this.setState({healthStatus: 100 - sick});

        this.successTesting();
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'checkPlantHealth',
        );
        this.failureTesting();
        console.log(e);
      });
  }

  async deletePicture() {
    this.setState({deletingPic: true});
    let pictureKey = this.props.navigation.getParam('picture').key;
    Storage.remove(pictureKey, {level: 'public'})
      .then(result => {
        //dynamoDB
        let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
          .idToken.jwtToken;

        const AuthStr = 'Bearer '.concat(USER_TOKEN);
        axios
          .post(
            Consts.apigatewayRoute + '/getPlanterPictures',
            {
              username: this.props.plantyData.myCognitoUser.username,
              mode: 'delete',
              UUID: this.state.plant.UUID,
            },
            {
              headers: {Authorization: AuthStr},
            },
          )
          .then(response => {
            this.setState({deletingPic: true});
          })
          .catch(e => {
            Logger.saveLogs(
              this.props.plantyData.myCognitoUser.username,
              e.toString(),
              'deletePicture-dynamoDB',
            );
            console.log(e);
          });
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'deletePicture - s3',
        );
        this.setState({deletingPic: false});
        console.log(e);
      });
  }

  goBack = () => {
    this.props.navigation.navigate('planterImagesGallery', {
      picWasRemoved: true,
    });
  };

  successTesting = () => {
    this.setState({
      testingPlant: false,
      plant_tested: true,
      testingPlanticon: 'check',
      testingPlantText: 'Test Successful',
    });
    setTimeout(this.changeBack, 5000);
  };

  changeBack = () => {
    this.setState({
      plant_tested: false,
      testingPlantText: 'Test',
      testingPlant: false,
      testingPlanticon: 'clipboard-play-outline',
    });
  };

  failureTesting = () => {
    this.setState({
      testingPlant: false,
      testingPlanticon: 'alert-circle-outline',
      testingPlantText: 'Failed to test',
    });
  };

  renderTestResults = () => {
    let color = plantyColor;
    if (this.state.healthStatus < 50) {
      color = 'red';
    }

    if (!this.state.plant_tested) {
      return <View style={styles.linearGradient} />;
    } else
      return (
        <View>
          {this.state.healthStatus === 100 ? (
            <View>
              <Text
                style={{
                  color: plantyColor,
                  alignSelf: 'center',
                  margin: 9,
                  height: 20,
                }}>
                Good job, your plant looks healthy!
              </Text>
              <Icon
                style={{width: 40, height: 40, alignSelf: 'center'}}
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
                  height: 20,
                }}>
                Please tend to your plant!
              </Text>
              <Icon
                style={{width: 40, height: 40, alignSelf: 'center'}}
                fill={errorColor}
                name="alert-circle-outline"
              />
            </View>
          )}
        </View>
      );
  };

  render() {
    return (
      <ScrollView
        style={{
          flex: 1,
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
          position: 'relative',
        }}>
        <PaperCard style={{height: this.state.height, margin: '1%'}}>
          <PaperCard.Content style={{marginTop: 10}}>
            <Image
              style={{
                height: 285,
                resizeMode: 'contain',
                backgroundColor: 'gray',
              }}
              source={{uri: this.props.navigation.getParam('picture').url}}
            />
            <View style={styles.metadata}>
              <Text style={styles.metadataText}>
                Date and time: {this.state.plant.timestamp}
              </Text>
              <Text style={styles.metadataText}>
                Temperature: {this.state.plant.temperature}C
              </Text>
              <Text style={styles.metadataText}>UV: {this.state.plant.UV}</Text>
              <Text style={styles.metadataText}>
                Humidity:{' '}
                {Math.floor(parseFloat(this.state.plant.humidity * 100))}%
              </Text>
            </View>
            {this.renderTestResults()}
            <Button
              icon={this.state.testingPlanticon}
              style={{margin: 10}}
              loading={this.state.testingPlant}
              mode="outlined"
              backgroundColor="#6f9e04"
              color="#6f9e04"
              onPress={() => {
                this.setState({testingPlant: true});
                WS.sendMessage(
                  'FROM_CLIENT;PHONE' +
                    ';CHECK_IMAGE;' +
                    this.props.navigation.getParam('picture').key +
                    ';;',
                );
              }}>
              {this.state.testingPlantText}
            </Button>
            <Button
              icon="delete"
              style={{margin: 10}}
              loading={this.state.deletingPic}
              mode="outlined"
              backgroundColor="#6f9e04"
              color="#6f9e04"
              onPress={() => {
                this.deletePicture()
                  .then(setTimeout(this.goBack, 500))
                  .catch();
              }}>
              Delete picture
            </Button>
          </PaperCard.Content>
        </PaperCard>
      </ScrollView>
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
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Picture);

let styles = StyleSheet.create({
  sickHealthy: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  backgroundVideo: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: 200,
  },
  container: {
    flex: 1,
    margin: '1%',
  },
  mainText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    backgroundColor: plantyColor,
    color: plantyColor,
    borderColor: plantyColor,
  },
  headerImage: {
    flex: 1,
    height: 100,
  },
  linearGradient: {},
  buttonText: {
    fontSize: 100,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    position: 'relative',
    color: 'black',
    backgroundColor: 'transparent',
  },
  metadata: {
    borderColor: plantyColor,
    borderWidth: 1,
    marginTop: 5,
    padding: 5,
    borderRadius: 3,
  },
  metadataText: {
    fontSize: 16,
    color: plantyColor,
  },
});
