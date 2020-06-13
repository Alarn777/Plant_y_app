import React from 'react';
import {StyleSheet} from 'react-native';
import {bindActionCreators} from 'redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {Image, View, Dimensions} from 'react-native';
import {
  Card as PaperCard,
  Text,
  Button,
  Switch,
  Divider,
  FAB,
  Paragraph,
  Dialog,
  Portal,
  Chip,
} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Consts from '../../ENV_VARS';
import axios from 'axios';
import {
  addAction,
  AddAvatarLink,
  sendMessage,
  toggleLight,
} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
import WS from '../../websocket';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import StackedAreaGraph from '../../StackedAreaGraph';
import AreaGraph from '../../AreaGraph';

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
      temperatureMax: '35',
      currTemperature: '10',
      uv: '1000',
      uvMax: '2000',
      currUV: '',
      humidity: '50',
      humidityMax: '100',
      currHumidity: '',
      manualMode: false,
      deletingPlanter: false,
      waterTurnedOn: false,
      lightTurnedOn: false,
      loadingLightTurnedOn: false,
      waterAdded: false,
      loadingAddingWater: false,
      entries: [
        {
          title: 'temperature',
          currTemperature: '0',
          plots: this.props.navigation.getParam('item').plots,
        },
        {
          title: 'uv',
          currUV: '0',
          plots: this.props.navigation.getParam('item').plots,
        },
        {
          title: 'humidity',
          currHumidity: '0',
          plots: this.props.navigation.getParam('item').plots,
        },
      ],
      activeSlide: 0,
      setScrollViewRef: null,
      currentWeek: 0,
    };

    WS.onMessage(data => {
      // console.log('GOT in adjust screen', data.data);

      let instructions = data.data.split(';');
      if (instructions.length > 2)
        switch (instructions[2]) {
          case 'WATER_ADDED':
            this.setState({waterAdded: true, loadingAddingWater: false});
            break;
          case 'UV_LAMP_IS_ON':
            this.setState({lightTurnedOn: true, loadingLightTurnedOn: false});
            this.props.toggleLight(true);
            break;
          case 'UV_LAMP_IS_OFF':
            this.props.toggleLight(false);
            this.setState({lightTurnedOn: false, loadingLightTurnedOn: false});
            break;

          case 'LAMP_IS_OFF':
            this.setState({lightTurnedOn: false});
            break;
          case 'LAMP_IS_ON':
            this.setState({lightTurnedOn: true});
            break;
          case 'FAILED':
            console.log('Failed to communicate with server');
            // this.forceUpdate();
            break;
          case 'MEASUREMENTS':
            if (this.state.item.UUID === instructions[1]) {
              this.setState({
                entries: [
                  {
                    title: 'temperature',
                    currTemperature: instructions[3].split(':')[1],
                    plots: this.state.item.plots,
                  },
                  {
                    title: 'uv',
                    currUV: instructions[4].split(':')[1],
                    plots: this.state.item.plots,
                  },
                  {
                    title: 'humidity',
                    currHumidity: instructions[5].split(':')[1],
                    plots: this.state.item.plots,
                  },
                ],
              });
              let temp = instructions[3].split(':')[1];
              temp = Math.floor(parseFloat(temp));

              this.setState({
                currTemperature: temp,
                currUV: instructions[4].split(':')[1],
                currHumidity: instructions[5].split(':')[1],
              });
            }

            break;
        }
    });
  }
  componentDidMount(): void {
    this.scrollViewRef.scrollTo({x: 0, y: 0, animated: true});

    let currentTime = new Date().getTime() / 1000;
    let activatedTime = 0;
    if (this.state.item) activatedTime = this.state.item.TimeActivated;
    let currentWeek = (currentTime - activatedTime) / 86400;
    currentWeek = parseInt(currentWeek / 7);
    this.setState({currentWeek: currentWeek});
    this.getMeasurments();
  }

  getMeasurments = () => {
    if (WS.ws)
      WS.sendMessage('FROM_WEB;' + this.state.item.UUID + ';GET_MEASUREMENTS');
  };

  setScrollViewRef = element => {
    this.scrollViewRef = element;
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

  async deletePlanter() {
    this.setState({deletingPlanter: true});

    // console.log('In deleting Planter');
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
        // console.log(response);
        this.successDeleting();
      })
      .catch(error => {
        this.failureDeleting();
        console.log('error ' + error);
      });
  }

  successDeleting = () => {
    this.setState({
      deletingPlanter: false,
    });
    setTimeout(this.goBack, 1000);
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
    });
  };

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
            WS.sendMessage(
              'FROM_CLIENT;' + this.state.item.UUID + ';UV_LAMP_STATUS',
            );
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
        <Button
          icon={'water'}
          color={'#42a5f5'}
          loading={this.state.loadingAddingWater}
          onPress={() => {
            this.setState({loadingAddingWater: true});
            WS.sendMessage(
              'FROM_CLIENT;' + this.state.item.UUID + ';ADD_WATER',
            );
          }}>
          Add
        </Button>
      </View>
    );
  };

  renderLightControl = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginTop: 10,
        }}>
        <Chip style={{backgroundColor: 'white'}} icon="ceiling-light">
          Toggle light
        </Chip>
        <Button
          icon={'lightbulb'}
          color={
            !this.props.plantyData.controls.lightEnabled ? 'gray' : '#ffea00'
          }
          loading={this.state.loadingLightTurnedOn}
          onPress={() => {
            let action = !this.props.plantyData.controls.lightEnabled
              ? 'on'
              : 'off';
            this.setState({loadingLightTurnedOn: true});
            WS.sendMessage(
              'FROM_CLIENT;' +
                this.state.item.UUID +
                ';UV_LAMP_' +
                action.toUpperCase(),
            );
          }}>
          {this.props.plantyData.controls.lightEnabled ? 'on' : 'off'}
        </Button>
      </View>
    );
  };

  renderTemperatureControl = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginBottom: 10,
          marginTop: 10,
        }}>
        <Chip
          style={{paddingTop: 10, paddingBottom: 5, backgroundColor: 'white'}}
          icon="temperature-celsius">
          Adjust temperature
        </Chip>

        <View
          style={{
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
                'FROM_CLIENT;' + this.state.item.UUID + ';DECREASE_TEMP',
              );
              let newTemp = parseInt(this.state.currTemperature) - 1;
              this.setState({currTemperature: newTemp.toString()});
            }}
          />
          <Text
            style={{
              padding: 10,
              fontWeight: 'bold',
              color: 'gray',
              fontSize: 15,
            }}>
            {this.state.currTemperature}
          </Text>
          <FAB
            style={styles.fab}
            small
            icon="plus"
            onPress={() => {
              WS.sendMessage(
                'FROM_CLIENT;' + this.state.item.UUID + ';INCREASE_TEMP',
              );
              let newTemp = parseInt(this.state.currTemperature) + 1;
              this.setState({currTemperature: newTemp.toString()});
            }}
          />
        </View>
      </View>
    );
  };

  _renderCarouselItem({item, index}) {
    let temp = item.currTemperature;
    temp = Math.floor(parseFloat(temp));

    let humid = item.currHumidity;
    humid = Math.floor(parseFloat(humid * 100));

    switch (item.title) {
      case 'temperature':
        return (
          <View>
            <View style={styles.conditionsText}>
              <Text style={styles.actionsText}>Current Temperature:</Text>
              <Text style={styles.actionsText}>{temp + ' C'}</Text>
            </View>
            <Divider />
            <Paragraph
              style={{fontWeight: 'bold', fontSize: 15, marginTop: 15}}>
              Temperature over this day
            </Paragraph>
            <AreaGraph
              formatter={'C'}
              data={item.plots.daily.ambientTemperatureCelsius}
              y={[-10, 60]}
            />
            <Divider />
            <Paragraph
              style={{fontWeight: 'bold', fontSize: 15, marginTop: 15}}>
              Temperature over the week
            </Paragraph>
            <StackedAreaGraph
              data={item.plots.weekly}
              formatter={'C'}
              mode={'temp'}
            />
          </View>
        );
      case 'humidity':
        return (
          <View>
            <View style={styles.conditionsText}>
              <Text style={styles.actionsText}>Current Humidity:</Text>
              <Text style={styles.actionsText}>{humid + ' %'}</Text>
            </View>
            <Divider />
            <Paragraph
              style={{fontWeight: 'bold', fontSize: 15, marginTop: 15}}>
              Humidity over this day
            </Paragraph>
            <AreaGraph
              formatter={'%'}
              data={item.plots.daily.soilHumidity}
              y={[0, 1]}
            />
            <Divider />
            <Paragraph
              style={{fontWeight: 'bold', fontSize: 15, marginTop: 15}}>
              Humidity over the week
            </Paragraph>
            <StackedAreaGraph
              data={item.plots.weekly}
              formatter={''}
              mode={'humid'}
            />
          </View>
        );
      case 'uv':
        return (
          <View>
            <View style={styles.conditionsText}>
              <Text style={styles.actionsText}>Current UV:</Text>
              <Text style={styles.actionsText}>{item.currUV}</Text>
            </View>
            <Divider />
            <Paragraph
              style={{fontWeight: 'bold', fontSize: 15, marginTop: 15}}>
              UV over this day
            </Paragraph>
            <AreaGraph
              formatter={''}
              data={item.plots.daily.uvIntensity}
              y={[0, 1000]}
            />
            <Divider />
            <Paragraph
              style={{fontWeight: 'bold', fontSize: 15, marginTop: 15}}>
              UV over the week
            </Paragraph>
            <StackedAreaGraph
              data={item.plots.weekly}
              formatter={''}
              mode={'uv'}
            />
          </View>
        );
    }
  }

  render() {
    if (this.state.manualMode) {
      return (
        <KeyboardAwareScrollView style={{margin: '1%', width: '98%'}}>
          <PaperCard>
            <PaperCard.Title
              title={'Planter: ' + this.state.item.name}
              subtitle={'Climate: ' + this.state.item.climate}
            />

            <PaperCard.Content>
              <Divider />
              <Text style={{marginBottom: 10, marginTop: 10}}>
                {'Description: ' + this.state.item.description}
              </Text>
              <Divider />
              <Text style={{marginBottom: 10, marginTop: 10}}>
                {'Weeks since active: ' + parseInt(this.state.currentWeek + 1)}
              </Text>
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
          <PaperCard style={{marginTop: 5, height: this.state.height - 380}}>
            <PaperCard.Title title={'Actions'} />
            <PaperCard.Content>
              {this.renderWaterControl()}
              <Divider />
              {this.renderLightControl()}
              <Divider />
              {this.renderTemperatureControl()}
              <Divider />

              <Button
                mode="outlined"
                onPress={() => {
                  this.props.navigation.navigate('growthPlan', {
                    planter: this.state.item,
                  });
                }}>
                Edit growth plan
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
            innerRef={this.setScrollViewRef}
            extraScrollHeight={30}>
            <PaperCard>
              <PaperCard.Title
                title={'Planter: ' + this.state.item.name}
                subtitle={'Climate: ' + this.state.item.climate}
              />
              <PaperCard.Content>
                <Divider />
                <Text style={{marginBottom: 10, marginTop: 10}}>
                  {'Description: ' + this.state.item.description}
                </Text>
                <Divider />
                <Text style={{marginBottom: 10, marginTop: 10}}>
                  {'Weeks since active: ' +
                    parseInt(this.state.currentWeek + 1)}
                </Text>
              </PaperCard.Content>
            </PaperCard>
            <PaperCard style={{marginTop: 5}}>
              <PaperCard.Content>{this.renderAutomation()}</PaperCard.Content>
            </PaperCard>
            <PaperCard style={{marginTop: 5}}>
              <PaperCard.Title title={'Conditions'} />
              <PaperCard.Content>
                <Carousel
                  // ref={c => {
                  //   this._carousel = c;
                  // }}
                  loop={true}
                  autoplay={true}
                  autoplayDelay={0}
                  autoplayInterval={10000}
                  data={this.state.entries}
                  renderItem={this._renderCarouselItem}
                  sliderWidth={Dimensions.get('window').width - 40}
                  itemWidth={Dimensions.get('window').width - 40}
                  onSnapToItem={index => this.setState({activeSlide: index})}
                />
                <Pagination
                  dotsLength={3}
                  // onSnapToItem={index => this.setState({activeSlide: index})}
                  activeDotIndex={this.state.activeSlide}
                  // containerStyle={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}}
                  dotStyle={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    marginHorizontal: 8,
                    backgroundColor: plantyColor,
                  }}
                  inactiveDotStyle={
                    {
                      // Define styles for inactive dots here
                    }
                  }
                  inactiveDotOpacity={0.4}
                  inactiveDotScale={0.6}
                />
                <Button
                  mode="outlined"
                  onPress={() => {
                    this.props.navigation.navigate('history', {
                      planter: this.state.item,
                    });
                  }}>
                  See history
                </Button>
                <Button
                  style={{marginTop: 10}}
                  mode="outlined"
                  icon={this.state.item.askedToSend === 'none' ? '' : 'check'}
                  disabled={this.state.item.askedToSend !== 'none'}
                  onPress={() => {
                    this.props.navigation.navigate('SendMyPlanter', {
                      planter: this.state.item,
                    });
                  }}>
                  {this.state.item.askedToSend === 'none'
                    ? 'Receive my planter'
                    : 'Requested to send'}
                </Button>

                <Button
                  style={{marginTop: 10}}
                  icon="delete"
                  mode="outlined"
                  loading={this.state.deletingPlanter}
                  onPress={() => {
                    this._showDialog();
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
  chart: {
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
      sendMessage,
      addAction,
      toggleLight,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AdjustPlanterConditions);
