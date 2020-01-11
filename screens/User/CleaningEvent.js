import React from 'react'

import { ActivityIndicator, View } from 'react-native'
// import * as Progress from 'react-native-progress'
import { Button, Card, ListItem } from 'react-native-elements'
// import StarRating from 'react-native-star-rating'
import Modal from 'react-native-modal'
import axios from 'axios'
import Consts from '../../ENV_VARS'
import PropTypes from 'prop-types'

export default class CleaningEvent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      event: null,
      isModalVisible: false,
      canRate: false,
      isModalVisibleOK: false,
      starCount: this.props.event.rating,
      progress: 0,
      rating: 0
    }
    this.cancelEvent = this.cancelEvent.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.button = this.button.bind(this)
  }

  onStarRatingPress(rating) {
    this.setState({
      starCount: rating
    })
    this.props.submitRating({id:this.state.event._id,rating:rating})
  }

  addToStarredCleaner() {
    this.props.addToStarredCleaner({
      userEmail: this.state.event.eventUser,
      cleanerEmail: this.state.event.eventCleaner
    })
  }

  componentDidMount(): void {
    this.setState({
      event: this.props.event,
      starCount: this.props.event.feedBack
    })
  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible })
  }

  toggleModalOK = () => {
    this.setState({ isModalVisibleOK: !this.state.isModalVisibleOK })
  }

  async cancelEvent() {
    this.toggleModal()
    try {
      await axios.post(Consts.host + '/deleteEvent', {
        id: this.state.event._id
      })
    } catch (err) {}

    this.props.cancelCleaner(this.state.event)
  }

  closeModal() {
    this.toggleModal()
  }

  eventStatus() {
    if (this.state.event.status === 'Finished' && this.state.event.rating === 0) {
      return false
    }
    return true
  }

  button() {
    if (this.state.event.status !== 'Finished') {
      return (
        <View>
          <Button
            backgroundColor="#03A9F4"
            buttonStyle={{
              borderRadius: 1,
              margin: 5,
              backgroundColor: '#FF5722'
            }}
            onPress={this.toggleModal}
            title="Cancel"
          />
          <Modal style={{ justifyContent: 'center' }} isVisible={this.state.isModalVisible}>
            <Card title={'Remove Request ?'}>
              <Button
                backgroundColor="#03A9F4"
                buttonStyle={{
                  borderRadius: 1,
                  margin: 5,
                  backgroundColor: '#8BC34A'
                }}
                onPress={this.cancelEvent}
                title="Yes"
              />
              <Button
                backgroundColor="#03A9F4"
                buttonStyle={{
                  borderRadius: 1,
                  margin: 5,
                  backgroundColor: 'red'
                }}
                onPress={this.closeModal}
                title="No"
              />
            </Card>
          </Modal>
        </View>
      )

      // this.setState({canRate:true})
    }
    return <View />
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
      let cardWidth = 0

      return (
        <Card
          onLayout={event => {
            const { x, y, width, height } = event.nativeEvent.layout
            cardWidth = width
          }}
          title={'Event ' + this.state.event.date + ' ' + this.state.event.time}
        >
          <ListItem title={'Agent name: ' + this.state.event.eventCleanerName} />
          <ListItem title={'Request status: ' + this.state.event.status} />
          <ListItem title={'Date and time: ' + this.state.event.dayTimeOfEvent} />

          {/*<Progress.Bar*/}
          {/*  progress={progressStyles.value}*/}
          {/*  width={cardWidth * 0.8}*/}
          {/*  style={{ alignSelf: 'center', width: '90%' }}*/}
          {/*  color={progressStyles.color}*/}
          {/*/>*/}

          <ListItem title={'Agent notes: ' + this.state.event.notesByCleaner} />
          <ListItem title={'Rate the Clean'} />
          <View style={{ alignSelf: 'center', width: '50%' }}>
            {/*<StarRating*/}
            {/*  style={{ margin: 10 }}*/}
            {/*  disabled={this.eventStatus()}*/}
            {/*  emptyStar={'ios-star-outline'}*/}
            {/*  fullStar={'ios-star'}*/}
            {/*  halfStar={'ios-star-half'}*/}
            {/*  iconSet={'Ionicons'}*/}
            {/*  starSize={20}*/}
            {/*  maxStars={5}*/}
            {/*  // rating={this.state.starCount}*/}
            {/*  rating={this.props.event.rating}*/}
            {/*  selectedStar={rating => this.onStarRatingPress(rating)}*/}
            {/*  fullStarColor={'gold'}*/}
            {/*/>*/}
          </View>
          {this.button()}
          <Button
            backgroundColor="#03A9F4"
            buttonStyle={{
              borderRadius: 1,
              margin: 5,
              backgroundColor: '#ffc107'
            }}
            onPress={this.toggleModalOK}
            title="Add to starred"
          />
          <Modal style={{ justifyContent: 'center' }} isVisible={this.state.isModalVisibleOK}>
            <Card title={'Added ' + this.state.event.eventCleanerName}>
              <Button
                backgroundColor="#03A9F4"
                buttonStyle={{
                  borderRadius: 1,
                  margin: 5,
                  backgroundColor: '#ffc107'
                }}
                onPress={() => {
                  this.toggleModalOK()
                  this.addToStarredCleaner()
                }}
                title="OK"
              />
            </Card>
          </Modal>
        </Card>
      )
    }
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#8BC34A" />
  }
}

CleaningEvent.propTypes = {
  event: PropTypes.any,
  addToStarredCleaner: PropTypes.func,
  submitRating: PropTypes.func,
  cancelCleaner: PropTypes.func
}
