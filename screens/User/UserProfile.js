import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
// import StarRating from 'react-native-star-rating'
import axios from 'axios';
import Consts from '../../ENV_VARS';
import AwesomeButtonRick from 'react-native-really-awesome-button/src/themes/rick';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {reloadEvents, reloadCleaners} from '../../FriendActions';
import {connect} from 'react-redux';

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#8BC34A',
    height: 200,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 130,
  },
  bodyContent: {
    marginTop: 40,
    alignItems: 'center',
    padding: 30,
  },
  name: {
    marginTop: 40,
    fontSize: 28,
    color: '#696969',
    fontWeight: '600',
  },
  info: {
    fontSize: 16,
    color: '#00BFFF',
    marginTop: 10,
  },
});

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      email: this.props.route.navigation.state.params.userEmail,
      name: '',
      description: '',
      stars: 0,
    };
    this.logOut = this.logOut.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
  }

  componentDidMount(): void {
    this.fetchData({email: this.state.email});
  }

  async fetchData(data) {
    axios.post(Consts.host + '/getUserByEmail', data).then(res => {
      this.dealWithData(res.data[0]);
    });
  }

  dealWithData(data) {
    const user = {
      name: data.name,
      description: data.description,
      stars: data.rating,
      avatar: data.avatar,
    };
    this.setState({
      user,
    });
  }

  logOut() {
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
            {/*<StarRating*/}
            {/*  style={{ marginTop: 100 }}*/}
            {/*  disabled*/}
            {/*  emptyStar={'ios-star-outline'}*/}
            {/*  fullStar={'ios-star'}*/}
            {/*  halfStar={'ios-star-half'}*/}
            {/*  iconSet={'Ionicons'}*/}
            {/*  maxStars={5}*/}
            {/*  rating={this.state.user.stars}*/}
            {/*  selectedStar={rating => this.onStarRatingPress(rating)}*/}
            {/*  fullStarColor={'gold'}*/}
            {/*/>*/}
            <Text style={styles.name}>{this.state.user.name}</Text>
            <Text style={styles.info}>{this.state.user.description}</Text>
            <AwesomeButtonRick
              type="primary"
              width={200}
              style={{margin: 15}}
              backgroundColor={'#FF5722'}
              backgroundDarker={'#9d3143'}
              onPress={this.logOut}>
              Log out
            </AwesomeButtonRick>
          </View>
        </ScrollView>
      );
    }
    return <ActivityIndicator style={{flex: 1}} size="large" color="#8BC34A" />;
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
