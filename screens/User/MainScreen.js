import React from 'react'
import { BottomNavigation } from 'react-native-paper'
import { Image } from 'react-native'
import { NavigationActions } from 'react-navigation'

import Home from './Home'
import History from './History'
import Starred from './Starred'
import UserProfile from './UserProfile'
import PropTypes from 'prop-types'

export default class MainScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 0,
      userEmail: this.props.navigation.state.userEmail,
      cleaners: [],
      change: false,
      user: null,

      routes: [
        {
          key: 'home',
          title: 'Home',
          icon: 'home',
          color: '#8BC34A',
          navigation: this.props.navigation
        },
        {
          key: 'History',
          title: 'My cleans',
          icon: 'history',
          color: 'green',
          navigation: this.props.navigation,
          father: this
        },
        {
          key: 'Starred',
          title: 'Rate',
          icon: 'star',
          color: '#ffc107',
          navigation: this.props.navigation,
          father: this
        },
        {
          key: 'UserProfile',
          title: 'Profile',
          icon: 'person',
          color: '#00baff',
          navigation: this.props.navigation
        }
      ]
    }
    this.resetNavigation = this.resetNavigation.bind(this)
    this.set = this.set.bind(this)
    this.check = this.check.bind(this)
  }

  static navigationOptions = {
    headerLeft: null,
    headerTitle: (
      <Image
        resizeMode="contain"
        style={{ height: 40 }}
        source={require('../../assets/logo.png')}
      />
    ),
    headerTitleStyle: {
      flex: 1,
      textAlign: 'center',
      alignSelf: 'center'
    }
  }
  check() {
    return this.state.change
  }
  set() {
    this.setState({ change: !this.state.change })
  }

  resetNavigation(targetRoute) {
    const navigateAction = NavigationActions.navigate({
      routeName: targetRoute,
      index: 0,
      params: { cleaners: index },

      action: NavigationActions.navigate({ routeName: targetRoute })
    })

    this.props.navigation.dispatch(navigateAction)
  }

  handleIndexChange = index => {
    this.setState({ index })
  }

  _renderScene = BottomNavigation.SceneMap({
    home: Home,
    Starred,
    History,
    UserProfile
  })

  render() {
    return (
      <BottomNavigation
        onPress={() => {}}
        navigationState={this.state}
        onIndexChange={this.handleIndexChange}
        renderScene={this._renderScene}
        resetNavigation={this.resetNavigation}
      />
    )
  }
}

MainScreen.propTypes = {
  navigation: PropTypes.any,
  addEvent: PropTypes.func
}
