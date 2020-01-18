import React from 'react'
import {Image, View, FlatList, ScrollView, Dimensions, TouchableOpacity} from 'react-native';
import { Auth } from 'aws-amplify';

import PropTypes from 'prop-types'
import { StyleSheet } from 'react-native';
import {
  Icon,
  Text,
  Card,
  Button,
} from '@ui-kitten/components';


import {
  withAuthenticator,
  //Greetings,
  Loading,
} from 'aws-amplify-react-native';
import {ConfirmSignIn, ConfirmSignUp, ForgotPassword, RequireNewPassword, SignIn, SignUp, VerifyContact, Greetings} from '../Auth';
import AmplifyTheme from '../AmplifyTheme';
import axios from 'axios';
import Consts from '../../ENV_VARS';






class MainScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 0,
      userLoggedIn:true,
      userEmail: "",
      userName:"",
      width: 0,
      height: 0,
      plants: [
        // { "id":1, "name":"Bla", "models":[ "Fiesta", "Focus", "Mustang" ] },
        // { "id":2, "name":"Mla", "models":[ "320", "X3", "X5" ] },
        // { "id":3, "name":"Wua", "models":[ "500", "Panda" ] },
        // { "id":4, "name":"Kas", "models":[ "500", "Panda" ] },
        // { "id":5, "name":"Byu", "models":[ "500", "Panda" ] },
        // { "id":6, "name":"Lop", "models":[ "500", "Panda" ] },
        // { "id":7, "name":"Bth", "models":[ "500", "Panda" ] }
        ],
      parties:[],
      change: false,
      user: null,

    }
    this.loadPlants = this.loadPlants.bind(this)
    this.dealWithPlantsData = this.dealWithPlantsData.bind(this)
    this.dealWithData = this.dealWithData.bind(this)
    this.fetchUser = this.fetchUser.bind(this)
    this.onLayout = this.onLayout.bind(this);
  }

  dealWithData = (user) => {
    this.setState({user})
    if(this.state.user)
      this.setState({userLoggedIn:true})

  }
  dealWithPlantsData = (plants) => {
    console.log(plants.Items)
    this.setState({plants:plants.Items})
    // plants.Items.map(plant => this.state.plants.push(plant))
    //   // this.setState({plants})
    // this.setState({change:false})
  }

   async fetchUser() {
    await Auth.currentAuthenticatedUser({
       bypassCache: false  // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    }).then((user) => { this.dealWithData(user) })
        .catch(err => console.log(err));
  }

  async loadPlants(){
    console.log("loadPlants");
    let USER_TOKEN = ""

    USER_TOKEN = this.props.authData.signInUserSession.idToken.jwtToken
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios.get(Consts.apigatewayRoute + '/plants', { headers: { Authorization: AuthStr } }).then(response => {
      // If request is good...
      console.log(response.data);
      this.dealWithPlantsData(response.data)
    })
        .catch((error) => {
          console.log('error 3 ' + error);
        });



    // await axios.get('https://i7maox5n5g.execute-api.eu-west-1.amazonaws.com/test').then(res => {
    //   // this.dealWithUserData(res.data[0])
    //   console.log(res);
    // }).catch(error => console.log(error))
  }




   componentWillMount() {
    this.fetchUser().then(() => {
      this.props.navigation.setParams({logOut: this.logOut})
      this.props.navigation.setParams({userLoggedIn: this.state.userLoggedIn})} )
  }

  componentDidMount(): void {
    const { authState, authData } = this.props;
    const user = authData;
    if (user) {
      const {usernameAttributes = []} = this.props;
      if (usernameAttributes === 'email') {
        // Email as Username
        this.setState({userName:user.attributes ? user.attributes.email : user.username})
      }
    }
    else this.setState({userName: "Guest"})
    this.loadPlants().then()

  }


  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerShown:navigation.getParam('userLoggedIn'),
      headerTitle: (
          <Image
              resizeMode="contain"
              style={{height: 40}}
              source={require('../../assets/logo.png')}
          />
      ),
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center'
      },
      headerRight: () => (
          <Button
              onPress={navigation.getParam('logOut')}
              title="Info"
              // color="#fff"
              appearance='ghost'
              style={{color: "gray"}}
              icon={(style) => {
                return <Icon {...style} name='log-out-outline'/>
              }}
              status='basic'
          />

      ),
    }
  }

  logOut = () => {
    // const { onStateChange } = this.props;
    Auth.signOut().then(() => {
      this.props.onStateChange('signedOut');
      // onStateChange('signedOut');
    });
    // this.setState({userLoggedIn:false})

    this.state.userLoggedIn = !this.state.userLoggedIn;
    this.state.user = null;
    this.setState({userLoggedIn:false});
    console.log(this.state)

  }

  onLayout(e) {
    this.setState({
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
    });
  }


  _keyExtractor = (item) => item.id;

  _renderItem = ({item}) => {

    console.log(item.pic)
    return(
        <View>
          <Card
              header={() => {
                return(<TouchableOpacity
                                onPress={() => this.props.navigation.navigate('PlantScreen', {
                                  item: item,
                                })}
                            >
                          <Image
                              style={styles.headerImage}
                              source={{uri: item.pic}}
                          />
                        </TouchableOpacity>)
              }}
              style={{width: this.state.width / 3 - 5}}
              index={item.id}
              key={item.id}
          >
            <TouchableOpacity
                onPress={() => this.props.navigation.navigate('PlantScreen', {
                  item: item,
                })}
            >
          {/*    <View>*/}
          {/*    <Image*/}
          {/*        style={styles.headerImage}*/}
          {/*        source={{uri: item.pic}}*/}
          {/*    />*/}
          {/*  </TouchableOpacity>*/}
          {/*  <TouchableOpacity*/}
          {/*      onPress={() => this.props.navigation.navigate('PlantScreen', {*/}
          {/*        item: item,*/}
          {/*      })}*/}
          {/*  >*/}
              <Text style={styles.partyText}>{item.name}</Text>
            </TouchableOpacity>
          </Card>
        </View>
    );
  }




  render() {
    return ( <View style={styles.container}
                   onLayout={this.onLayout}>
      <View style={styles.header}>
        <Text style={styles.headerText}>My garden</Text>
      </View>
      <ScrollView style={styles.data}>
        <FlatList numColumns={3}
                  style={{width:this.state.width,margin:5}}
                  data={this.state.plants}
                  keyExtractor={this._keyExtractor}
                  renderItem={this._renderItem}
        >
        </FlatList>
      </ScrollView>
    </View>
    )}
}

MainScreen.propTypes = {
  navigation: PropTypes.any,
  addEvent: PropTypes.func
}

export default withAuthenticator(MainScreen, false, [
  <SignIn/>,
  <ConfirmSignIn/>,
  <VerifyContact/>,
  <SignUp/>,
  <ConfirmSignUp/>,
  <ForgotPassword/>,
    <Greetings/>,
  <RequireNewPassword />
]);



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
  },
  headerText:{
    fontSize:20
  },
  header: {
    justifyContent: "center", alignItems: "center",
    // margin: 5,
    height:20,
    marginTop:10,
    flexDirection: 'row',
    // backgroundColor: '#66ffcc',
    // height: '10%',
    // borderRadius:5
  },
  partyText:{
    fontWeight: 'bold',
    textAlign:'center',
    fontSize:16

  },
  button:{
    justifyContent: "center",
    width: '20%',
    borderRadius:5,
    height: '80%',
    marginLeft:30,
    borderColor:'blue',
    backgroundColor:'lightblue'
  },
  data: {
    flexWrap:'wrap',
    flex:1,
    flexDirection: 'row'
  },
  headerImage: {
    flex: 1,
    height: 100,
  },
});
