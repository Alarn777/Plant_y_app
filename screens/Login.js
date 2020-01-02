import Icon from 'react-native-vector-icons/Ionicons'
import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Image,
  ImageBackground
} from 'react-native'
import axios from 'axios'
import Consts from '../ENV_VARS'

import AwesomeButtonRick from 'react-native-really-awesome-button/src/themes/rick'
import PropTypes from 'prop-types'

import BackgroundImage from '../assets/Background.jpg'






const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderBottomWidth: 1,
    width: 300,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30
  },
  topImage: { height: 40 },
  headerText: {
    fontFamily: 'Times New Roman',
    fontSize: 20,
    fontWeight: 'bold',
    // color: '#39594b',
    color: '#b9ff96',
    marginBottom: 30,
    marginTop: 40
  }
})

export default class Login extends React.Component {
  static navigationOptions = {
    headerTitle: (
      <Image resizeMode="contain" style={styles.topImage} source={require('../assets/logo.png')} />
    ),
    headerTitleStyle: {
      flex: 1,
      textAlign: 'center',
      alignSelf: 'center',
      lockIconColor: '',
      renderUser: false,
      renderCleaner: false,
      IconColor: ''
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      email: '',
      password: '',
      userToken: ''
    }
    this.fetchData = this.fetchData.bind(this)
    this.checkIfCleaner = this.checkIfCleaner.bind(this)
    this.dealWithData = this.dealWithData.bind(this)
  }

  componentDidMount() {
    this.setState({ IconColor: '#8BC34A' })
  }

  onClickListener = viewId => {
    if (viewId === 'register') {
      this.props.navigation.navigate('Register', {
        navigation: this.props.navigation
      })
    }
    if (viewId === 'login') {
      //simplifyLogin
      this.fetchData()
      // this.props.navigation.navigate('HomeScreenCleaner', {
      //   userToken: 'asdasd',
      //   userEmail: 'Mona@gmail.com'
      // })

      // this.props.navigation.navigate('HomeScreenUser', {
      //   userToken: 'asdasd',
      //   userEmail: 'John@gmail.com'
      // })

      // this.fetchData()
      // this.setState({renderCleaner:true})
      // this.props.navigation.navigate('HomeScreenUser')
    }
  }

  async fetchData() {
    try {
      const response = await axios.post(Consts.host + '/login', {
        email: this.state.email,
        password: this.state.password
      })
      if (response.data.userToken) {
        this.setState({ userToken: response.data.userToken })
        this.checkIfCleaner()
        this.setState({ IconColor: '#8BC34A' })
      } else {
        this.setState({ IconColor: '#B80000', password: '' })
      }
    } catch (err) {}
  }

  async checkIfCleaner() {
    try {
      const response = await axios.post(Consts.host + '/getUserByEmail', {
        email: this.state.email
      })
      if (response.data !== []) {
        this.dealWithData(response.data)
        return
      }
    } catch (err) {}
    try {
      const response = await axios.post(Consts.host + '/getCleanerByEmail', {
        email: this.state.email
      })
      if (response.data !== []) {
        this.dealWithData(response.data)
        return
      }
    } catch (err) {}
  }

  dealWithData(data) {
    if (data[0].cleaner) {
      this.props.navigation.navigate('HomeScreenCleaner', {
        userToken: this.state.userToken,
        userEmail: this.state.email
      })
    } else {
      this.props.navigation.navigate('HomeScreenUser', {
        userToken: this.state.userToken,
        userEmail: this.state.email
      })
    }

    // if (data.userToken) {
    //   this.setState({ userToken: data.userToken })
    //   this.props.navigation.navigate('HomeScreenUser', {
    //     userToken: this.state.userToken,
    //     userEmail: this.state.email
    //   })
    // } else {
    // }
  }

  render() {
    return (
      <ImageBackground
        source={require('../assets/Background.jpg')}
        style={{ width: '100%', height: '100%' }}
      >
        <View style={styles.container}>
          <Image
            resizeMode="contain"
            style={{ height: 100, marginBottom: 20 }}
            source={require('../assets/logo.png')}
          />
          <Text style={styles.headerText}>Faster and reliable cleaning process</Text>
          <View style={styles.inputContainer}>
            <Icon style={styles.inputIcon} name="ios-mail" size={30} color={this.state.IconColor} />
            <TextInput
              style={styles.inputs}
              placeholder="Email"
              keyboardType="email-address"
              underlineColorAndroid="transparent"
              onChangeText={email => this.setState({ email })}
            />
          </View>
          <View style={styles.inputContainer}>
            <Icon style={styles.inputIcon} name="ios-lock" size={30} color={this.state.IconColor} />
            <TextInput
              style={styles.inputs}
              placeholder="Password"
              secureTextEntry
              underlineColorAndroid="transparent"
              onChangeText={password => this.setState({ password })}
            />
          </View>
          <AwesomeButtonRick
            type="anchor"
            width={200}
            style={{ margin: 15 }}
            onPress={() => this.onClickListener('login')}
          >
            Login
          </AwesomeButtonRick>
          <AwesomeButtonRick
            type="primary"
            width={200}
            style={{ margin: 15 }}
            onPress={() => this.onClickListener('register')}
          >
            Register
          </AwesomeButtonRick>

          <TouchableHighlight
            style={styles.buttonContainer}
            onPress={() => this.onClickListener('restore_password')}
          >
            <Text style={{ color: 'white' }}>Forgot your password?</Text>
          </TouchableHighlight>
        </View>
      </ImageBackground>
    )
  }
}

Login.propTypes = {
  route: PropTypes.any,
  navigation: PropTypes.any
}
