import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-elements';
// import StarRating from 'react-native-star-rating'
import Modal from 'react-native-modal';
import {bindActionCreators} from 'redux';
import {
  addCleaner,
  addEvent,
  removeCleaner,
  removeEvent,
} from '../../FriendActions';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  button: {
    borderRadius: 1,
    margin: 5,
    backgroundColor: '#FF5722',
  },
  about: {alignSelf: 'center', marginBottom: 10},
  aboutView: {alignSelf: 'center', width: '50%'},
  imageStyle: {
    alignSelf: 'center',
    height: 150,
    width: 200,
    borderRadius: 100 / 2,
  },
  greenButton: {
    borderRadius: 1,
    margin: 5,
    backgroundColor: '#8BC34A',
  },
  activity: {flex: 1},
});

class CleanerCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cleaner: null,
      isModalVisible: false,
      isModalVisibleOK: false,
    };

    this.pickCleaner = this.pickCleaner.bind(this);
    this.renderStarred = this.renderStarred.bind(this);
    this.removeFromStarred = this.removeFromStarred.bind(this);
  }

  componentDidMount() {
    this.setState({cleaner: this.props.cleaner});
  }

  toggleModalOK() {
    this.toggleModal();
    this.pickCleaner();
  }

  toggleModal = () => {
    this.setState({isModalVisible: !this.state.isModalVisible});
  };

  pickCleaner() {
    this.props.chooseCleaner(this.state.cleaner);
  }

  removeFromStarred() {
    this.props.removeFromStarred(this.state.cleaner);
  }

  renderStarred() {
    if (this.props.starred)
      return (
        <View>
          <Button
            backgroundColor="#03A9F4"
            buttonStyle={styles.button}
            onPress={this.removeFromStarred}
            title="Remove from starred"
          />
        </View>
      );
    return <View />;
  }
  render() {
    if (this.state.cleaner) {
      return (
        <Card
          key={this.state.cleaner.name}
          title={this.state.cleaner.name}
          image={{uri: this.state.cleaner.avatar}}
          imageStyle={styles.imageStyle}>
          <Text style={styles.about}>{this.state.cleaner.about}</Text>
          <View style={styles.aboutView}>
            {/*<StarRating*/}
            {/*  style={{ margin: 10 }}*/}
            {/*  disabled*/}
            {/*  emptyStar={'ios-star-outline'}*/}
            {/*  fullStar={'ios-star'}*/}
            {/*  halfStar={'ios-star-half'}*/}
            {/*  iconSet={'Ionicons'}*/}
            {/*  starSize={20}*/}
            {/*  maxStars={5}*/}
            {/*  rating={this.state.cleaner.rating}*/}
            {/*  fullStarColor={'gold'}*/}
            {/*/>*/}
          </View>
          <Button
            backgroundColor="#03A9F4"
            buttonStyle={styles.greenButton}
            onPress={this.toggleModal}
            title="Pick"
          />
          {this.renderStarred()}
          <Modal
            style={{justifyContent: 'center'}}
            isVisible={this.state.isModalVisible}>
            <Card title={'Pick ' + this.state.cleaner.name + '?'}>
              <Text>Cleaning status is shown in `My Cleans` tab</Text>
              <Button
                backgroundColor="#03A9F4"
                buttonStyle={styles.greenButton}
                onPress={() => {
                  this.toggleModalOK();
                }}
                title="Pick"
              />
              <Button
                backgroundColor="#03A9F4"
                buttonStyle={{
                  borderRadius: 1,
                  margin: 5,
                  backgroundColor: 'red',
                }}
                onPress={this.toggleModal}
                title="No"
              />
            </Card>
          </Modal>
        </Card>
      );
    }
    return (
      <ActivityIndicator style={styles.activity} size="large" color="#8BC34A" />
    );
  }
}

CleanerCard.propTypes = {
  cleaner: PropTypes.any,
  removeFromStarred: PropTypes.func,
  chooseCleaner: PropTypes.func,
  starred: PropTypes.any,
};

const mapStateToProps = state => {
  const {friends, cleaners} = state;
  return {friends, cleaners};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      addCleaner,
      removeCleaner,
      addEvent,
      removeEvent,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CleanerCard);
