import React from 'react'
import { BottomNavigation } from 'react-native-paper'
import { Image } from 'react-native'
import { NavigationActions } from 'react-navigation'

import Starred from './StarredCleaner'
import HomeClean from './Home'
import HistoryClean from './History'
import CleanerProfile from './CleanerProfile'
import PropTypes from 'prop-types'

export default class MainScreenCleaner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      index: 0,
      userEmail: this.props.navigation.state.params.userEmail,
      cleaners: [],
      change: false,
      user: null,
      color: 'green',
      routes: [
        {
          key: 'HomeClean',
          title: 'Home',
          // activeColor: '#8BC34A',
          icon: 'home',
          color: '#8BC34A',
          navigation: this.props.navigation
        },
        {
          key: 'HistoryClean',
          title: 'My cleans',
          icon: 'history',
          color: 'green',
          navigation: this.props.navigation,
          father: this
        },
        {
          key: 'Starred',
          title: 'Top Rated',
          icon: 'star',
          color: '#ffc107',
          // activeColor: '#F44336',
          navigation: this.props.navigation
        },
        {
          key: 'CleanerProfile',
          title: 'Profile',
          icon: 'person',
          color: '#00baff',
          // activeColor: '#F44336',
          navigation: this.props.navigation
        }
      ]
    }
    this.resetNavigation = this.resetNavigation.bind(this)
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
  // check(){
  //   return this.state.change
  // }

  // componentDidMount(): void {
  //   // console.log(this.props.navigation)
  //   // console.log(this)
  // }

  // set(){
  //   this.setState({change: !this.state.change})
  // }

  resetNavigation(targetRoute) {
    const navigateAction = NavigationActions.navigate({
      routeName: targetRoute,
      index: 0,
      params: {},
      action: NavigationActions.navigate({ routeName: targetRoute })
    })

    this.props.navigation.dispatch(navigateAction)
  }

  _handleIndexChange = index => {
    this.setState({ index })
  }

  _renderScene = BottomNavigation.SceneMap({
    HomeClean,
    HistoryClean,
    CleanerProfile,
    Starred
  })

  render() {
    return (
      <BottomNavigation
        navigationState={this.state}
        onIndexChange={this._handleIndexChange}
        renderScene={this._renderScene}
        resetNavigation={this.resetNavigation}
      />
    )
  }
}

MainScreenCleaner.propTypes = {
  navigation: PropTypes.any
}
