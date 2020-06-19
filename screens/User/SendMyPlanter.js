import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Select, Text} from '@ui-kitten/components';

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
import {Logger} from '../../Logger';

const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

class SendMyPlanter extends React.Component {
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
      height: Dimensions.get('window').height,
      planter: this.props.navigation.getParam('planter'),
      loadBuffering: false,
      addingPlanter: false,
      addingPlanterIcon: '',
      addingPlanterText: 'Submit request',
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
      userFullName: '',
      address: '',
      phoneNumber: '',
      instructions: '',
    };
  }
  componentDidMount(): void {
    this.props.navigation.setParams({
      headerColor:
        this.props.plantyData.theme === 'light' ? 'white' : '#263238',
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

  async submitOrder() {
    this.setState({addingPlanter: true});
    const AuthStr = 'Bearer '.concat(
      this.props.plantyData.myCognitoUser.signInUserSession.idToken.jwtToken,
    );
    await axios
      .post(
        Consts.apigatewayRoute + '/sendingPlanter',
        {
          username: this.props.plantyData.myCognitoUser.username,
          userFullName: this.state.userFullName,
          phoneNumber: this.state.phoneNumber,
          address: this.state.address,
          instructions: this.state.instructions,
          UUID: this.state.planter.UUID,
          action: 'requested',
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
          'submitOrder',
        );
        console.log(e);
      });
  }

  dealWithUrlData = url => {
    this.successAdding();
  };

  successAdding = () => {
    this.setState({
      addingPlanter: false,
      addingPlanterIcon: 'check',
      allActions: true,
      addingPlanterText: 'Submitted',
      addingPlanterDisabled: true,
    });
  };

  failureAdding = () => {
    this.setState({
      addingPlanter: false,
      addingPlanterIcon: 'alert-circle-outline',
      allActions: true,
      addingPlanterText: 'Failed to Submit',
      addingPlanterDisabled: true,
    });
  };

  validateText() {
    const expr = /^[a-zA-Z0-9_() .,-]*$/;
    const expr1 = /^[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{6,}$/g;
    if (
      !expr.test(String(this.state.userFullName).toLowerCase()) ||
      this.state.userFullName.length === 0
    ) {
      this.setState({nameError: true});
      return false;
    } else {
      this.setState({nameError: false});
    }
    if (
      !expr.test(String(this.state.phoneNumber).toLowerCase()) ||
      this.state.phoneNumber.length === 0
    ) {
      this.setState({nameError: true});
      return false;
    } else {
      this.setState({nameError: false});
    }
    if (
      !expr.test(String(this.state.address).toLowerCase()) ||
      this.state.address.length === 0
    ) {
      this.setState({nameError: true});
      return false;
    } else {
      this.setState({nameError: false});
    }
    return true;
  }

  renderErrorMsg() {
    if (!this.state.nameError) {
      return <View />;
    } else {
      return (
        <Text style={{color: errorColor, margin: 10}}>
          Please fill out all the forms
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
    return (
      <View
        style={{
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
          height: this.state.height,
        }}>
        <PaperCard style={{margin: '1%', width: '98%'}}>
          <PaperCard.Title
            title={'Send planter to your home'}
            subtitle="Fill the form below"
          />
          <PaperCard.Content>
            <TextInput
              style={styles.textInput}
              disabled={allActionsDisabled}
              label="Full Name *"
              mode={'outlined'}
              value={this.state.userFullName}
              error={this.state.nameError}
              onChangeText={text => {
                this.setState({userFullName: text, nameError: false});
              }}
            />
            <TextInput
              style={styles.textInput}
              mode={'outlined'}
              disabled={allActionsDisabled}
              label="Phone number *"
              value={this.state.phoneNumber}
              error={this.state.nameError}
              onChangeText={text => this.setState({phoneNumber: text})}
            />

            <TextInput
              style={styles.textInput}
              mode={'outlined'}
              disabled={allActionsDisabled}
              label="Address *"
              value={this.state.address}
              error={this.state.nameError}
              onChangeText={text => this.setState({address: text})}
            />
            <TextInput
              style={styles.textInput}
              mode={'outlined'}
              disabled={allActionsDisabled}
              label="Special Instructions"
              multiline={true}
              numberOfLines={3}
              value={this.state.instructions}
              onChangeText={text => this.setState({instructions: text})}
            />
            {this.renderErrorMsg()}
            <Button
              icon={this.state.addingPlanterIcon}
              style={{margin: 10}}
              loading={loading}
              disabled={this.state.addingPlanterDisabled}
              mode="outlined"
              backgroundColor="#6f9e04"
              color="#6f9e04"
              onPress={() => {
                if (this.validateText()) {
                  this.submitOrder()
                    .then()
                    .catch();
                }
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
)(SendMyPlanter);
