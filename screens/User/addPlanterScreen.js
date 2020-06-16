import React from 'react';
import {StyleSheet} from 'react-native';
import {Select, Text} from '@ui-kitten/components';
import RNPickerSelect from 'react-native-picker-select';
const data = [
  {text: 'Tropical'},
  {text: 'Humid'},
  {text: 'Subarctic'},
  {text: 'Highland'},
];
import {HeaderBackButton} from 'react-navigation-stack';
import {Image, View} from 'react-native';
import {Card as PaperCard, TextInput, Button} from 'react-native-paper';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {bindActionCreators} from 'redux';
import {addAction, AddAvatarLink, sendMessage} from '../../FriendActions';
import connect from 'react-redux/lib/connect/connect';
import {Logger} from '../../Logger';

const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

class addPlanterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planterName: '',
      planterDescription: '',
      selectedOption: {value: 'Humid'},
      selectedGrowthPlanOption: {value: ''},
      visible: false,
      nameError: false,
      checked: 'first',
      USER_TOKEN: this.props.navigation.getParam('user_token'),
      loadBuffering: false,
      addingPlanter: false,
      addingPlanterIcon: '',
      addingPlanterText: 'Add to my garden',
      addingPlanterDisabled: false,
      allActions: false,
      growthPlans: [],
      growthPlansOptions: [],
      planError: false,
      currentPlanSelected: {
        growthPlanGroup: 'No plan selected',
        phases: [],
        growthPlanDescription: '',
      },
    };
  }
  componentDidMount(): void {
    this.loadAllGrowthPlans()
      .then()
      .catch();
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
        this.setState({growthPlans: response.data.Items});

        // console.log(response.data.Items);
        let data1 = [];
        for (let i = 0; i < response.data.Items.length; i++) {
          data1.push({
            value: response.data.Items[i].growthPlanGroup,
            label: response.data.Items[i].growthPlanGroup,
          });
        }
        this.setState({growthPlansOptions: data1});
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'loadAllGrowthPlans',
        );
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

  setSelectedGrowthPlanOption = val => {
    // console.log(val);

    this.state.growthPlans.map(one => {
      if (one.growthPlanGroup === val) {
        this.setState({currentPlanSelected: one});
      }
    });

    this.setState({selectedGrowthPlanOption: val, planError: false});
  };

  setSelectedOption = val => {
    this.setState({selectedOption: val});
  };

  async addPlanterToMyGarden() {
    this.setState({addingPlanter: true});
    let growthPlan = {};
    this.state.growthPlans.map(one => {
      if (one.growthPlanGroup === this.state.selectedGrowthPlanOption) {
        growthPlan = one;
      }
    });

    const AuthStr = 'Bearer '.concat(this.state.USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/createPlanter',
        {
          username: this.props.navigation.getParam('user').username,
          planterName: this.state.planterName,
          planterDescription: this.state.planterDescription,
          planterClimate: this.state.selectedOption,
          growthPlan: growthPlan,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.dealWithUrlData(response.data);
      })
      .catch(e => {
        this.failureAdding();
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'addPlanterToMyGarden',
        );
        console.log(e);
      });
  }

  dealWithUrlData = url => {
    this.successAdding();
    this.forceUpdate();
    this.props.navigation.getParam('loadPlanters')();
  };

  successAdding = () => {
    this.setState({
      addingPlanter: false,
      addingPlanterIcon: 'check',
      allActions: true,
      addingPlanterText: 'Added',
      addingPlanterDisabled: true,
    });
  };

  failureAdding = () => {
    this.setState({
      addingPlanter: false,
      addingPlanterIcon: 'alert-circle-outline',
      allActions: true,
      addingPlanterText: 'Failed to add',
      addingPlanterDisabled: true,
    });
  };

  validateText() {
    const expr = /^[a-zA-Z0-9_.-]*$/;
    const expr1 = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{6,}$/g;
    let name = this.state.planterName;
    if (
      !expr.test(String(this.state.planterName).toLowerCase()) ||
      this.state.planterName.length === 0
    ) {
      this.setState({nameError: true});
      // return true;
    } else {
      this.setState({nameError: false});
      // return false;
    }

    if (this.state.selectedGrowthPlanOption.value === '') {
      this.setState({planError: true});
      return true;
    } else this.setState({planError: false});
    return false;
  }

  renderErrorMsg() {
    if (!this.state.nameError) {
      return <View />;
    } else {
      return (
        <Text style={{color: errorColor, margin: 10}}>
          Name must have only numbers and Letters
        </Text>
      );
    }
  }

  renderPlanErrorMsg() {
    if (!this.state.planError) {
      return <View />;
    } else {
      return (
        <Text style={{color: errorColor, margin: 10}}>
          You must select a Growth Plan
        </Text>
      );
    }
  }

  render() {
    let loading = this.state.addingPlanter;
    let allActionsDisabled = this.state.allActions;

    let selectBackground =
      this.props.plantyData.theme === 'light' ? 'white' : '#27323a';
    let selectTest =
      this.props.plantyData.theme === 'light' ? 'black' : 'white';

    return (
      <View
        style={{
          flex: 1,
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
          position: 'relative',
        }}>
        <PaperCard style={{margin: '1%', width: '98%'}}>
          <PaperCard.Title title={'Create Planter'} />
          <PaperCard.Content>
            <Text style={styles.simpleText}>Name</Text>
            <TextInput
              style={styles.textInput}
              disabled={allActionsDisabled}
              label="Name"
              mode={'outlined'}
              value={this.state.planterName}
              error={this.state.nameError}
              onChangeText={text => {
                this.setState({planterName: text, nameError: false});
              }}
            />
            {this.renderErrorMsg()}
            <Text style={styles.simpleText}>Description</Text>
            <TextInput
              style={styles.textInput}
              mode={'outlined'}
              disabled={allActionsDisabled}
              label="Description"
              value={this.state.planterDescription}
              onChangeText={text => this.setState({planterDescription: text})}
            />
            <Text style={styles.simpleText}>Climate</Text>
            <View style={styles.controlContainer}>
              <RNPickerSelect
                placeholder={{
                  label: 'Select a climate...',
                  value: '',
                  color: '#9EA0A4',
                }}
                items={[
                  {label: 'Tropical', value: 'Tropical'},
                  {label: 'Humid', value: 'Humid'},
                  {label: 'Subarctic', value: 'Subarctic'},
                  {label: 'Highland', value: 'Highland'},
                ]}
                onValueChange={value => {
                  this.setSelectedOption(value);
                }}
                style={{
                  inputIOS: {
                    margin: 10,
                    fontSize: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderColor: plantyColor,
                    borderRadius: 4,
                    backgroundColor: selectBackground,
                    color: selectTest,
                    paddingRight: 30, // to ensure the text is never behind the icon
                  },
                }}
                value={this.state.selectedOption}
                disabled={allActionsDisabled}
              />

              {/*<Select*/}
              {/*  disabled={allActionsDisabled}*/}
              {/*  style={{*/}
              {/*    borderRadius: 4,*/}
              {/*    borderWidth: 0.5,*/}
              {/*    margin: 10,*/}
              {/*    borderColor: plantyColor,*/}
              {/*    container: {backgroundColor: 'black'},*/}
              {/*  }}*/}
              {/*  data={data}*/}
              {/*  selectedOption={this.state.selectedOption}*/}
              {/*  onSelect={this.setSelectedOption}*/}
              {/*/>*/}
            </View>
            <Text style={styles.simpleText}>Growth Plan</Text>
            <View style={styles.controlContainer}>
              <RNPickerSelect
                placeholder={{
                  label: 'Select a growth plan...',
                  value: '',
                  color: '#9EA0A4',
                }}
                items={this.state.growthPlansOptions}
                onValueChange={value => {
                  this.setSelectedGrowthPlanOption(value);
                }}
                style={{
                  inputIOS: {
                    margin: 10,
                    fontSize: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderColor: this.state.planError
                      ? errorColor
                      : plantyColor,
                    borderRadius: 4,
                    backgroundColor: selectBackground,
                    color: selectTest,
                    paddingRight: 30, // to ensure the text is never behind the icon
                  },
                }}
                disabled={allActionsDisabled}
                error={this.state.planError}
                value={this.state.selectedGrowthPlanOption}
              />
              {/*<Select*/}
              {/*  disabled={allActionsDisabled}*/}
              {/*  error={this.state.planError}*/}
              {/*  style={{*/}
              {/*    borderRadius: 4,*/}
              {/*    borderWidth: 0.5,*/}
              {/*    margin: 10,*/}
              {/*    borderColor: this.state.planError ? errorColor : plantyColor,*/}
              {/*  }}*/}
              {/*  data={this.state.growthPlansOptions}*/}
              {/*  selectedOption={this.state.selectedGrowthPlanOption}*/}
              {/*  onSelect={this.setSelectedGrowthPlanOption}*/}
              {/*/>*/}
              {this.renderPlanErrorMsg()}
            </View>
            <Text style={{marginLeft: 10, marginBottom: 10}}>
              Description:{' '}
              {this.state.currentPlanSelected.growthPlanDescription}
            </Text>
            <Text style={{marginLeft: 10}}>
              This plan will last for:{' '}
              {this.state.currentPlanSelected.phases.length}
              {' weeks'}
            </Text>

            <Button
              icon={this.state.addingPlanterIcon}
              style={{margin: 10}}
              loading={loading}
              disabled={this.state.addingPlanterDisabled}
              mode="outlined"
              backgroundColor="#6f9e04"
              color="#6f9e04"
              onPress={() => {
                if (!this.validateText())
                  this.addPlanterToMyGarden()
                    .then()
                    .catch();
              }}>
              {this.state.addingPlanterText}
            </Button>
          </PaperCard.Content>
        </PaperCard>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    minHeight: 228,
  },
  simpleText: {
    margin: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
  select: {
    margin: 10,
  },
  controlContainer: {
    borderRadius: 4,
  },
  textInput: {
    borderRadius: 4,
    margin: 10,
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
)(addPlanterScreen);
