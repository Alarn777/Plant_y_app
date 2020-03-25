/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {StyleSheet} from 'react-native';
// import {Provider} from 'react-redux';
import {bindActionCreators, createStore} from 'redux';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator, HeaderBackButton} from 'react-navigation-stack';
import {Image, TouchableOpacity, View, Dimensions} from 'react-native';
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
  IconButton,
  Portal,
  Text,
  Provider,
  Button,
  TextInput,
  Switch,
} from 'react-native-paper';
import {Layout, Modal} from '@ui-kitten/components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SafeAreaView from 'react-native-safe-area-view';
import Consts from '../../ENV_VARS';
import axios from 'axios';
import {AddAvatarLink} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';

const plantyColor = '#6f9e04';

class AdjustPlanterConditions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.navigation.getParam('USER_TOKEN'),
      item: this.props.navigation.getParam('item'),
      modalVisible: false,
      toEdit: '',
      temperature: '24',
      uv: '1000',
      humidity: '50',
      isSwitchOn: false,
      deletingPlanter: false,
    };
    // this.dealWithData = this.dealWithData.bind(this);
    // this.fetchUser = this.fetchUser.bind(this);
  }
  componentDidMount(): void {
    // console.log(this.state.user);
  }

  adjustValueOnPlanter() {
    //do request to AWS lambda
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

  renderHumidityInput() {
    if (this.state.toEdit === 'humidity') {
      return (
        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 8,
          }}>
          <Text style={styles.actionsText}>Current humidity:</Text>
          <TextInput
            style={{
              width: 100,
              height: 30,
            }}
            selectionColor={plantyColor}
            underlineColor={plantyColor}
            mode="outlined"
            label="New"
            value={this.state.humidity}
            onChangeText={inputValue => this.setState({humidity: inputValue})}
          />
          <IconButton
            icon="check"
            color={plantyColor}
            size={20}
            onPress={() => {
              this.adjustValueOnPlanter();
              this.setState({toEdit: ''});
            }}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 8,
          }}>
          <Text style={styles.actionsText}>Current humidity:</Text>
          <Text style={styles.actionsText}> {this.state.humidity}</Text>
          <IconButton
            icon="pencil"
            color={plantyColor}
            size={20}
            onPress={() => this.setState({toEdit: 'humidity'})}
          />
        </View>
      );
    }
  }

  renderTemperatureInput() {
    if (this.state.toEdit === 'temp') {
      return (
        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 8,
          }}>
          <Text style={styles.actionsText}>Current Temperature:</Text>
          <TextInput
            style={{
              width: 100,
              height: 30,
            }}
            selectionColor={plantyColor}
            underlineColor={plantyColor}
            mode="outlined"
            label="New"
            value={this.state.temperature}
            onChangeText={inputValue =>
              this.setState({temperature: inputValue})
            }
          />
          <IconButton
            icon="check"
            color={plantyColor}
            size={20}
            onPress={() => this.setState({toEdit: ''})}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 8,
          }}>
          <Text style={styles.actionsText}>Current Temperature:</Text>
          <Text style={styles.actionsText}> {this.state.temperature}</Text>
          <IconButton
            icon="pencil"
            color={plantyColor}
            size={20}
            onPress={() => this.setState({toEdit: 'temp'})}
          />
        </View>
      );
    }
  }

  renderUVInput() {
    if (this.state.toEdit === 'uv') {
      return (
        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 8,
          }}>
          <Text style={styles.actionsText}>Current UV:</Text>
          <TextInput
            style={{
              width: 100,
              height: 30,
            }}
            selectionColor={plantyColor}
            underlineColor={plantyColor}
            mode="outlined"
            label="New"
            value={this.state.uv}
            onChangeText={inputValue => this.setState({uv: inputValue})}
          />
          <IconButton
            icon="check"
            color={plantyColor}
            size={20}
            onPress={() => this.setState({toEdit: ''})}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 8,
          }}>
          <Text style={styles.actionsText}>Current UV:</Text>
          <Text style={styles.actionsText}> {this.state.uv}</Text>
          <IconButton
            icon="pencil"
            color={plantyColor}
            size={20}
            onPress={() => this.setState({toEdit: 'uv'})}
          />
        </View>
      );
    }
  }

  renderAutomation = () => {
    return (
      <View
        style={{
          // flex:
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          padding: 8,
        }}>
        <Text style={styles.actionsText}>Enable partial Automation</Text>
        <Switch
          value={this.state.isSwitchOn}
          onValueChange={() => {
            this.setState({isSwitchOn: !this.state.isSwitchOn});
          }}
        />
      </View>
    );
  };

  async deletePlanter() {
    // console.log(this.props.navigation.getParam('user').username);

    this.setState({deletingPlanter: true});

    // console.log(this.props.navigation.getParam('user').username);
    // console.log(this.state.planterName);
    // console.log(this.state.planterDescription);
    // console.log(this.state.selectedOption['text']);
    // console.log(this.state.USER_TOKEN);

    // console.log(
    //   this.props.plantyData.myCognitoUser.signInUserSession.accessToken
    //     .jwtToken,
    // );
    // return null;

    console.log('In deleting Planter');
    // console.log(this.props.navigation);
    const AuthStr = 'Bearer '.concat(
      this.props.plantyData.myCognitoUser.signInUserSession.idToken.jwtToken,
    );
    // console.log(AuthStr);
    // console.log(
    //   this.props.plantyData.myCognitoUser.signInUserSession.idToken.jwtToken,
    // );

    // console.log(Consts.apigatewayRoute + '/changeStatusOfPlanter');
    // console.log(this.props.plantyData.myCognitoUser.username);
    // console.log(Consts.apigatewayRoute + '/removePlantFromPlanter');
    // console.log(this.props.plantyData.myCognitoUser.username);
    // console.log(this.state.item.name);
    // console.log(this.state.item.UUID);
    await axios
      .post(
        Consts.apigatewayRoute + '/changeStatusOfPlanter',
        {
          username: this.props.plantyData.myCognitoUser.username,
          // planterName: this.state.item.name,
          planterUUID: this.state.item.UUID,
          planterStatus: 'inactive',
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        // If request is good...
        // console.log(response.data);
        // this.dealWithUrlData(response.data);
        console.log(response);
        this.successDeleting();
      })
      .catch(error => {
        this.failureDeleting();
        console.log('error ' + error);
      });

    // setTimeout(this.successDeleting, 1000);
    // setTimeout(this.failureAdding, 1000);
  }

  successDeleting = () => {
    this.setState({
      deletingPlanter: false,
      // deletingPlanticon: 'check',
      // deletingPlantText: 'Deleted',
      // deletingPlantDisabled: true,
    });
    setTimeout(this.goBack, 1000);

    // this.props.navigation.getParam('loadPlanters')();
  };

  goBack = () => {
    this.props.navigation.navigate('HomeScreenUser', {
      planterWasRemoved: true,
    });
  };

  failureDeleting = () => {
    this.setState({
      deletingPlanter: false,
      // deletingPlanticon: 'alert-circle-outline',
      // deletingPlantText: 'Failed to delete',
      // deletingPlantDisabled: true,
    });
  };

  render() {
    return (
      <View style={{margin: '1%', width: '98%'}}>
        <KeyboardAwareScrollView
          extraScrollHeight={30}
          // contentContainerStyle={{
          //   flex: 1,
          //   justifyContent: 'center',
          //   alignItems: 'center',
          //   height: '100%',
          //   width: '100%',
          // }}>
        >
          <Card>
            <PaperCard.Title
              title={this.state.item.name}
              // subtitle="Card Subtitle"
            />
            <PaperCard.Content>
              <Text>{this.state.item.description}</Text>
            </PaperCard.Content>
          </Card>
          <Card style={{marginTop: 5}}>
            <PaperCard.Content>
              <LineChart
                data={{
                  labels: [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                  ],
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
                width={Dimensions.get('window').width - 50} // from react-native
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
                  labelColor: (opacity = 1) =>
                    `rgba(255, 255, 255, ${opacity})`,
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
            </PaperCard.Content>
          </Card>
          <Card>
            <PaperCard.Title
              title={'Actions'}
              // subtitle="Card Subtitle"
            />
            <PaperCard.Content>
              {this.renderTemperatureInput()}
              {this.renderHumidityInput()}
              {this.renderUVInput()}
              {this.renderAutomation()}
              <Button
                icon="delete"
                mode="outlined"
                loading={this.state.deletingPlanter}
                onPress={() => {
                  this.deletePlanter()
                    .then(r => this.goBack())
                    .catch(error => console.log(error));
                }}>
                Delete planter
              </Button>
            </PaperCard.Content>
          </Card>
        </KeyboardAwareScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // minHeight: 500,
    padding: 25,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // width: 300,
    // height: 500,
    padding: 30,
  },
  modalText: {
    // justifyContent: 'center',
    // alignItems: 'center',
    // // width: '95%',
    // height: 20,
    // padding: 10,
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
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdjustPlanterConditions);
