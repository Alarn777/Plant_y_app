import React from 'react';
import {
  Image,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';
import {Icon, Text, Card} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';

import {Button} from 'react-native-paper';

//redusx
import {connect} from 'react-redux';
import {addPlace} from '../../actions/place';

// import RNAmazonKinesis from 'react-native-amazon-kinesis';

// import {LivePlayer} from "react-native-live-stream";

class AddPlantScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plant: null,
      USER_TOKEN: '',
      URL: '',
      loadBuffering: false,
      addingPlant: false,
      addingPlanticon: '',
      addingPlantText: 'Add to my garden',
      addingPlantDisabled: false,
    };

    this.dealWithUrlData = this.dealWithUrlData.bind(this);
    this.addPlantToMyGarden = this.addPlantToMyGarden.bind(this);
  }

  dealWithUrlData = url => {
    this.setState({URL: url.HLSStreamingSessionURL});
    this.forceUpdate();
  };

  async addPlantToMyGarden() {
    console.log('pressed');

    this.setState({addingPlant: true});
    setTimeout(this.successAdding, 1000);
    // this.props.navigation.goBack();
  }

  successAdding = () => {
    this.setState({
      addingPlant: false,
      addingPlanticon: 'check',
      addingPlantText: 'Added',
      addingPlantDisabled: true,
    });
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

  render() {
    console.log(this.state.URL);
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
                  // navigation.goBack();
                }}>
                {this.state.addingPlantText}
              </Button>
            );
          }}>
          <Image
            style={{alignSelf: 'center', margin: 5, height: 200, width: 200}}
            source={{uri: item.pic}}
          />
          {/*<Image style={styles.headerImage} source={{uri: item.pic}} />*/}
          <Text style={styles.mainText}>About</Text>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 16,
            }}>
            {item.description}
          </Text>
        </Card>
      </View>
    );
  }
}

export default AddPlantScreen;

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
