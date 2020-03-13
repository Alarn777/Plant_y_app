import {v4 as uuidv4} from 'uuid';
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
import {createStackNavigator, HeaderBackButton} from 'react-navigation-stack';
import {Image, TouchableOpacity, View, Dimensions} from 'react-native';
import {
  Avatar,
  Card as PaperCard,
  Card,
  RadioButton,
  TextInput,
  ToggleButton,
  Button,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import axios from 'axios';
import Consts from '../../ENV_VARS';

const plantyColor = '#6f9e04';

class addPlanterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planterName: '',
      planterDescription: '',
      selectedOption: {text: 'Humid'},
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
    };
    // this.dealWithData = this.dealWithData.bind(this);
    // this.createPlanter = this.createPlanter.bind(this);
  }
  componentDidMount(): void {
    // console.log(this.state.user);
  }

  static navigationOptions = ({navigation, screenProps}) => {
    // const params = navigation.state.params || {};
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

  setSelectedOption = val => {
    console.log(val);
    // console.log(val);
    this.setState({selectedOption: val});
  };
  async addPlanterToMyGarden() {
    // console.log(this.props.navigation.getParam('user').username);

    this.setState({addingPlanter: true});

    // console.log(this.props.user.username);
    const AuthStr = 'Bearer '.concat(this.state.USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/createPlanter',
        {
          username: this.props.navigation.getParam('user').username,
          planterName: this.state.planterName,
          planterDescription: this.state.planterDescription,
          planterClimate: this.state.selectedOption['text'],
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        // If request is good...
        // console.log(response.data);
        this.dealWithUrlData(response.data);
      })
      .catch(error => {
        console.log('error ' + error);
      });

    // setTimeout(this.successAdding, 1000);
    // setTimeout(this.failureAdding, 1000);
    // this.props.navigation.goBack();
  }

  dealWithUrlData = url => {
    // this.setState({URL: url.HLSStreamingSessionURL});
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

    // console.log(this.state.planterName);

    // console.log(expr.test(String(this.state.planterName).toLowerCase()));
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

    // if (name.length < 4 || expr.ci(expression)) {
    //   this.setState({nameError: true});
    // } else this.setState({nameError: false});
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
    const {navigation} = this.props;
    let allActionsDisabled = this.state.allActions;
    return (
      <View>
        <PaperCard style={{margin: '1%', width: '98%'}}>
          <PaperCard.Title
            title={'Create Planter'}
            // subtitle="Card Subtitle"
          />
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
            {/*<Text style={styles.simpleText} />*/}
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
                  // backgroundColor: 'black',
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
                // navigation.goBack();
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
    // margin: 8,
    // backgroundColor: '#3366FF',
  },
  textInput: {
    borderRadius: 4,
    margin: 10,
  },
});

export default addPlanterScreen;
