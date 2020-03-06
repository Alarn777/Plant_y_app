import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Text, View, Image, ScrollView, ActivityIndicator} from 'react-native';
import StarRating from 'react-native-star-rating';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import AwesomeButtonRick from 'react-native-really-awesome-button/src/themes/rick';
import styles from './CleanerProfile.styles';
import {bindActionCreators} from 'redux';
import {reloadEvents, reloadCleaners} from '../../FriendActions';
import {connect} from 'react-redux';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      email: this.props.route.navigation.state.params.userEmail,
      name: '',
      about: '',
      stars: 0,
    };
    this.handleLogOut = this.handleLogOut.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
  }

  componentDidMount() {
    this.fetchData({email: this.state.email});
  }

  async fetchData(data) {
    axios.post(Consts.host + '/getCleanerByEmail', data).then(res => {
      this.dealWithData(res.data[0]);
    });
  }

  dealWithData(data) {
    const user = {
      name: data.name,
      description: data.about,
      stars: data.rating,
      avatar: data.avatar,
    };
    this.setState({
      user,
    });
  }

  handleLogOut() {
    this.props.reloadEvents();
    this.props.reloadCleaners();

    this.props.route.navigation.navigate('Login');
  }

  render() {
    if (this.state.user) {
      return (
        <ScrollView style={styles.container}>
          <View style={styles.header} />
          <Image style={styles.avatar} source={{uri: this.state.user.avatar}} />
          <View style={styles.bodyContent}>
            <StarRating
              style={styles.starRating}
              disabled
              emptyStar={'ios-star-outline'}
              fullStar={'ios-star'}
              halfStar={'ios-star-half'}
              iconSet={'Ionicons'}
              maxStars={5}
              rating={this.state.user.stars}
              selectedStar={rating => this.onStarRatingPress(rating)}
              fullStarColor={'gold'}
            />
            <Text style={styles.name}>{this.state.user.name}</Text>
            <Text style={styles.info}>{this.state.user.description}</Text>

            <AwesomeButtonRick
              type="primary"
              width={200}
              style={styles.logOutButton}
              backgroundColor={'#FF5722'}
              backgroundDarker={'#9d3143'}
              onPress={this.handleLogOut}>
              Log out
            </AwesomeButtonRick>
          </View>
        </ScrollView>
      );
    }
    return (
      <ActivityIndicator
        style={styles.activityIndicator}
        size="large"
        color="#8BC34A"
      />
    );
  }
}

Profile.propTypes = {
  route: PropTypes.any,
  reloadEvents: PropTypes.func,
  reloadCleaners: PropTypes.func,
  navigation: PropTypes.any,
};

const mapStateToProps = state => {
  const {cleaners, events, socket} = state;
  return {cleaners, events, socket};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      reloadEvents,
      reloadCleaners,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Profile);
