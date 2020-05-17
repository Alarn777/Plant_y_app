import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, Select, Text} from '@ui-kitten/components';

import InputValidation from 'react-native-input-validation';
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

const plantyColor = '#6f9e04';

class addPlanterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planterName: '',
      planterDescription: '',
      selectedOption: {text: 'Humid'},
      selectedGrowthPlanOption: {text: ''},
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
    };
  }
  componentDidMount(): void {
    this.loadAllGrowthPlans()
      .then()
      .catch();
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
        let data1 = [];
        for (let i = 0; i < response.data.Items.length; i++) {
          data1.push({text: response.data.Items[i].growthPlanGroup});
        }
        this.setState({growthPlansOptions: data1});
      })
      .catch(error => {
        console.log(error);
      });
  }

  static navigationOptions = ({navigation, screenProps}) => {
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

  setSelectedGrowthPlanOption = val => {
    this.setState({selectedGrowthPlanOption: val});
  };

  setSelectedOption = val => {
    this.setState({selectedOption: val});
  };
  async addPlanterToMyGarden() {
    this.setState({addingPlanter: true});
    let growthPlan = {};
    this.state.growthPlans.map(one => {
      if (one.growthPlanGroup === this.state.selectedGrowthPlanOption.text) {
        growthPlan = one;
      }
    });

    console.log(growthPlan);

    const AuthStr = 'Bearer '.concat(this.state.USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/createPlanter',
        {
          username: this.props.navigation.getParam('user').username,
          planterName: this.state.planterName,
          planterDescription: this.state.planterDescription,
          planterClimate: this.state.selectedOption['text'],
          growthPlan: growthPlan,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.dealWithUrlData(response.data);
      })
      .catch(error => {
        this.failureAdding();
        console.log('error ' + error);
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
      return true;
    } else {
      this.setState({nameError: false});
      return false;
    }
  }

  renderErrorMsg() {
    if (!this.state.nameError) {
      return <View />;
    } else {
      return (
        <Text style={{color: 'red', margin: 10}}>
          Name must have only numbers and Letters
        </Text>
      );
    }
  }

  render() {
    let loading = this.state.addingPlanter;
    let allActionsDisabled = this.state.allActions;
    return (
      <View>
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
                this.setState({planterName: text});
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
              <Select
                disabled={allActionsDisabled}
                style={{
                  borderRadius: 4,
                  borderWidth: 0.5,
                  margin: 10,
                  borderColor: plantyColor,
                }}
                data={data}
                selectedOption={this.state.selectedOption}
                onSelect={this.setSelectedOption}
              />
            </View>
            <Text style={styles.simpleText}>Growth Plan</Text>
            <View style={styles.controlContainer}>
              <Select
                disabled={allActionsDisabled}
                style={{
                  borderRadius: 4,
                  borderWidth: 0.5,
                  margin: 10,
                  borderColor: plantyColor,
                }}
                data={this.state.growthPlansOptions}
                selectedOption={this.state.selectedGrowthPlanOption}
                onSelect={this.setSelectedGrowthPlanOption}
              />
            </View>
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
