import React from 'react';
import PropTypes from 'prop-types';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import Consts from '../../ENV_VARS';
import CleaningEventForCleaner from './CleaningEventForCleaner';
import axios from 'axios';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  addEvent,
  removeEvent,
  addCleaner,
  addSocket,
  reloadEvents,
} from '../../FriendActions';

const styles = StyleSheet.create({
  eventContainer: {flex: 1},
  MyEvents: {
    alignSelf: 'center',
    fontSize: 30,
  },
  error: {width: '80%', alignSelf: 'center'},
});

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cleaner: null,
      cleanEvents: [],
      navigation: this.props.navigation,
      userEmail: this.props.route.navigation.state.params.userEmail,
      isModalVisible: false,
      date: '',
    };
    this.fetchEvents = this.fetchEvents.bind(this);
    this.dealWithUserData = this.dealWithUserData.bind(this);
  }

  componentDidMount() {
    this.props.cleaners.socket[0].on('changedStatus', () => {
      this.setState({cleanEvents: []});
      this.fetchEvents({email: this.state.userEmail});
    });
    this.fetchEvents({email: this.state.userEmail});
  }

  async fetchEvents(data) {
    axios.post(Consts.host + '/findEventsByCleanerEmail', data).then(res => {
      this.dealWithUserData(res.data);
    });
  }

  dealWithUserData(data) {
    for (const i in data) {
      if (data[i].status === 'Finished' && data[i].rating === 5) {
        this.setState({cleanEvents: [...this.state.cleanEvents, data[i]]});
        // this.props.addEvent(data[i])
      }
    }
  }

  render() {
    if (this.state.cleanEvents.length === 0) {
      return (
        <View style={styles.error}>
          <Text>We have found no events for you...</Text>
        </View>
      );
    }

    return (
      <View style={styles.eventContainer}>
        <Text style={styles.MyEvents}>My Events</Text>
        <ScrollView>
          {this.state.cleanEvents.map(event => {
            return (
              <CleaningEventForCleaner
                key={event._id}
                event={event}
                home={this}
                navigation={this.state.navigation}
                cancelCleaner={null}
                addToStarredCleaner={null}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

History.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  cleaners: PropTypes.object.isRequired,
  addEvent: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
  const {cleaners, events, socket} = state;
  return {cleaners, events, socket};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addEvent,
      removeEvent,
      addCleaner,
      addSocket,
      reloadEvents,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(History);
