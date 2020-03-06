import React from 'react';
import {View, Text, ScrollView, ActivityIndicator} from 'react-native';
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
import PropTypes from 'prop-types';

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
      loading: false,
    };
    this.fetchEvents = this.fetchEvents.bind(this);
    this.dealWithUserData = this.dealWithUserData.bind(this);
  }

  componentDidMount() {
    this.setState({loading: true});
    this.fetchEvents({email: this.state.userEmail});
  }

  editEventByCleaner(event, status, notes) {
    notes.email = this.state.userEmail;
    event.notesByCleaner = notes.notesByCleaner;
    event.id = notes._id;
    status.email = this.state.userEmail;

    this.editEvent(notes, status);
    this.props.addEvent(event);
  }

  async editEvent(notes, status) {
    axios.post(Consts.host + '/addNotes', notes).then(() => {});

    axios.post(Consts.host + '/editEventByCleaner', status).then(() => {});
  }

  async fetchEvents(data) {
    axios.post(Consts.host + '/findEventsByCleanerEmail', data).then(res => {
      this.dealWithUserData(res.data);
    });
  }

  dealWithUserData(data) {
    for (const i in data) {
      if (data[i].status !== 'Requested') {
        this.props.addEvent(data[i]);
      }
    }
    this.setState({loading: false});
  }

  render() {
    if (this.state.loading && this.props.cleaners.events.length === 0) {
      return (
        <ActivityIndicator style={{flex: 1}} size="large" color="#8BC34A" />
      );
    }

    if (this.props.cleaners.events.length === 0) {
      return (
        <View style={{width: '80%', alignSelf: 'center'}}>
          <Text>We have found no events for you...</Text>
        </View>
      );
    }

    return (
      <View style={{flex: 1}}>
        <Text style={{alignSelf: 'center', fontSize: 30}}>My Events</Text>
        <ScrollView>
          {this.props.cleaners.events.map(event => {
            return (
              <CleaningEventForCleaner
                key={event._id}
                event={event}
                home={this}
                navigation={this.state.navigation}
                cancelCleaner={this.cancelCleaner}
                addToStarredCleaner={this.addToStarredCleaner}
              />
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

History.propTypes = {
  navigation: PropTypes.any,
  route: PropTypes.any,
  addEvent: PropTypes.func,
  cleaners: PropTypes.any,
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
