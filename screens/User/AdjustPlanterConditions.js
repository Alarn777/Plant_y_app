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
  Text,
  Provider,
  Button,
  TextInput,
  Switch,
  Badge,
  Snackbar,
  Divider,
  ToggleButton,
  FAB,
  Paragraph,
  Dialog,
  Portal,
  TouchableRipple,
} from 'react-native-paper';
import {Layout, Modal} from '@ui-kitten/components';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SafeAreaView from 'react-native-safe-area-view';
import Consts from '../../ENV_VARS';
import axios from 'axios';
import {addAction, AddAvatarLink, sendMessage} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
import Chip from 'react-native-paper/src/components/Chip';
import WS from '../../websocket';

const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

class AdjustPlanterConditions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.navigation.getParam('USER_TOKEN'),
      item: this.props.navigation.getParam('item'),
      modalVisible: false,
      height: Dimensions.get('window').height,
      toEdit: '',
      temperature: '24',
      uv: '1000',
      humidity: '50',
      manualMode: false,
      deletingPlanter: false,
      waterTurnedOn: false,
      lightTurnedOn: false,
    };

    WS.onMessage(data => {
      console.log('GOT in adjust screen', data);

      // or something else or use redux
      // dispatch({type: 'MyType', payload: data});
    });
  }
  componentDidMount(): void {
    // console.log(this.state.user);
  }

  adjustValueOnPlanter() {
    //do request to AWS lambda
  }

  socketAction = () => {
    console.log('socket action in adjust plants');
  };

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

  async deletePlanter() {
    this.setState({deletingPlanter: true});

    console.log('In deleting Planter');
    // console.log(this.props.navigation);
    const AuthStr = 'Bearer '.concat(
      this.props.plantyData.myCognitoUser.signInUserSession.idToken.jwtToken,
    );

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

  _showDialog = () => this.setState({modalVisible: true});

  _hideDialog = () => {
    this.setState({modalVisible: false});
    this.deletePlanter()
      .then(r => this.goBack())
      .catch(error => console.log(error));
  };

  failureDeleting = () => {
    this.setState({
      deletingPlanter: false,
      // deletingPlanticon: 'alert-circle-outline',
      // deletingPlantText: 'Failed to delete',
      // deletingPlantDisabled: true,
    });
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
          // padding: 8,
        }}>
        <Text style={styles.actionsText}>Manual controls</Text>
        <Switch
          value={this.state.manualMode}
          onValueChange={() => {
            this.setState({manualMode: !this.state.manualMode});
          }}
        />
      </View>
    );
  };

  renderWaterControl = () => {
    return (
      <View
        style={{
          // flex:
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginTop: 10,
        }}>
        <Chip style={{backgroundColor: 'white'}} icon="water-pump">
          Turn on water supply
        </Chip>
        {/*<Text style={styles.actionsText}>Turn on water supply</Text>*/}
        <Button
          mode="outlined"
          onPress={() => {
            WS.sendMessage(
              'FROM_CLIENT;' +
                this.state.item.name.toLowerCase() +
                ';ADD_WATER',
            );
          }}>
          Add water
        </Button>
        {/*<Switch*/}
        {/*  value={this.state.waterTurnedOn}*/}
        {/*  onValueChange={() => {*/}
        {/*    let action = !this.state.waterTurnedOn ? 'on' : 'off';*/}

        {/*    // let message = 'job=water=action=' + action;*/}
        {/*    // console.log(message);*/}
        {/*    // this.props.sendMessage(message);*/}
        {/*    // console.log(this.props.plantyData.socket);*/}

        {/*    from_client;*/}
        {/*    planterUUID;*/}
        {/*    UV_LAMP_OFF;*/}
        {/*    WS.sendMessage(*/}
        {/*      'from_client;' +*/}
        {/*        this.state.item.name.toLowerCase() +*/}
        {/*        '=job=water=action=' +*/}
        {/*        action,*/}
        {/*    );*/}

        {/*    // this.props.plantyData.socket.json({*/}
        {/*    //   message: 'job=water=action=' + action,*/}
        {/*    //   action: 'message',*/}
        {/*    // });*/}

        {/*    // this.setState({waterTurnedOn: !this.state.waterTurnedOn});*/}
        {/*  }}*/}
        {/*/>*/}
      </View>
    );
  };

  renderLightControl = () => {
    return (
      <View
        style={{
          // flex:
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginTop: 10,
          // padding: 8,
        }}>
        <Chip style={{backgroundColor: 'white'}} icon="ceiling-light">
          Turn on light
        </Chip>
        <Switch
          value={this.state.lightTurnedOn}
          onValueChange={() => {
            let action = !this.state.lightTurnedOn ? 'on' : 'off';

            WS.sendMessage(
              'FROM_CLIENT;' +
                this.state.item.name.toLowerCase() +
                ';UV_LAMP_' +
                action.toUpperCase(),
            );

            this.setState({lightTurnedOn: !this.state.lightTurnedOn});
          }}
        />
      </View>
    );
  };

  renderTemperatureControl = () => {
    return (
      <View
        style={{
          // flex:
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginTop: 10,
          // padding: 8,
        }}>
        <Chip
          style={{paddingTop: 10, paddingBottom: 5, backgroundColor: 'white'}}
          icon="temperature-celsius">
          Adjust temperature
        </Chip>

        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: 10,
            marginTop: 10,
            // padding: 8,
          }}>
          <FAB
            style={styles.fab}
            small
            icon="minus"
            onPress={() => {
              // this.props.plantyData.socket.json({
              //   message: 'job=temperature=action=minus',
              //   action: 'message',
              // });

              WS.sendMessage(
                'FROM_CLIENT;' +
                  this.state.item.name.toLowerCase() +
                  ';INCREASE_TEMP',
              );

              // this.forceUpdate();
              // this.setState({lightTurnedOn: !this.state.lightTurnedOn});
            }}
          />
          <Text style={{padding: 10}}>12</Text>
          <FAB
            style={styles.fab}
            small
            icon="plus"
            onPress={() => {
              // this.props.plantyData.socket.json({
              //   message: 'job=temperature=action=plus',
              //   action: 'message',
              // });

              WS.sendMessage(
                'FROM_CLIENT;' +
                  this.state.item.name.toLowerCase() +
                  ';DECREASE_TEMP',
              );

              // this.forceUpdate();
              // this.setState({lightTurnedOn: !this.state.lightTurnedOn});
            }}
          />
        </View>
      </View>
    );
  };

  render() {
    // console.log(this.props.plantyData);

    if (this.state.manualMode) {
      return (
        <KeyboardAwareScrollView style={{margin: '1%', width: '98%'}}>
          <Portal>
            <Snackbar
              style={{position: 'absolute', bottom: 15, borderRadius: 5}}
              visible={this.state.lightTurnedOn}
              onDismiss={() => this.setState({lightTurnedOn: false})}
              action={{
                label: 'Undo',
                onPress: () => {
                  // Do something
                },
              }}>
              Hey there! I'm a Snackbar.
            </Snackbar>
          </Portal>
          <PaperCard>
            <PaperCard.Title
              title={'Planter: ' + this.state.item.name}
              subtitle={'Climate: ' + this.state.item.climate}
            />

            <PaperCard.Content>
              <Text style={{marginBottom: 10}}>
                {'Description: ' + this.state.item.description}
              </Text>
              {/*<Text>{'Climate: ' + this.state.item.climate}</Text>*/}
              {/*<Text style={{fontWeight: 'bold'}}>*/}
              {/*  {this.state.item.climate}*/}
              {/*</Text>*/}
              {this.renderAutomation()}
              <Text
                style={{
                  marginTop: 10,
                  borderColor: errorColor,
                  borderWidth: 1,
                  color: errorColor,
                  padding: 10,
                  borderRadius: 3,
                }}>
                {"Your actions will now influence the planter's condition"}
              </Text>
            </PaperCard.Content>
          </PaperCard>
          <PaperCard style={{marginTop: 5}}>
            <PaperCard.Title
              title={'Actions'}
              // subtitle="Card Subtitle"
            />
            <PaperCard.Content>
              {/*{this.renderAutomation()}*/}
              {/*{this.renderTemperatureInput()}*/}
              {/*{this.renderHumidityInput()}*/}

              {this.renderWaterControl()}
              <Divider />
              {this.renderLightControl()}
              <Divider />
              {this.renderTemperatureControl()}
              <Button
                icon="delete"
                mode="outlined"
                loading={this.state.deletingPlanter}
                onPress={() => {
                  this._showDialog();

                  // this.deletePlanter()
                  //   .then(r => this.goBack())
                  //   .catch(error => console.log(error));
                }}>
                Delete planter
              </Button>
            </PaperCard.Content>
          </PaperCard>
          <Portal>
            <Dialog
              visible={this.state.modalVisible}
              onDismiss={() => this.setState({modalVisible: false})}>
              <Dialog.Title>
                Delete planter {this.state.item.name}?
              </Dialog.Title>
              <Dialog.Content>
                <Paragraph>
                  This will permanently delete this planter from your account
                </Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={this._hideDialog}>Delete</Button>
                <Button onPress={() => this.setState({modalVisible: false})}>
                  Cancel
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </KeyboardAwareScrollView>
      );
    }

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
          <PaperCard>
            <PaperCard.Title
              title={'Planter: ' + this.state.item.name}
              subtitle={'Climate: ' + this.state.item.climate}
            />
            <PaperCard.Content>
              <Text style={{marginBottom: 10}}>
                {'Description: ' + this.state.item.description}
              </Text>
              {/*<Text>{'Climate: ' + this.state.item.climate}</Text>*/}
              {/*<Text style={{fontWeight: 'bold'}}>*/}
              {/*  {this.state.item.climate}*/}
              {/*</Text>*/}
              {this.renderAutomation()}
            </PaperCard.Content>
          </PaperCard>
          <PaperCard style={{marginTop: 5}}>
            <PaperCard.Title
              title={'Actions'}
              // subtitle="Card Subtitle"
            />
            <PaperCard.Content>
              {/*{this.renderAutomation()}*/}
              {this.renderTemperatureInput()}
              <Divider />
              {this.renderHumidityInput()}
              <Divider />
              {this.renderUVInput()}

              <Button
                icon="delete"
                mode="outlined"
                loading={this.state.deletingPlanter}
                onPress={() => {
                  this._showDialog();
                  // this.deletePlanter()
                  //   .then(r => this.goBack())
                  //   .catch(error => console.log(error));
                }}>
                Delete planter
              </Button>
            </PaperCard.Content>
          </PaperCard>
          <Portal>
            <Dialog
              visible={this.state.modalVisible}
              onDismiss={() => this.setState({modalVisible: false})}>
              <Dialog.Title>
                Delete planter {this.state.item.name}?
              </Dialog.Title>
              <Dialog.Content>
                <Paragraph>
                  This will permanently delete this planter from your account
                </Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={this._hideDialog}>Delete</Button>
                <Button onPress={() => this.setState({modalVisible: false})}>
                  Cancel
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
          <View style={styles.container} />
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
      sendMessage,
      addAction,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdjustPlanterConditions);

//graph

//
// <LineChart
//     data={{
//         labels: [
//             'January',
//             'February',
//             'March',
//             'April',
//             'May',
//             'June',
//         ],
//         datasets: [
//             {
//                 data: [
//                     Math.random() * 100,
//                     Math.random() * 100,
//                     Math.random() * 100,
//                     Math.random() * 100,
//                     Math.random() * 100,
//                     Math.random() * 100,
//                 ],
//             },
//         ],
//     }}
//     width={Dimensions.get('window').width - 50} // from react-native
//     height={210}
//     yAxisLabel="$"
//     yAxisSuffix="k"
//     yAxisInterval={1} // optional, defaults to 1
//     chartConfig={{
//         // backgroundColor: '#e26a00',
//         // backgroundGradientFrom: '#fb8c00',
//         // backgroundGradientTo: '#ffa726',
//         decimalPlaces: 2, // optional, defaults to 2dp
//         color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
//         labelColor: (opacity = 1) =>
//             `rgba(255, 255, 255, ${opacity})`,
//         style: {
//             borderRadius: 16,
//         },
//         propsForDots: {
//             r: '6',
//             strokeWidth: '2',
//             // stroke: '#ffa726',
//         },
//     }}
//     bezier
//     style={{
//         margin: 5,
//         marginVertical: 8,
//         borderRadius: 16,
//     }}
// />
