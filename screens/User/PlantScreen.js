import React from 'react';
import {Image, View, FlatList, StyleSheet} from 'react-native';
import Video from 'react-native-video';
import {Icon, Text, Card, Button} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';

//redusx
import {connect} from 'react-redux';
import {addPlace} from '../../actions/place';
import {HeaderBackButton} from 'react-navigation-stack';

// import RNAmazonKinesis from 'react-native-amazon-kinesis';

// import {LivePlayer} from "react-native-live-stream";

class PlantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plant: null,
      USER_TOKEN: '',
      URL: '',
      loadBuffering: false,
    };

    this.dealWithUrlData = this.dealWithUrlData.bind(this);
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

  dealWithUrlData = url => {
    this.setState({URL: url.HLSStreamingSessionURL});
    this.forceUpdate();
  };

  async loadUrl() {
    console.log('loadUrl');
    let USER_TOKEN = '';

    // USER_TOKEN = this.props.navigation.state
    // console.log( this.props.navigation.state.params)

    USER_TOKEN = this.props.navigation.state.params.user_token;

    this.state.USER_TOKEN = USER_TOKEN;

    const AuthStr = 'Bearer '.concat(this.state.USER_TOKEN);
    await axios
      .get(Consts.apigatewayRoute + '/streams', {
        headers: {Authorization: AuthStr},
      })
      .then(response => {
        // If request is good...
        console.log(response.data);
        this.dealWithUrlData(response.data);
      })
      .catch(error => {
        console.log('error ' + error);
      });

    // await axios.get('https://i7maox5n5g.execute-api.eu-west-1.amazonaws.com/test').then(res => {
    //   // this.dealWithUserData(res.data[0])
    //   console.log(res);
    // }).catch(error => console.log(error))
  }
  componentWillMount(): void {
    this.loadUrl().then(r => console.log());
  }

  componentDidMount(): void {}

  onBuffer = () => {
    this.setState({loadBuffering: true});
  };

  loadBuffering = () => {
    console.log('buffering');
    // if(this.state.loadBuffering)
    //     return <Text>Loading Video</Text>
    // else
    //     return <View/>
  };
  render() {
    console.log(this.state.URL);
    const {navigation} = this.props;
    let item = navigation.getParam('item');

    return (
      <View style={styles.container}>
        <Card
          style={{margin: 5, width: '95%'}}
          header={() => {
            return <Text style={styles.mainText}>{item.name}</Text>;
          }}
          footer={() => {
            return (
              <View>
                <Text style={styles.mainText}>Camera Controller</Text>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 16,
                  }}>
                  {' '}
                  is simply dummy text of the printing and typesetting industry.
                  Lorem Ipsum has been the industry's standard dummy text ever
                  since the 1500s, when an unknown printer took a galley of type
                  and scrambled it to make a type specimen book. It has survived
                  not only five centuries, but also the leap into electronic
                  typesetting, remaining essentially unchanged. It was
                  popularised in the 1960s with the release of Letraset sheets
                  containing Lorem Ipsum passages, and more recently with
                  desktop publishing software like Aldus PageMaker including
                  versions of Lorem Ipsum.
                </Text>
              </View>
            );
          }}>
          <Text style={styles.mainText}>Live stream</Text>
          <Video
            source={{uri: this.state.URL}} // Can be a URL or a local file.
            ref={ref => {
              this.player = ref;
            }} // Store reference
            resizeMode="stretch"
            controls={true}
            onBuffer={this.onBuffer} // Callback when remote video is buffering
            // onError={this.videoError}

            // onBuffer={this.onBuffer}                // Callback when remote video is buffering
            // onError={this.videoError}               // Callback when video cannot be loaded
            style={styles.backgroundVideo}
            minLoadRetryCount={10000}
            paused={true}
          />
          {this.loadBuffering()}
          <Text style={styles.mainText}>Camera Controller</Text>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 8,
            }}>
            <Button
              icon={style => {
                return <Icon {...style} name="log-out-outline" />;
              }}>
              Up
            </Button>
            <View
              style={{
                // flex:
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                padding: 8,
              }}>
              <Button>Left</Button>
              <Button>Right</Button>
            </View>
            <Button style={styles.button} status="primary">
              Down
            </Button>
          </View>
        </Card>
      </View>
    );
  }
}

export default PlantScreen;

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
    backgroundColor: '#6f9e04',
    color: '#6f9e04',
  },
  headerImage: {
    flex: 1,
    height: 100,
  },
});

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
