import React from 'react';
import {Image, View, StyleSheet} from 'react-native';
import {Text, Card} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';

import {Button, Divider} from 'react-native-paper';

//redux
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {addSocket, addUser, loadPlanters} from '../../FriendActions';

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
      .catch(error => {
        console.log('error ' + error);
        this.failureAdding();
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
    let loading = this.state.addingPlant;
    return (
      <View style={styles.container}>
        <Card
          style={{margin: 5, width: '95%'}}
          header={() => {
            return <Text style={styles.mainText}>{item.name}</Text>;
          }}
          footer={() => {
            return (
              <Button
                icon={this.state.addingPlanticon}
                style={{margin: 10}}
                loading={loading}
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
            );
          }}>
          <Image
            style={{alignSelf: 'center', margin: 5, height: 200, width: 200}}
            source={{uri: item.pic}}
          />
          <Text style={styles.mainText}>About</Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
            }}>
            {item.description}
          </Text>
          <Divider />
          <Text style={{marginTop: 10, fontWeight: 'bold'}}>
            Appropriate soils: {item.soil.type}
          </Text>
        </Card>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
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
