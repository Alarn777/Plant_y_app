import React from 'react';
import {
  Image,
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import {Icon, Text, Card} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {Button, Card as PaperCard, Divider, FAB} from 'react-native-paper';
//redusx
import {connect} from 'react-redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {IconButton} from 'react-native-paper';
import {bindActionCreators} from 'redux';
import {AddAvatarLink} from '../../FriendActions';
import Amplify, {Storage} from 'aws-amplify';
import LinearGradient from 'react-native-linear-gradient';
// import RNAmazonKinesis from 'react-native-amazon-kinesis';

// import {LivePlayer} from "react-native-live-stream";
const plantyColor = '#6f9e04';

class Picture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plant: this.props.navigation.getParam('picture'),
      // deletingPlantIcon:'delete',
      // USER_TOKEN: this.props.navigation.getParam('user_token'),
      URL: '',
      // planterName: this.props.navigation.getParam('planterName'),
      loadBuffering: false,
      loading: false,

      testingPlantText: 'Test',
      testingPlant: false,
      testingPlanticon: 'clipboard-play-outline',
      // deletingPlantText: 'Failed to delete',
      // deletingPlantDisabled: false,
      healthStatus: 0,
      plant_tested: false,
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    };

    this.checkPlantHealth = this.checkPlantHealth.bind(this);
    // this.dealWithPlantsData = this.dealWithPlantsData.bind(this);
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

  async checkPlantHealth() {
    // console.log(this.props.plantyData);

    console.log(this.props.navigation.getParam('picture').key);
    // console.log(this.props.plantyData.myCognitoUser.username);
    // console.log(this.props.navigation.getParam('planterName'));

    this.setState({testingPlantText: 'Testing...'});
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);

    await axios
      .post(
        Consts.apigatewayRoute + '/testPlantPicture',
        {
          key: this.props.navigation.getParam('picture').key,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        // If request is good...
        // console.log(response.data);
        // console.log(response);
        let labels_array = response.data.body.CustomLabels;
        // console.log(labels_array);

        let sick = 0.0;
        labels_array.map(one => {
          if (one.Name === 'sick') {
            sick = parseFloat(one.Confidence);
          }
        });
        console.log(100 - sick);
        this.setState({healthStatus: 100 - sick});

        this.successTesting();
      })
      .catch(error => {
        this.failureTesting();
        console.log('error ' + error);
      });
  }

  async deletePicture() {}

  successTesting = () => {
    this.setState({
      testingPlant: false,
      plant_tested: true,
      testingPlanticon: 'check',
      testingPlantText: 'Success',
      // testingPlantDisabled: true,
    });
    // setTimeout(this.goBack, 1200);

    // this.props.navigation.getParam('loadPlanters')();
  };

  // goBack = () => {
  //   this.props.navigation.navigate('planterScreen', {
  //     plantWasRemoved: true,
  //   });
  // };

  failureTesting = () => {
    this.setState({
      testingPlant: false,
      testingPlanticon: 'alert-circle-outline',
      testingPlantText: 'Failed to test',
      // deletingPlantDisabled: true,
    });
  };

  renderTestResults = () => {
    if (!this.state.plant_tested) {
      return <View style={styles.linearGradient} />;
    } else
      return (
        <View>
          <LinearGradient
            start={{x: 0.3}}
            end={{x: 0.7}}
            colors={['red', 'yellow', plantyColor]}
            style={styles.linearGradient}>
            <Text
              style={{
                fontSize: 100,
                fontFamily: 'Gill Sans',
                textAlign: 'left',
                marginTop: 10,
                marginBottom: 10,
                // margin: 10,
                position: 'relative',
                // left: (this.state.width + 350 / 200) * this.state.healthStatus,
                left: ((this.state.width - 65) / 100) * this.state.healthStatus,
                // left: 0,
                // right: -100,
                color: 'black',
                // left: 0,
                backgroundColor: 'transparent',
              }}>
              |
            </Text>
          </LinearGradient>
          <View
            style={{
              // flex:
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              padding: 8,
            }}>
            <Text>Sick</Text>
            <Text>Healthy</Text>
          </View>
        </View>
      );
  };

  render() {
    const {navigation} = this.props;

    return (
      <View style={styles.container}>
        <PaperCard style={{height: '100%'}}>
          {/*<PaperCard.Title title="Card Title" subtitle="Card Subtitle" left={(props) => <Avatar.Icon {...props} icon="folder" />} />*/}
          {/*<PaperCard.Cover*/}
          {/*  style={{height: '70%', resizeMode: 'contain'}}*/}
          {/*  source={{uri: this.props.navigation.getParam('picture').url}}*/}
          {/*/>*/}
          <PaperCard.Content style={{marginTop: 10}}>
            <Image
              style={{height: '70%', resizeMode: 'contain'}}
              source={{uri: this.props.navigation.getParam('picture').url}}
            />
            {this.renderTestResults()}
            <Button
              icon={this.state.testingPlanticon}
              style={{margin: 10}}
              loading={this.state.testingPlant}
              // disabled={this.state.testingPlantDisabled}
              mode="outlined"
              backgroundColor="#6f9e04"
              color="#6f9e04"
              onPress={() => {
                this.checkPlantHealth()
                  .then()
                  .catch();
                // navigation.goBack();
              }}>
              {this.state.testingPlantText}
            </Button>
          </PaperCard.Content>

          {/*<PaperCard.Actions>*/}
          {/*  <Button*/}
          {/*    icon={this.state.testingPlanticon}*/}
          {/*    style={{margin: 10}}*/}
          {/*    loading={this.state.testingPlant}*/}
          {/*    // disabled={this.state.testingPlantDisabled}*/}
          {/*    mode="outlined"*/}
          {/*    backgroundColor="#6f9e04"*/}
          {/*    color="#6f9e04"*/}
          {/*    onPress={() => {*/}
          {/*      this.checkPlantHealth()*/}
          {/*        .then()*/}
          {/*        .catch();*/}
          {/*      // navigation.goBack();*/}
          {/*    }}>*/}
          {/*    {this.state.testingPlantText}*/}
          {/*  </Button>*/}
          {/*</PaperCard.Actions>*/}
        </PaperCard>

        {/*<PaperCard />*/}
        {/*<PaperCard.Content>*/}
        {/*  <Image*/}
        {/*    style={{height: '75%', width: this.state.width - 10}}*/}
        {/*    source={{uri: this.props.navigation.getParam('picture').url}}*/}
        {/*  />*/}
        {/*</PaperCard.Content>*/}
        {/*<PaperCard.Actions>*/}
        {/*  <Button*/}
        {/*    icon={this.state.testingPlanticon}*/}
        {/*    style={{margin: 10}}*/}
        {/*    loading={this.state.testingPlant}*/}
        {/*    // disabled={this.state.testingPlantDisabled}*/}
        {/*    mode="outlined"*/}
        {/*    backgroundColor="#6f9e04"*/}
        {/*    color="#6f9e04"*/}
        {/*    onPress={() => {*/}
        {/*      this.checkPlantHealth()*/}
        {/*        .then()*/}
        {/*        .catch();*/}
        {/*      // navigation.goBack();*/}
        {/*    }}>*/}
        {/*    {this.state.testingPlantText}*/}
        {/*  </Button>*/}
        {/*</PaperCard.Actions>*/}
        {/*<PaperCard />*/}
        {/*<Text style={styles.mainText}>Planter health</Text>*/}
        {/*<PaperCard>{this.renderTestResults()}</PaperCard>*/}
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
    // width: '98%',
    // justifyContent: 'center',
    // alignItems: 'center',
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
  linearGradient: {
    // flex: 1,
    // paddingLeft: 15,
    // paddingRight: 15,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 100,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    position: 'relative',
    color: 'black',
    backgroundColor: 'transparent',
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

export default connect(mapStateToProps, mapDispatchToProps)(Picture);
