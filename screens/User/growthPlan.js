import React from 'react';
import {Image, View, ScrollView, Dimensions, StyleSheet} from 'react-native';

import PropTypes from 'prop-types';

import {
  ActivityIndicator,
  Card as PaperCard,
  List,
  Paragraph,
  TextInput,
  Button,
  Text,
  Portal,
  Dialog,
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
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink, addImage, addUser} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
import {
  lightGreen50,
  lightGreen200,
  lightGreen100,
} from 'react-native-paper/src/styles/colors';
import RangeSlider from 'rn-range-slider';
import WS from '../../websocket';
import {Logger} from '../../Logger';
const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

class growthPlan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      planter: this.props.navigation.getParam('planter'),
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      user: null,
      savingPlan: false,
      growthPlan: {},
      growthPlanName: '',
      growthPlanDescription: '',
      errorInName: false,
      errorText: '',
      visible: false,
      makePublicActive: true,
      okLoading: false,
      currentWeek: 0,
    };
    this.onLayout = this.onLayout.bind(this);
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
    this.loadGrowthPlan()
      .then(
        this.loadAllGrowthPlans()
          .then()
          .catch(),
      )
      .catch();

    let currentTime = new Date().getTime() / 1000;
    let activatedTime = this.state.planter.TimeActivated;
    let currentWeek = (currentTime - activatedTime) / 86400;
    currentWeek = parseInt(currentWeek / 7);

    this.setState({currentWeek: currentWeek + 1});

    this.props.navigation.setParams({
      headerColor:
        this.props.plantyData.theme === 'light' ? 'white' : '#263238',
    });
  }

  _showDialog = () => this.setState({visible: true});

  _hideDialog = () => this.setState({visible: false});

  async saveGrowthPlan() {
    //validations

    if (Object.keys(this.state.growthPlan).length === 0) {
      if (this.state.growthPlanName === '') {
        this.setState({errorInName: true, errorText: 'Name must not be empty'});
      } else {
        this.setState({errorText: 'Plan must have at least one week'});
      }

      return;
    } else {
      if (this.state.growthPlan.growthPlanGroup === '') {
        this.setState({errorInName: true, errorText: 'Name must not be empty'});
        return;
      }
      if (this.state.growthPlan.phases.length === 0) {
        this.setState({errorText: 'Plan must have at least one week'});
        return;
      }
    }

    this.setState({savingPlan: true, errorText: ''});

    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/managegrowthplan',
        {
          planterName: this.state.planter.name,
          username: this.props.plantyData.myCognitoUser.username,
          action: 'updateGrowthPlan',
          newPlan: this.state.growthPlan,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.setState({savingPlan: false});
        WS.sendMessage(
          'FROM_CLIENT;' + this.state.planter.UUID + ';RELOAD_GROWTH_PLAN',
        );
        this.loadGrowthPlan();
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'saveGrowthPlan',
        );
        this.setState({growthPlan: {}, savingPlan: false});
        console.log(e);
      });
  }

  async loadGrowthPlan() {
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/managegrowthplan',
        {
          planterName: this.state.planter.name,
          username: this.props.plantyData.myCognitoUser.username,
          action: 'loadGrowthPlan',
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.setState({growthPlan: response.data, loading: false});
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'loadGrowthPlan',
        );
        this.setState({growthPlan: {}, loading: false});
        console.log(e);
      });
  }

  async publishPlan() {
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/publishGrowthPlan',
        {
          growthPlanGroup: this.state.growthPlan.growthPlanGroup,
          phases: this.state.growthPlan.phases,
          growthPlanDescription: this.state.growthPlan.growthPlanDescription,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this._hideDialog();
        this.setState({okLoading: false});
        this.loadAllGrowthPlans()
          .then()
          .catch();
      })
      .catch(error => {
        this.setState({growthPlan: {}, loading: false});
        this._hideDialog();
        this.setState({okLoading: false});
        this.loadAllGrowthPlans()
          .then()
          .catch();
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          'publishPlan',
        );
      });
  }

  async loadAllGrowthPlans() {
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/loadGrowthPlans',
        {},
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.setState({makePublicActive: true});
        for (let i = 0; i < response.data.Items.length; i++) {
          if (
            response.data.Items[i].growthPlanGroup ===
            this.state.growthPlan.growthPlanGroup
          ) {
            this.setState({makePublicActive: false});
          }
        }
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'loadAllGrowthPlans',
        );
        this.setState({growthPlan: {}, savingPlan: false});
        console.log(e);
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

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }

  addWeek() {
    let currentWeeks;

    if (
      Object.keys(this.state.growthPlan).length === 0 &&
      this.state.growthPlan.constructor === Object
    ) {
      currentWeeks = [];
    } else {
      currentWeeks = this.state.growthPlan.phases;
    }

    let newWeekNum = currentWeeks.length + 1;
    let fromDay = 0;

    if (currentWeeks.length === 0) {
      newWeekNum = 1;
      fromDay = 1;
    } else {
      fromDay = currentWeeks[currentWeeks.length - 1].toDay + 1;
    }

    let newWeek = {
      fromDay: fromDay,
      phaseName: 'Week ' + newWeekNum.toString(),
      subPhases: [
        {
          fromHour: 5,
          name: 'Morning',
          soilHumidity: {
            max: 0.256,
            min: 0.1311,
          },
          temperature: {
            max: 24,
            min: 18,
          },
          toHour: 9,
          uvIntensity: {
            max: 10.2,
            min: 5.5,
          },
        },
        {
          fromHour: 9,
          name: 'Day',
          soilHumidity: {
            max: 0.356,
            min: 0.311,
          },
          temperature: {
            max: 30,
            min: 18,
          },
          toHour: 16,
          uvIntensity: {
            max: 27.2,
            min: 10.5,
          },
        },
        {
          fromHour: 16,
          name: 'Evening',
          soilHumidity: {
            max: 0.356,
            min: 0.311,
          },
          temperature: {
            max: 13,
            min: 51,
          },
          toHour: 24,
          uvIntensity: {
            max: 10.2,
            min: 4.5,
          },
        },
        {
          fromHour: 24,
          name: 'Night',
          soilHumidity: {
            max: 0.356,
            min: 0.311,
          },
          temperature: {
            max: 24,
            min: 18,
          },
          toHour: 5,
          uvIntensity: {
            max: 4.2,
            min: 3.5,
          },
        },
      ],
      toDay: fromDay + 6,
    };

    if (
      Object.keys(this.state.growthPlan).length === 0 &&
      this.state.growthPlan.constructor === Object
    ) {
      this.state.growthPlan = {
        growthPlanGroup: 'NewPlan',
        phases: [],
        UUID: 'None',
      };
      this.state.growthPlan.phases.push(newWeek);
    } else {
      this.state.growthPlan.phases.push(newWeek);
    }

    this.forceUpdate();
  }

  removeLastWeek = () => {
    this.state.growthPlan.phases.pop();

    this.forceUpdate();
  };

  renderWeeks(oneWeek) {
    let week = {
      backgroundColor:
        this.props.plantyData.theme === 'light' ? lightGreen100 : '#27323a',
      borderRadius: 5,
      padding: -30,
      margin: 1,
    };
    let weekActive = {
      backgroundColor:
        this.props.plantyData.theme === 'light' ? lightGreen200 : '#29a19c',
      borderRadius: 5,
      padding: -30,
      margin: 1,
    };

    let dayTime = {
      backgroundColor:
        this.props.plantyData.theme === 'light' ? lightGreen200 : '#37474f',
      borderRadius: 5,
      padding: -30,
      margin: 1,
    };

    let icon = 'numeric 0';

    if (oneWeek.phaseName.replace('Week ', '').length > 1) {
    } else icon = 'numeric-' + oneWeek.phaseName.replace('Week ', '');
    if (
      parseInt(oneWeek.phaseName.replace('Week ', '')) ===
      this.state.currentWeek
    ) {
    }
    return (
      <List.Accordion
        key={oneWeek.name}
        style={
          parseInt(oneWeek.phaseName.replace('Week ', '')) ===
          this.state.currentWeek
            ? weekActive
            : week
        }
        title={
          parseInt(oneWeek.phaseName.replace('Week ', '')) ===
          this.state.currentWeek
            ? oneWeek.phaseName + ' - Current'
            : oneWeek.phaseName
        }>
        <List.Accordion
          style={dayTime}
          title="Morning"
          key={oneWeek.name + 'Morning'}>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>Temperature</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>15</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={15}
              max={35}
              step={1}
              initialLowValue={oneWeek.subPhases[0].temperature.min}
              initialHighValue={oneWeek.subPhases[0].temperature.max}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[0].temperature.min = low;
                oneWeek.subPhases[0].temperature.max = high;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>35</Text>
          </View>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>UV</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>0</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={0}
              max={400}
              step={10}
              rangeEnabled={false}
              initialLowValue={oneWeek.subPhases[0].uvIntensity.min}
              initialHighValue={oneWeek.subPhases[0].uvIntensity.max}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[0].uvIntensity.min = low;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>400</Text>
          </View>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>Humidity</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>0</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={0}
              max={100}
              step={1}
              initialLowValue={oneWeek.subPhases[0].soilHumidity.min * 100}
              initialHighValue={oneWeek.subPhases[0].soilHumidity.max * 100}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              textFormat={'%d present'}
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[0].soilHumidity.min = low / 100;
                oneWeek.subPhases[0].soilHumidity.max = high / 100;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>100</Text>
          </View>
        </List.Accordion>
        <List.Accordion style={dayTime} title="Day" key={oneWeek.name + 'Day'}>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>Temperature</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>15</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={15}
              max={35}
              step={1}
              initialLowValue={oneWeek.subPhases[1].temperature.min}
              initialHighValue={oneWeek.subPhases[1].temperature.max}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[1].temperature.min = low;
                oneWeek.subPhases[1].temperature.max = high;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>35</Text>
          </View>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>UV</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>0</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={0}
              max={400}
              step={10}
              rangeEnabled={false}
              initialLowValue={oneWeek.subPhases[1].uvIntensity.min}
              initialHighValue={oneWeek.subPhases[1].uvIntensity.max}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[1].uvIntensity.min = low;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>400</Text>
          </View>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>Humidity</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>0</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={0}
              max={100}
              step={1}
              initialLowValue={oneWeek.subPhases[1].soilHumidity.min * 100}
              initialHighValue={oneWeek.subPhases[1].soilHumidity.max * 100}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              textFormat={'%d present'}
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[1].soilHumidity.min = low / 100;
                oneWeek.subPhases[1].soilHumidity.max = high / 100;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>100</Text>
          </View>
        </List.Accordion>
        <List.Accordion
          style={dayTime}
          title="Evening"
          key={oneWeek.name + 'Evening'}>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>Temperature</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>15</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={15}
              max={35}
              step={1}
              initialLowValue={oneWeek.subPhases[2].temperature.min}
              initialHighValue={oneWeek.subPhases[2].temperature.max}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[2].temperature.min = low;
                oneWeek.subPhases[2].temperature.max = high;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>35</Text>
          </View>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>UV</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>0</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={0}
              max={400}
              step={10}
              rangeEnabled={false}
              initialLowValue={oneWeek.subPhases[2].uvIntensity.min}
              initialHighValue={oneWeek.subPhases[2].uvIntensity.max}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[2].uvIntensity.min = low;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>30</Text>
          </View>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>Humidity</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>0</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={0}
              max={100}
              step={1}
              initialLowValue={oneWeek.subPhases[2].soilHumidity.min * 100}
              initialHighValue={oneWeek.subPhases[2].soilHumidity.max * 100}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              textFormat={'%d present'}
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[2].soilHumidity.min = low / 100;
                oneWeek.subPhases[2].soilHumidity.max = high / 100;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>100</Text>
          </View>
        </List.Accordion>
        <List.Accordion
          style={dayTime}
          title="Night"
          key={oneWeek.name + 'Night'}>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>Temperature</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>15</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={15}
              max={35}
              step={1}
              initialLowValue={oneWeek.subPhases[3].temperature.min}
              initialHighValue={oneWeek.subPhases[3].temperature.max}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[3].temperature.min = low;
                oneWeek.subPhases[3].temperature.max = high;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>35</Text>
          </View>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>UV</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>0</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={0}
              max={400}
              step={10}
              rangeEnabled={false}
              initialLowValue={oneWeek.subPhases[3].uvIntensity.min}
              initialHighValue={oneWeek.subPhases[3].uvIntensity.max}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[3].uvIntensity.min = low;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>400</Text>
          </View>
          <Text style={{fontWeight: 'bold', marginTop: 20}}>Humidity</Text>
          <View style={styles.slider}>
            <Text style={{marginTop: 20}}>0</Text>
            <RangeSlider
              style={{width: '85%', height: 80}}
              min={0}
              max={100}
              step={1}
              initialLowValue={oneWeek.subPhases[3].soilHumidity.min * 100}
              initialHighValue={oneWeek.subPhases[3].soilHumidity.max * 100}
              selectionColor={plantyColor}
              blankColor="#D3D3D3"
              textFormat={'%d present'}
              labelStyle="bubble"
              labelBackgroundColor={plantyColor}
              labelBorderColor={plantyColor}
              onValueChanged={(low, high, fromUser) => {
                oneWeek.subPhases[3].soilHumidity.min = low / 100;
                oneWeek.subPhases[3].soilHumidity.max = high / 100;
                this.forceUpdate();
              }}
            />
            <Text style={{marginTop: 20}}>100</Text>
          </View>
        </List.Accordion>
      </List.Accordion>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <ActivityIndicator
          size="large"
          color={plantyColor}
          style={{top: this.state.height / 2 - 50}}
        />
      );
    }

    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
          position: 'relative',
        }}
        onLayout={this.onLayout}>
        <PaperCard style={{margin: 3}}>
          <View>
            <PaperCard.Title
              title={'Growth Plan'}
              subtitle={'Planter:' + this.state.planter.name}
            />
          </View>
        </PaperCard>
        <PaperCard style={{margin: 3}}>
          <PaperCard.Content>
            <Button
              mode="outlined"
              style={{marginTop: 5}}
              onPress={() => {
                this.removeLastWeek();
              }}>
              Remove Last Week
            </Button>
            <Button
              mode="outlined"
              style={{marginTop: 5}}
              onPress={() => this.addWeek()}>
              Add Week
            </Button>

            <Button
              style={{
                marginTop: 5,
                backgroundColor: plantyColor,
              }}
              color={'white'}
              loading={this.state.savingPlan}
              onPress={() => {
                this.saveGrowthPlan()
                  .then(
                    this.loadAllGrowthPlans()
                      .then()
                      .catch(),
                  )
                  .catch();
              }}>
              Save growth plan
            </Button>
            <Text style={{marginTop: 5, color: errorColor}}>
              {this.state.errorText}
            </Text>
          </PaperCard.Content>
        </PaperCard>
        <ScrollView
          style={{
            flexWrap: 'wrap',
            flex: 1,
            margin: 3,
            width: '100%',
            flexDirection: 'row',
          }}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}>
          <PaperCard style={{width: this.state.width - 2}}>
            <PaperCard.Content>
              <TextInput
                label="Name"
                mode="outlined"
                error={this.state.errorInName}
                value={
                  Object.keys(this.state.growthPlan).length === 0 &&
                  this.state.growthPlan.constructor === Object
                    ? this.state.growthPlanName
                    : this.state.growthPlan.growthPlanGroup
                }
                onChangeText={text => {
                  Object.keys(this.state.growthPlan).length === 0 &&
                  this.state.growthPlan.constructor === Object
                    ? this.setState({growthPlanName: text})
                    : (this.state.growthPlan.growthPlanGroup = text);
                  this.forceUpdate();
                }}
              />
              <TextInput
                style={{marginTop: 5}}
                label="Description"
                mode="outlined"
                multiline={true}
                value={
                  Object.keys(this.state.growthPlan).length === 0 &&
                  this.state.growthPlan.constructor === Object
                    ? this.state.growthPlanDescription
                    : this.state.growthPlan.growthPlanDescription
                }
                onChangeText={text => {
                  Object.keys(this.state.growthPlan).length === 0 &&
                  this.state.growthPlan.constructor === Object
                    ? this.setState({growthPlanDescription: text})
                    : (this.state.growthPlan.growthPlanDescription = text);
                  this.forceUpdate();
                }}
              />
              <List.Section>
                {Object.keys(this.state.growthPlan).length === 0 &&
                this.state.growthPlan.constructor === Object ? (
                  <ActivityIndicator size="large" color={plantyColor} />
                ) : (
                  this.state.growthPlan.phases.map(one => this.renderWeeks(one))
                )}
              </List.Section>
              <Button
                mode="outlined"
                style={{marginTop: 5}}
                disabled={!this.state.makePublicActive}
                onPress={this._showDialog}>
                Make growth plan public
              </Button>
              <Portal>
                <Dialog
                  visible={this.state.visible}
                  onDismiss={this._hideDialog}>
                  <Dialog.Title>Are you sure?</Dialog.Title>
                  <Dialog.Content>
                    <Paragraph>
                      This will publish the plan you created to the public use
                    </Paragraph>
                  </Dialog.Content>
                  <Dialog.Actions style={{alignContent: 'space-between'}}>
                    <Button onPress={this._hideDialog}>Cancel</Button>
                    <Button
                      loading={this.state.okLoading}
                      style={{width: 100}}
                      onPress={() => {
                        this.setState({okLoading: true});
                        this.publishPlan();
                      }}>
                      {' '}
                      OK{' '}
                    </Button>
                  </Dialog.Actions>
                </Dialog>
              </Portal>
            </PaperCard.Content>
          </PaperCard>
        </ScrollView>
      </View>
    );
  }
}

growthPlan.propTypes = {
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
      addImage,
      AddAvatarLink,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  withAuthenticator(growthPlan, false, [
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
    margin: 1,
    width: '100%',
    flexDirection: 'row',
  },
  headerImage: {
    flex: 1,
    height: 100,
  },
  phase: {
    backgroundColor: lightGreen200,
    borderRadius: 5,
    padding: -30,
    margin: 1,
  },
  week: {
    backgroundColor: lightGreen100,
    borderRadius: 5,
    padding: -30,
    margin: 1,
  },
  weekActive: {
    backgroundColor: lightGreen200,
    borderRadius: 5,
    padding: -30,
    margin: 1,
  },

  dayTime: {
    backgroundColor: lightGreen50,
    borderRadius: 5,
    padding: -30,
    margin: 1,
  },
  slider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
