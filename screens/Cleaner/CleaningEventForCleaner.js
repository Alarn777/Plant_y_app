import React from 'react'

import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Bar } from 'react-native-progress'
import { Button, Card, Text, ListItem, Icon, Input } from 'react-native-elements'
import StarRating from 'react-native-star-rating'
import Modal from 'react-native-modal'
import PropTypes from 'prop-types'

const styles = StyleSheet.create({
  inputIcon: {
    width: 30,
    height: 30
  },
  stars:{
    marginTop: 100
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    borderBottomWidth: 1,
    width: '100%',
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  submitJobButton: {
    borderRadius: 1,
    margin: 5,
    backgroundColor: '#ffc107'
  },
  activityIndicaotr: { flex: 1 },
  modal: { justifyContent: 'center' },
  noteTextInput: { margin: 10 },
  modalOkButton: {
    borderRadius: 1,
    margin: 5,
    backgroundColor: '#ffc107'
  },
  declineJobButton: {
    borderRadius: 1,
    margin: 5,
    backgroundColor: '#FF5722'
  },
  modalYesButton: {
    borderRadius: 1,
    margin: 5,
    backgroundColor: '#8BC34A'
  },
  modalNoButton: {
    borderRadius: 1,
    margin: 5,
    backgroundColor: 'red'
  }
})

export default class CleaningEventForCleaner extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      event: null,
      about: '',
      isModalVisible: false,
      canRate: false,
      isModalVisibleOK: false,
      starCount: this.props.event.rating,
      progress: 0
    }

    // this.cancelEvent = this.cancelEvent.bind(this);
    this.handleDeclineRequestNoPress = this.handleDeclineRequestNoPress.bind(this)
    this.button = this.button.bind(this)
    this.handleSubmitJobPress = this.handleSubmitJobPress.bind(this)
    this.handleDeclineJobPress = this.handleDeclineJobPress.bind(this)
    this.handleDeclineRequestYesPress = this.handleDeclineRequestYesPress.bind(this)
    this.handleEditEventByCleaner = this.handleEditEventByCleaner.bind(this)
    this.handleFinilizeEventByCleaner = this.handleFinilizeEventByCleaner.bind(this)
  }

  onStarRatingPress(rating) {
    this.setState({
      starCount: rating
    })
  }
  addToStarredCleaner() {
    this.props.addToStarredCleaner({
      userEmail: this.state.event.eventUser,
      cleanerEmail: this.state.event.eventCleaner
    })
  }

  componentDidMount() {
    this.setState({
      event: this.props.event,
      starCount: this.props.event.feedBack,
      about: this.props.event.notesByCleaner
    })
  }

  handleDeclineJobPress = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }

  handleSubmitJobPress = () => {
    this.setState({ isModalVisibleOK: !this.state.isModalVisibleOK })
  }

  handleDeclineRequestYesPress() {
    this.handleDeclineJobPress()
    this.props.home.cancelCleaner(this.state.event, true)
  }

  handleEditEventByCleaner() {
    this.handleSubmitJobPress()

    this.props.home.editEventByCleaner(this.state.event, {
      email: '',
      id: this.state.event._id,
      newStatus: 'Approved'
    })
    this.props.home.cancelCleaner(this.state.event, false)
  }

  handleFinilizeEventByCleaner() {
    this.handleSubmitJobPress()
    this.props.home.editEventByCleaner(
      this.state.event,
      { email: '', id: this.state.event._id, newStatus: 'Finished' },
      { email: '', id: this.state.event._id, notes: this.state.about }
    )
    // this.props.home.cancelCleaner(this.state.event,false)
  }

  handleDeclineRequestNoPress() {
    this.handleDeclineJobPress()
  }

  eventStatus() {
    if (this.state.event.status === 'Finished') {
      return false
    }
    return true
  }

  button() {
    if (this.state.event.status === 'Approved') {
      return (
        <View>
          <Button
            backgroundColor="#03A9F4"
            buttonStyle={styles.submitJobButton}
            onPress={this.handleSubmitJobPress}
            title="Submit Job"
          />
          <Modal style={styles.modal} isVisible={this.state.isModalVisibleOK}>
            <Card
              title={
                'Add notes and complete ' + this.state.event.date + ' ' + this.state.event.time
              }
            >
              <Input
                containerStyle={styles.noteTextInput}
                label="Notes"
                placeholder="Add notes..."
                value={this.state.about}
                onChangeText={about => this.setState({ about })}
              />

              <Button
                backgroundColor="#03A9F4"
                buttonStyle={styles.modalOkButton}
                onPress={this.handleFinilizeEventByCleaner}
                title="OK"
              />
            </Card>
          </Modal>
        </View>
      )
    }
    if (this.state.event.status === 'Finished') {
      return (
        <Card title={'Event Rating'}>
          <StarRating
            style={styles.stars}
            disabled
            emptyStar={'ios-star-outline'}
            fullStar={'ios-star'}
            halfStar={'ios-star-half'}
            iconSet={'Ionicons'}
            maxStars={5}
            rating={this.state.event.rating}
            selectedStar={rating => this.onStarRatingPress(rating)}
            fullStarColor={'gold'}
          />
        </Card>
      )
    }
    if (this.state.event.status === 'Requested') {
      return (
        <View>
          <Button
            backgroundColor="#03A9F4"
            buttonStyle={styles.declineJobButton}
            onPress={this.handleDeclineJobPress}
            title="Decline Job"
          />
          <Modal style={styles.modal} isVisible={this.state.isModalVisible}>
            <Card title={'Decline Request ?'}>
              <Button
                backgroundColor="#03A9F4"
                buttonStyle={styles.modalYesButton}
                onPress={this.handleDeclineRequestYesPress}
                title="Yes"
              />
              <Button
                backgroundColor="#03A9F4"
                buttonStyle={styles.modalNoButton}
                onPress={this.handleDeclineRequestNoPress}
                title="No"
              />
            </Card>
          </Modal>
          <Button
            backgroundColor="#03A9F4"
            buttonStyle={styles.modalOkButton}
            onPress={this.handleSubmitJobPress}
            title="Accept Job"
          />
          <Modal style={styles.modal} isVisible={this.state.isModalVisibleOK}>
            <Card title={'Added ' + this.state.event.date + ' ' + this.state.event.time}>
              <ListItem title="You can see it in My Cleans" />
              <Button
                backgroundColor="#03A9F4"
                buttonStyle={styles.modalOkButton}
                onPress={this.handleEditEventByCleaner}
                title="OK"
              />
            </Card>
          </Modal>
        </View>
      )
    }
  }

  render() {
    if (this.state.event) {
      const progressStyles = {
        color: '',
        value: 0
      }

      if (this.state.event.status === 'Requested') {
        progressStyles.color = '#FF5722'
        progressStyles.value = 0.3
      }
      if (this.state.event.status === 'Approved') {
        progressStyles.color = '#ffc107'
        progressStyles.value = 0.6
      }
      if (this.state.event.status === 'Finished') {
        progressStyles.color = '#8BC34A'
        progressStyles.value = 1
      }

      let iconFloor = 'close'
      let colorFloor = 'red'
      let iconWindows = 'close'
      let colorWindows = 'red'
      let iconBathroom = 'close'
      let colorBathroom = 'red'
      if (this.state.event.cleanFloor) {
        iconFloor = 'check'
        colorFloor = '#8BC34A'
      }
      if (this.state.event.cleanWindows) {
        iconWindows = 'check'
        colorWindows = '#8BC34A'
      }
      if (this.state.event.cleanBathroom) {
        iconBathroom = 'check'
        colorBathroom = '#8BC34A'
      }

      return (
        <Card title={'Event ' + this.state.event.date + ' ' + this.state.event.time}>
          <ListItem title={'Agent name: ' + this.state.event.eventCleanerName} />
          <ListItem title={'Request status: ' + this.state.event.status} />
          <ListItem title={'Date and time: ' + this.state.event.dayTimeOfEvent} />
          <Bar
            progress={progressStyles.value}
            width={300}
            style={{ alignSelf: 'center', width: '90%' }}
            color={progressStyles.color}
          />

          <ListItem title={'Agent notes: ' + this.state.event.notesByCleaner} />
          <ListItem title={'Floor: ' + this.state.event.floor} />
          <ListItem title={'Apartment size: ' + this.state.event.sizeOfTheAppt} />
          <Card title="Need to Clean">
            <View style={styles.inputContainer}>
              <Text style={styles.text}>Floor</Text>
              <Icon style={styles.inputIcon} name={iconFloor} size={30} color={colorFloor} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.text}>Windows</Text>
              <Icon style={styles.inputIcon} name={iconWindows} size={30} color={colorWindows} />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.text}>Bathroom</Text>
              <Icon style={styles.inputIcon} name={iconBathroom} size={30} color={colorBathroom} />
            </View>
          </Card>

          {this.button()}
        </Card>
      )
    }
    return <ActivityIndicator style={styles.activityIndicaotr} size="large" color="#8BC34A" />
  }
}
CleaningEventForCleaner.propTypes = {
  event: PropTypes.any,
  home: PropTypes.any,
  addToStarredCleaner: PropTypes.func
}
