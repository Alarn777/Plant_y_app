import Consts from '../ENV_VARS'
import Icon from 'react-native-vector-icons/Ionicons'
import RadioForm from 'react-native-simple-radio-button'
import React from 'react'
import { View, TextInput, Image, ImageBackground, ScrollView } from 'react-native'
import AwesomeButtonRick from 'react-native-really-awesome-button/src/themes/rick'
import styles from './Register.style'
import axios from 'axios'
import Modal from 'react-native-modal'
import { Button, Card } from 'react-native-elements'
import PropTypes from 'prop-types'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default class Register extends React.Component {
  static navigationOptions = {
    headerTitle: (
      <Image
        resizeMode="contain"
        style={styles.headerImage}
        source={require('../assets/logo.png')}
      />
    ),
    headerTitleStyle: {
      flex: 1,
      textAlign: 'center',
      alignSelf: 'center'
    }
  }
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      password: '',
      password2: '',
      address: '',
      cleaner: false,
      avatar: '',
      IconColor: '#8BC34A',
      isModalVisible: false,
      modalText: 'OK'
    }
    this.toggleModal = this.toggleModal.bind(this)
    this.register = this.register.bind(this)
    this.validateForm = this.validateForm.bind(this)
    this.registerUser = this.registerUser.bind(this)
    this.registered = this.registered.bind(this)
  }
  componentDidMount() {
    this.setState({
      IconColor: '#8BC34A'
    })
  }

  validateForm() {
    if (
      this.state.email === '' ||
      this.state.password === '' ||
      this.state.password !== this.state.password2
    ) {
      this.setState({ IconColor: '#B80000' })
      this.setState({ password: '', password2: '' })
    } else {
      this.setState({ IconColor: '#8BC34A' })
      this.toggleModal()
      this.registerUser()
    }
  }
  registerUser() {
    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      address: this.state.address,
      cleaner: this.state.cleaner,
      avatar: this.state.avatar,
      about: this.state.about
    }
    this.register(newUser)
  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }

  async register(data) {
    axios.post(Consts.host + '/register', data).then(response => {
      if (response.data.email) {
        this.registered(response.data.email)
      } else {
        this.registered(null)
      }
    })
  }

  registered(data) {
    if (data) this.setState({ modalText: 'Registered' + data })
    else {
      this.setState({ modalText: 'Failed to register' })
    }
  }

  onClickListener(viewId) {
    if (viewId === 'submit') {
      this.validateForm()
    }
  }

  render() {
    return (
      <KeyboardAwareScrollView extraScrollHeight={30}>
      <ImageBackground source={require('../assets/Background.jpg')} style={styles.backgroundImage}>

          <ScrollView contentContainerStyle={styles.container}>
            <Image
              resizeMode="contain"
              style={styles.logo}
              source={require('../assets/logo.png')}
            />
            <View style={styles.inputContainer}>
              <Icon style={styles.inputIcon} name="ios-person" size={30} color="#8BC34A" />
              <TextInput
                style={styles.inputs}
                placeholder="Name"
                underlineColorAndroid="transparent"
                onChangeText={name => this.setState({ name })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                style={styles.inputIcon}
                name="ios-mail"
                size={30}
                color={this.state.IconColor}
              />
              <TextInput
                style={styles.inputs}
                placeholder="Email"
                keyboardType="email-address"
                underlineColorAndroid="transparent"
                onChangeText={email => this.setState({ email })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                style={styles.inputIcon}
                name="ios-lock"
                size={30}
                color={this.state.IconColor}
              />
              <TextInput
                style={styles.inputs}
                placeholder="Password"
                secureTextEntry
                underlineColorAndroid="transparent"
                onChangeText={password => this.setState({ password })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon
                style={styles.inputIcon}
                name="ios-lock"
                size={30}
                color={this.state.IconColor}
              />
              <TextInput
                style={styles.inputs}
                placeholder="Repeat password"
                secureTextEntry
                underlineColorAndroid="transparent"
                onChangeText={password2 => this.setState({ password2 })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon style={styles.inputIcon} name="ios-home" size={30} color="#8BC34A" />
              <TextInput
                style={styles.inputs}
                placeholder="Address"
                underlineColorAndroid="transparent"
                onChangeText={address => this.setState({ address })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon style={styles.inputIcon} name="ios-images" size={30} color="#8BC34A" />
              <TextInput
                style={styles.inputs}
                placeholder="Avatar URL"
                underlineColorAndroid="transparent"
                onChangeText={avatar => this.setState({ avatar })}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon style={styles.inputIcon} name="ios-pizza" size={30} color="#8BC34A" />
              <TextInput
                style={styles.inputs}
                placeholder="About me..."
                underlineColorAndroid="transparent"
                onChangeText={about => this.setState({ about })}
              />
            </View>
            <View style={styles.inputContainer}>
              <RadioForm
                style={styles.radioSelect}
                radio_props={[
                  { label: 'Cleaner      ', value: true },
                  { label: 'Customer', value: false }
                ]}
                formHorizontal
                labelHorizontal
                buttonColor={'#8BC34A'}
                animation
                onPress={value => {
                  this.setState({ cleaner: value })
                }}
              />
            </View>
            <AwesomeButtonRick
              type="primary"
              width={200}
              style={styles.registerButton}
              // onPress={this.toggleModal}
              onPress={() => this.onClickListener('submit')}
              // onPress={() => this.onClickListener('submit')}
            >
              Register
            </AwesomeButtonRick>
            <Modal style={{ justifyContent: 'center' }} isVisible={this.state.isModalVisible}>
              <Card title={'Registered successfully'}>
                <Button
                  backgroundColor="#03A9F4"
                  buttonStyle={styles.buttonOK}
                  // onPress={() => this.onClickListener('submit')}
                  onPress={() => {
                    this.toggleModal()
                    this.props.navigation.navigate('Login')
                  }}
                  //
                  //   // this.addToStarredCleaner()
                  // }}
                  title={this.state.modalText}
                />
              </Card>
            </Modal>
          </ScrollView>
      </ImageBackground>
      </KeyboardAwareScrollView>
    )
  }
}

Register.propTypes = {
  navigation: PropTypes.any
}
