import React from 'react';
import {Image, View, StyleSheet, ScrollView} from 'react-native';
import {Text, Card} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';

import {
  Button,
  Divider,
  Card as PaperCard,
  Paragraph,
  Title,
} from 'react-native-paper';

//redux
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addSocket, addUser, loadPlanters} from '../../FriendActions';
import {HeaderBackButton} from 'react-navigation-stack';
import {Logger} from '../../Logger';

class AddPlantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plant: null,
      USER_TOKEN: this.props.navigation.getParam('user_token'),
      URL: '',
      loadBuffering: false,
      addingPlant: false,
      addingPlanticon: '',
      addingPlantText: 'Add to my garden',
      addingPlantDisabled: false,
      planterName: this.props.navigation.getParam('planterName'),
    };

    this.addPlantToMyGarden = this.addPlantToMyGarden.bind(this);
  }

  componentDidMount(): void {
    this.setState({plant: this.props.navigation.getParam('item')});
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

      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
      },
    };
  };

  async addPlantToMyGarden() {
    this.setState({addingPlant: true});

    const AuthStr = 'Bearer '.concat(this.state.USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/addPlantsToPlanter',
        {
          username: this.props.plantyData.myCognitoUser.username,
          plantName: this.state.plant.name,
          planterName: this.state.planterName,
        },

        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.successAdding();
      })
      .catch(e => {
        this.failureAdding();
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'addPlantsToPlanter',
        );
        console.log(e);
      });
  }

  successAdding = () => {
    this.setState({
      addingPlant: false,
      addingPlanticon: 'check',
      addingPlantText: 'Added',
      addingPlantDisabled: true,
    });
    setTimeout(this.goBack, 1200);
  };

  goBack = () => {
    this.props.navigation.navigate('planterScreen', {
      plantWasAdded: true,
    });
  };

  failureAdding = () => {
    this.setState({
      addingPlant: false,
      addingPlanticon: 'alert-circle-outline',
      addingPlantText: 'Failed to add',
      addingPlantDisabled: true,
    });
  };

  render() {
    const {navigation} = this.props;
    let item = navigation.getParam('item');
    return (
      <ScrollView style={styles.container}>
        <PaperCard>
          <PaperCard.Title
            title={item.name}
            subtitle={`Appropriate soil: ${item.soil.type}`}
          />
          <PaperCard.Cover style={{height: 300}} source={{uri: item.pic}} />
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
              margin: 10,
            }}>
            {item.description}
          </Text>
          <PaperCard.Actions>
            <Button
              icon={this.state.addingPlanticon}
              style={{margin: 10, width: '95%'}}
              loading={this.state.addingPlant}
              disabled={this.state.addingPlantDisabled}
              mode="outlined"
              backgroundColor="#6f9e04"
              color="#6f9e04"
              onPress={() => {
                this.addPlantToMyGarden()
                  .then()
                  .catch();
              }}>
              {this.state.addingPlantText}
            </Button>
          </PaperCard.Actions>
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
      addUser,
      loadPlanters,
      addSocket,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddPlantScreen);

let styles = StyleSheet.create({
  backgroundVideo: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: 200,
  },
  container: {
    // flex:1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  mainText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    // padding: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#6f9e04',
    color: '#6f9e04',
  },
  headerImage: {
    flex: 1,
    height: 100,
  },
});
