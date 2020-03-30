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
  Title,
  Headline,
  Caption,
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

const data = {
  labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
    },
  ],
};

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#08130D',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
};

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
      temperatureMax: '35',
      uv: '1000',
      uvMax: '2000',
      humidity: '50',
      humidityMax: '100',
      manualMode: false,
      deletingPlanter: false,
      waterTurnedOn: false,
      lightTurnedOn: false,
      loadingLightTurnedOn: false,
      waterAdded: false,
      loadingAddingWater: false,
    };

    WS.onMessage(data => {
      console.log('GOT in adjust screen', data);

      let instructions = data.data.split(';');
      // "FROM_PLANTER;e0221623-fb88-4fbd-b524-6f0092463c93;WATER_ADDED"
      if (instructions.length > 2)
        switch (instructions[2]) {
          case 'WATER_ADDED':
            this.setState({waterAdded: true, loadingAddingWater: false});
            break;
          case 'UV_LAMP_IS_ON':
            this.setState({lightTurnedOn: true, loadingLightTurnedOn: false});
            break;
          case 'UV_LAMP_IS_OFF':
            this.setState({lightTurnedOn: false, loadingLightTurnedOn: false});
            break;
          case 'FAILED':
            alert('Failed to communicate with server');
            this.forceUpdate();
            break;
        }
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
          <Text style={styles.actionsText}>Min humidity:</Text>
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
          <Text style={styles.actionsText}>Min humidity:</Text>
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

  renderMaxHumidityInput() {
    if (this.state.toEdit === 'humidityMax') {
      return (
        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 8,
          }}>
          <Text style={styles.humidityMax}>Current humidity:</Text>
          <TextInput
            style={{
              width: 100,
              height: 30,
            }}
            selectionColor={plantyColor}
            underlineColor={plantyColor}
            mode="outlined"
            label="New"
            value={this.state.humidityMax}
            onChangeText={inputValue =>
              this.setState({humidityMax: inputValue})
            }
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
          <Text style={styles.actionsText}>Max humidity:</Text>
          <Text style={styles.actionsText}> {this.state.humidityMax}</Text>
          <IconButton
            icon="pencil"
            color={plantyColor}
            size={20}
            onPress={() => this.setState({toEdit: 'humidityMax'})}
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
          <Text style={styles.actionsText}>Min Temperature:</Text>
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
          <Text style={styles.actionsText}>Min Temperature:</Text>
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

  renderMaxTemperatureInput() {
    if (this.state.toEdit === 'tempMax') {
      return (
        <View
          style={{
            // flex:
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            padding: 8,
          }}>
          <Text style={styles.actionsText}>Max Temperature:</Text>
          <TextInput
            style={{
              width: 100,
              height: 30,
            }}
            selectionColor={plantyColor}
            underlineColor={plantyColor}
            mode="outlined"
            label="New"
            value={this.state.temperatureMax}
            onChangeText={inputValue =>
              this.setState({temperatureMax: inputValue})
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
          <Text style={styles.actionsText}>Max Temperature:</Text>
          <Text style={styles.actionsText}> {this.state.temperatureMax}</Text>
          <IconButton
            icon="pencil"
            color={plantyColor}
            size={20}
            onPress={() => this.setState({toEdit: 'tempMax'})}
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
          <Text style={styles.actionsText}>Min UV:</Text>
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
          <Text style={styles.actionsText}>Min UV:</Text>
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

  renderMaxUVInput() {
    if (this.state.toEdit === 'uvMax') {
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
            value={this.state.uvMax}
            onChangeText={inputValue => this.setState({uvMax: inputValue})}
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
          <Text style={styles.actionsText}>Max UV:</Text>
          <Text style={styles.actionsText}> {this.state.uvMax}</Text>
          <IconButton
            icon="pencil"
            color={plantyColor}
            size={20}
            onPress={() => this.setState({toEdit: 'uvMax'})}
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
          Add water to the planter
        </Chip>
        {/*<IconButton*/}
        {/*  icon="camera"*/}
        {/*  loading={true}*/}
        {/*  color={plantyColor}*/}
        {/*  size={20}*/}
        {/*  onPress={() => console.log('Pressed')}*/}
        {/*/>*/}
        <Button
          // mode="outlined"
          icon={'water'}
          color={'#42a5f5'}
          loading={this.state.loadingAddingWater}
          onPress={() => {
            this.setState({loadingAddingWater: true});
            // WS.sendMessage(
            //   'FROM_CLIENT;' + this.state.item.UUID + ';ADD_WATER',
            // );
          }}>
          Add
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
          Toggle light
        </Chip>
        <Button
          // mode="outlined"
          icon={'lightbulb'}
          color={!this.state.lightTurnedOn ? 'gray' : 'yellow'}
          loading={this.state.loadingLightTurnedOn}
          onPress={() => {
            let action = !this.state.lightTurnedOn ? 'on' : 'off';
            this.setState({loadingLightTurnedOn: true});
            WS.sendMessage(
              'FROM_CLIENT;' +
                this.state.item.UUID +
                ';UV_LAMP_' +
                action.toUpperCase(),
            );
          }}>
          {this.state.lightTurnedOn ? 'on' : 'off'}
        </Button>

        {/*<Switch*/}
        {/*  disabled={true}*/}
        {/*  value={this.state.lightTurnedOn}*/}
        {/*  onValueChange={() => {*/}
        {/*    let action = !this.state.lightTurnedOn ? 'on' : 'off';*/}

        {/*    WS.sendMessage(*/}
        {/*      'FROM_CLIENT;' +*/}
        {/*        this.state.item.UUID +*/}
        {/*        ';UV_LAMP_' +*/}
        {/*        action.toUpperCase(),*/}
        {/*    );*/}

        {/*    // this.setState({lightTurnedOn: !this.state.lightTurnedOn});*/}
        {/*  }}*/}
        {/*/>*/}
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
          }}>
          <FAB
            style={styles.fab}
            small
            icon="minus"
            onPress={() => {
              WS.sendMessage(
                'FROM_CLIENT;' + this.state.item.UUID + ';INCREASE_TEMP',
              );
              // this.setState({lightTurnedOn: !this.state.lightTurnedOn});
            }}
          />
          <Text
            style={{
              padding: 10,
              fontWeight: 'bold',
              color: 'gray',
              fontSize: 15,
            }}>
            12
          </Text>
          <FAB
            style={styles.fab}
            small
            icon="plus"
            onPress={() => {
              WS.sendMessage(
                'FROM_CLIENT;' + this.state.item.UUID + ';DECREASE_TEMP',
              );

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
          {/*<Portal>*/}
          {/*  <Snackbar*/}
          {/*    style={{position: 'absolute', bottom: 15, borderRadius: 5}}*/}
          {/*    visible={this.state.lightTurnedOn}*/}
          {/*    onDismiss={() => this.setState({lightTurnedOn: false})}*/}
          {/*    action={{*/}
          {/*      label: 'Undo',*/}
          {/*      onPress: () => {*/}
          {/*        // Do something*/}
          {/*      },*/}
          {/*    }}>*/}
          {/*    Hey there! I'm a Snackbar.*/}
          {/*  </Snackbar>*/}
          {/*</Portal>*/}
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
              {/*{this.renderAutomation()}*/}
              {/*<Text*/}
              {/*  style={{*/}
              {/*    marginTop: 10,*/}
              {/*    borderColor: errorColor,*/}
              {/*    borderWidth: 1,*/}
              {/*    color: errorColor,*/}
              {/*    padding: 10,*/}
              {/*    borderRadius: 3,*/}
              {/*  }}>*/}
              {/*  {"Your actions will now influence the planter's condition"}*/}
              {/*</Text>*/}
            </PaperCard.Content>
          </PaperCard>
          <PaperCard style={{marginTop: 5}}>
            <PaperCard.Content>
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
              {this.renderWaterControl()}
              <Divider />
              {this.renderLightControl()}
              <Divider />
              {this.renderTemperatureControl()}
              <Divider />
              {this.renderTemperatureInput()}
              <Divider />
              {this.renderMaxTemperatureInput()}
              <Divider />
              {this.renderHumidityInput()}
              <Divider />
              {this.renderMaxHumidityInput()}
              <Divider />
              {this.renderUVInput()}
              <Divider />
              {this.renderMaxUVInput()}
              <Divider />

              {/*<Button*/}
              {/*  icon="delete"*/}
              {/*  mode="outlined"*/}
              {/*  loading={this.state.deletingPlanter}*/}
              {/*  onPress={() => {*/}
              {/*    this._showDialog();*/}

              {/*    // this.deletePlanter()*/}
              {/*    //   .then(r => this.goBack())*/}
              {/*    //   .catch(error => console.log(error));*/}
              {/*  }}>*/}
              {/*  Delete planter*/}
              {/*</Button>*/}
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
          <Portal>
            <Dialog
              visible={this.state.waterAdded}
              onDismiss={() => this.setState({waterAdded: false})}>
              <Dialog.Title>
                Water was added to planter {this.state.item.name}
              </Dialog.Title>
              <Dialog.Content>
                <Paragraph>It will live now</Paragraph>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => this.setState({waterAdded: false})}>
                  OK
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        </KeyboardAwareScrollView>
      );
    } else {
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
                {/*{this.renderAutomation()}*/}
              </PaperCard.Content>
            </PaperCard>
            <PaperCard style={{marginTop: 5}}>
              <PaperCard.Content>{this.renderAutomation()}</PaperCard.Content>
            </PaperCard>
            <PaperCard style={{marginTop: 5}}>
              <PaperCard.Title
                title={'Conditions'}
                // subtitle="Conditions of the planter"
              />
              <PaperCard.Content>
                <Paragraph style={{fontWeight: 'bold', fontSize: 15}}>
                  Temperature over the week
                </Paragraph>
                <BarChart
                  data={data}
                  width={Dimensions.get('window').width - 40} // from react-native
                  height={220}
                  // yAxisLabel="$"
                  yAxisSuffix="C"
                  fromZero={true}
                  yAxisInterval={1} // optional, defaults to 1
                  chartConfig={{
                    // backgroundColor: plantyColor,
                    backgroundGradientFrom: plantyColor,
                    // backgroundGradientTo: '#ffa726',
                    decimalPlaces: 1, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    barPercentage: 0.8,
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 10,
                  }}
                />
                <View style={styles.conditionsText}>
                  <Text style={styles.actionsText}>Current Temperature:</Text>
                  <Text style={styles.actionsText}>
                    {this.state.temperature + ' C'}
                  </Text>
                </View>
                <Divider />
                <Paragraph style={{fontWeight: 'bold', fontSize: 15}}>
                  Humidity over the week
                </Paragraph>
                <BarChart
                  data={data}
                  width={Dimensions.get('window').width - 40} // from react-native
                  height={220}
                  // yAxisLabel="$"
                  yAxisSuffix="C"
                  fromZero={true}
                  yAxisInterval={1} // optional, defaults to 1
                  chartConfig={{
                    // backgroundColor: plantyColor,
                    backgroundGradientFrom: plantyColor,
                    // backgroundGradientTo: '#ffa726',
                    decimalPlaces: 1, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    barPercentage: 0.8,
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 10,
                  }}
                />

                <View style={styles.conditionsText}>
                  <Text style={styles.actionsText}>Current Humidity:</Text>
                  <Text style={styles.actionsText}>
                    {this.state.humidity + ' %'}
                  </Text>
                </View>
                <Divider />
                <Paragraph style={{fontWeight: 'bold', fontSize: 15}}>
                  UV over the week
                </Paragraph>
                <BarChart
                  data={data}
                  width={Dimensions.get('window').width - 40} // from react-native
                  height={220}
                  // yAxisLabel="$"
                  yAxisSuffix="C"
                  fromZero={true}
                  yAxisInterval={1} // optional, defaults to 1
                  chartConfig={{
                    // backgroundColor: plantyColor,
                    backgroundGradientFrom: plantyColor,
                    // backgroundGradientTo: '#ffa726',
                    decimalPlaces: 1, // optional, defaults to 2dp
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    barPercentage: 0.8,
                  }}
                  bezier
                  style={{
                    marginVertical: 8,
                    borderRadius: 10,
                  }}
                />
                <View style={styles.conditionsText}>
                  <Text style={styles.actionsText}>Current UV:</Text>
                  <Text style={styles.actionsText}>
                    {this.state.uv + ' Lumens'}
                  </Text>
                </View>

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
  conditionsText: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
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
