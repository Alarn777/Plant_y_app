import React from 'react';
import {Image, View, FlatList, StyleSheet, ScrollView} from 'react-native';
import {Text, Card} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {Button, Divider, FAB} from 'react-native-paper';
//redux
import {connect} from 'react-redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink} from '../../FriendActions';

const plantyColor = '#6f9e04';

class PlantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plant: this.props.navigation.getParam('item'),

      USER_TOKEN: this.props.navigation.getParam('user_token'),
      URL: '',
      planterName: this.props.navigation.getParam('planterName'),
      loadBuffering: false,
      loading: false,
      adjustments: false,

      deletingPlantText: 'Remove',
      deletingPlant: false,
      deletingPlanticon: 'delete',

      deletingPlantDisabled: false,
    };
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
          title="My Garden"
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

  componentDidMount(): void {}

  async removePlantFromPlanter() {
    this.setState({deletingPlant: true});

    const AuthStr = 'Bearer '.concat(this.state.USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/changeStatusOfPlant',
        {
          username: this.props.plantyData.myCognitoUser.username,
          plantUUID: this.state.plant.UUID,
          planterName: this.state.planterName,
          planterUUID: this.props.navigation.getParam('planterUUID'),
          plantStatus: 'inactive',
        },

        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.successDeleting();
      })
      .catch(error => {
        console.log('error ' + error);
        this.failureDeleting();
      });
  }

  successDeleting = () => {
    this.setState({
      deletingPlant: false,
      deletingPlanticon: 'check',
      deletingPlantText: 'Deleted',
      deletingPlantDisabled: true,
    });
    setTimeout(this.goBack, 1200);
  };

  goBack = () => {
    this.props.navigation.navigate('planterScreen', {
      plantWasRemoved: true,
    });
  };

  failureDeleting = () => {
    this.setState({
      deletingPlant: false,
      deletingPlanticon: 'alert-circle-outline',
      deletingPlantText: 'Failed to delete',
      deletingPlantDisabled: true,
    });
  };

  render() {
    const {navigation} = this.props;
    let item = navigation.getParam('item');

    let color = 'black';
    switch (navigation.getParam('item').plantStatus) {
      case 'active':
        color = 'green';
        break;
      case 'inactive':
        color = 'red';
        break;
      case 'pending':
        color = 'orange';
    }

    return (
      <ScrollView style={styles.container}>
        <Card
          header={() => {
            return <Text style={styles.mainText}>{item.name}</Text>;
          }}
          footer={() => {
            return (
              <Button
                icon={this.state.deletingPlanticon}
                style={{margin: 10}}
                loading={this.state.deletingPlant}
                disabled={this.state.addingPlantDisabled}
                mode="outlined"
                backgroundColor="#6f9e04"
                color="#6f9e04"
                onPress={() => {
                  this.removePlantFromPlanter()
                    .then()
                    .catch();
                }}>
                {this.state.deletingPlantText}
              </Button>
            );
          }}>
          <Image
            style={{height: 300}}
            source={{uri: this.props.navigation.getParam('item').pic}}
          />
          <Text style={styles.mainText}>Description</Text>
          <Text>{this.props.navigation.getParam('item').description}</Text>
          <Divider />
          <Text style={{marginTop: 10, fontWeight: 'bold'}}>
            Appropriate soils:
            {this.props.navigation.getParam('item').soil.type}
          </Text>
          <Text style={{marginTop: 10, color: color}}>
            Plant status:
            {this.props.navigation.getParam('item').plantStatus}
          </Text>
        </Card>
      </ScrollView>
    );
  }
}

// export default PlantScreen;

let styles = StyleSheet.create({
  backgroundVideo: {
    // position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: 200,
  },
  container: {
    margin: '1%',
    width: '98%',
  },
  mainText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    backgroundColor: plantyColor,
    color: plantyColor,
    borderColor: plantyColor,
  },
  headerImage: {
    flex: 1,
    height: 100,
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
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PlantScreen);
