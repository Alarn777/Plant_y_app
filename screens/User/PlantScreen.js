import React from 'react';
import {Image, View, FlatList, StyleSheet, ScrollView} from 'react-native';
import Video from 'react-native-video';
import {Icon, Text, Card} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {Button, Divider, FAB} from 'react-native-paper';
//redusx
import {connect} from 'react-redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {IconButton} from 'react-native-paper';
import {bindActionCreators} from 'redux';
import {AddAvatarLink} from '../../FriendActions';

// import RNAmazonKinesis from 'react-native-amazon-kinesis';

// import {LivePlayer} from "react-native-live-stream";
const plantyColor = '#6f9e04';

class PlantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plant: this.props.navigation.getParam('item'),
      // deletingPlantIcon:'delete',
      USER_TOKEN: this.props.navigation.getParam('user_token'),
      URL: '',
      planterName: this.props.navigation.getParam('planterName'),
      loadBuffering: false,
      loading: false,
      adjustments: false,
      // deletingPlant:false,
      deletingPlantText: 'Remove',
      deletingPlant: false,
      deletingPlanticon: 'delete',
      // deletingPlantText: 'Failed to delete',
      deletingPlantDisabled: false,
    };
  }

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

  UNSAFE_componentWillMount(): void {
    // this.loadUrl().then(r => console.log());
  }

  componentDidMount(): void {
    // console.log(this.state.plant);
    // console.log(this.state.USER_TOKEN);
  }

  async removePlantFromPlanter() {
    // console.log('pressed');
    this.setState({deletingPlant: true});

    // console.log(this.props.plantyData.myCognitoUser.username);
    // console.log(this.props.navigation.getParam('item').name);
    // console.log(this.props.navigation.getParam('planterName'));
    // console.log(this.state.USER_TOKEN);
    // console.log(this.state.plant.description);

    // console.log(this.state.plant.UUID);
    // console.log(this.state.planterName);
    // console.log(this.props.plantyData.myCognitoUser.username);
    const AuthStr = 'Bearer '.concat(this.state.USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/removePlantFromPlanter',
        {
          username: this.props.plantyData.myCognitoUser.username,
          plantUUID: this.state.plant.UUID,
          planterName: this.state.planterName,
          // plantDescription: this.state.plant.description,
          // plantGrowthPlanGroup: this.state.plant.growthPlanGroup,
          // plantSoil: this.state.plant.soil,
        },

        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        // If request is good...
        // console.log(response.data);
        this.successDeleting();
        // this.dealWithUrlData(response.data);
      })
      .catch(error => {
        console.log('error ' + error);
        this.failureDeleting();
      });

    // setTimeout(this.successAdding, 1000);
    // this.props.navigation.goBack();
  }

  successDeleting = () => {
    this.setState({
      deletingPlant: false,
      deletingPlanticon: 'check',
      deletingPlantText: 'Deleted',
      deletingPlantDisabled: true,
    });
    setTimeout(this.goBack, 1200);

    // this.props.navigation.getParam('loadPlanters')();
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

    return (
      <View style={styles.container}>
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
                  // navigation.goBack();
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
            Appropriate soils:{' '}
            {this.props.navigation.getParam('item').soil.type}
          </Text>
        </Card>
      </View>
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
    // flex:1,
    margin: '1%',
    width: '98%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    // borderColor:'#6f9e04',
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

// const mapStateToProps = state => {
//     return {
//         places: state.places.places
//     }
// }
//
// const mapDispatchToProps = dispatch => {
//     return {
//         add: (name) => {
//             dispatch(addPlace(name))
//         }
//     }
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(App)
