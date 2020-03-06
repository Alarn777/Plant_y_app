import React from 'react';
import {View, StyleSheet, ActivityIndicator, ScrollView} from 'react-native';
import {Text} from 'react-native-elements';
import CleanerCard from './CleanerCard';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  addCleaner,
  removeCleaner,
  addSocket,
  reloadCleaners,
  // removeEvent
} from '../../FriendActions';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  favorites: {alignSelf: 'center', fontSize: 30},
  noResults: {width: '80%', alignSelf: 'center'},
});

class Starred extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cleaners: [],
      data: this.props.cleaners,
      user: null,
      loadResults: false,
      userEmail: this.props.route.navigation.state.params.userEmail,
    };
    this.pickCleaner = this.pickCleaner.bind(this);
    this.dealWithData = this.dealWithData.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.dealWithUserData = this.dealWithUserData.bind(this);
    this.removeFromStarred = this.removeFromStarred.bind(this);
  }

  componentDidMount() {
    // this.props.addSocket(this.socket)
    this.props.cleaners.socket[0].on('changedStatus', () => {
      this.props.reloadCleaners();
      this.fetchUser({email: this.state.userEmail});
    });
    this.fetchUser({email: this.state.userEmail});
  }

  async fetchData(data) {
    try {
      const response = await axios.post(
        Consts.host + '/getCleanerByEmail',
        data,
      );
      this.dealWithData(response.data[0]);
    } catch (err) {}
  }

  dealWithData(data) {
    this.props.addCleaner(data);
  }

  async fetchUser(data) {
    axios.post(Consts.host + '/getUserByEmail', data).then(res => {
      this.dealWithUserData(res.data[0]);
    });
  }

  dealWithUserData(data) {
    this.setState({
      user: data,
    });

    this.state.user.favorite_cleaners.map(cleaner => {
      this.fetchData({email: cleaner});
    });
  }

  async removeFromStarred(data) {
    const params = {
      cleanerEmail: data.email,
      userEmail: this.state.userEmail,
    };

    axios
      .post(Consts.host + '/removeFromStarred', params)
      .then(() => {
        this.setState({cleaners: []});
        this.fetchUser({email: this.state.userEmail});
      })
      .catch(() => {});

    this.props.removeCleaner(data);
  }

  pickCleaner(cleaner) {}

  renderCleaners() {
    if (!this.state.user) {
      return (
        <ActivityIndicator style={{flex: 1}} size="large" color="#8BC34A" />
      );
    } else if (this.props.cleaners.favorite_cleaners.length === 0) {
      return (
        <View style={styles.noResults}>
          <Text style={styles.text}>
            You have no starred cleaners, maybe add some?
          </Text>
        </View>
      );
    }
    return (
      <View style={{flex: 1}}>
        <Text style={styles.favorites}>My Favorites</Text>
        <ScrollView>
          {this.props.cleaners.favorite_cleaners.map(cleaner => {
            return (
              <CleanerCard
                key={cleaner._id}
                starred
                cleaner={cleaner}
                pickCleaner={() => this.pickCleaner(cleaner)}
                removeFromStarred={this.removeFromStarred}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  }

  render() {
    return <ScrollView>{this.renderCleaners()}</ScrollView>;
  }
}

const mapStateToProps = state => {
  const {friends, cleaners} = state;
  return {friends, cleaners};
};

Starred.propTypes = {
  cleaners: PropTypes.any,
  route: PropTypes.any,
  addCleaner: PropTypes.func,
  removeCleaner: PropTypes.func,
  // addSocket: PropTypes.func,
  reloadCleaners: PropTypes.func,
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addCleaner,
      removeCleaner,
      addSocket,
      reloadCleaners,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Starred);
