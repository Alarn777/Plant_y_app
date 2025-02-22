import React from 'react';
import {
  Image,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {Text} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {
  Button,
  Card as PaperCard,
  Dialog,
  Divider,
  Portal,
} from 'react-native-paper';

//redux
import {connect} from 'react-redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink} from '../../FriendActions';
import {Storage} from 'aws-amplify';
import {Calendar} from 'react-native-calendars';
import {green200} from 'react-native-paper/src/styles/colors';
import AreaGraph from '../../AreaGraph';
import {Logger} from '../../Logger';
const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planter: this.props.navigation.getParam('planter'),
      loadBuffering: false,
      loading: true,
      deletingPic: false,
      testingPlantText: 'Health Evaluation',
      testingPlant: false,
      testingPlanticon: 'clipboard-play-outline',
      healthStatus: 0,
      plant_tested: false,
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      today: '2020-01-01',
      selectedDay: '2020-01-01',
      minDay: '',
      pickDay: true,
      buttonText: '',
      pictures: [],
      dayPictures: [],
      modalVisible: false,
      currentPicture: {UUID: '0', url: ''},
      plots: {ambientTemperatureCelsius: {}, uvIntensity: {}, soilHumidity: {}},
      loadingGraphs: false,
      errorText: '',
      error: false,
    };
  }

  componentDidMount(): void {
    let date = new Date(this.state.planter.TimeActivated * 1000);
    let month = date.getMonth();
    if (month < 10) month = '0' + month;
    let convdataTime = date.getFullYear() + '-' + month + '-' + date.getDate();
    let today = new Date().toISOString().slice(0, 10);
    this.setState({today: today, selectedDay: today, minDay: convdataTime});

    this.listPicturesData()
      .then()
      .catch();
    this.props.navigation.setParams({
      headerColor:
        this.props.plantyData.theme === 'light' ? 'white' : '#263238',
    });
  }

  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS,
  ): void {
    let condition =
      this.props.navigation.getParam('headerColor') === 'white'
        ? 'light'
        : 'dark';

    if (this.props.plantyData.theme !== condition)
      this.props.navigation.setParams({
        headerColor:
          this.props.plantyData.theme === 'light' ? 'white' : '#263238',
      });
  }

  async preloadImages(images_array) {
    this.setState({dayPictures: []});
    await images_array.map(oneImage => {
      Storage.get(oneImage.image_key, {
        level: 'public',
        type: 'image/jpg',
      })
        .then(data => {
          let date = new Date(oneImage.timestamp * 1e3)
            .toISOString()
            .replace(/-/g, '/')
            .replace(/T/g, ' ')
            .replace(/Z/g, '')
            .slice(0, 19);

          let obj = {
            UUID: oneImage.UUID,
            url: data,
            timestamp: date,
            timestamp_seconds: oneImage.timestamp,
            UV: oneImage.UV,
            temperature: oneImage.temperature,
            humidity: oneImage.humidity,
            key: oneImage.image_key,
          };

          this.setState(prevState => ({
            dayPictures: [...prevState.dayPictures, obj],
          }));
        })
        .catch(e => {
          Logger.saveLogs(
            this.props.plantyData.myCognitoUser.username,
            e.toString(),
            'preloadImages - history',
          );
          console.log(e);
        });
    });
  }

  async listPicturesData() {
    this.setState({pictures: []});
    //dynamoDB
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/getPlanterPictures',
        {
          username: this.props.plantyData.myCognitoUser.username,
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        this.dealWithPicsData(response.data.Items);
      })
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'listPicturesData',
        );
        console.log(e);
      });
  }

  dealWithPicsData = pic_array => {
    let sorted_array = [];
    pic_array.map(one => {
      let planterName = one.image_key.split('/')[1];
      if (planterName === this.state.planter.name) {
        sorted_array.push(one);
      }
    });

    this.setState({pictures: sorted_array});
  };

  static navigationOptions = ({navigation, screenProps}) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: (
        <Image
          resizeMode="contain"
          style={{height: 40, width: 40}}
          source={require('../../assets/logo.png')}
        />
      ),
      headerLeft: (
        <HeaderBackButton
          title="My Garden"
          onPress={() => {
            navigation.goBack();
          }}
        />
      ),
      headerStyle: {
        backgroundColor: params.headerColor,
      },
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
      },
    };
  };

  getDayFromDB = day => {
    this.setState({loadingGraphs: true});
    this.setState({selectedDay: day});
    let sorted_array = [];
    this.state.pictures.map(one => {
      let date = new Date(one.timestamp * 1e3)
        .toISOString()
        .replace(/T/g, ' ')
        .replace(/Z/g, '')
        .slice(0, 10);
      if (date === day.dateString) {
        sorted_array.push(one);
      }
    });

    this.preloadImages(sorted_array)
      .then(r => console.log())
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'getDayFromDB - preloadImages',
        );
        console.log(e);
      });

    this.loadHistory(day)
      .then(r => console.log())
      .catch(e => {
        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          e.toString(),
          'getDayFromDB - loadHistory',
        );
        console.log(e);
      });
  };

  async loadHistory(date) {
    let Data = {
      labels: [
        '0',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '24',
      ],
      datasets: [
        {
          data: [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ],
        },
      ],
    };

    //dynamoDB
    let USER_TOKEN = this.props.plantyData.myCognitoUser.signInUserSession
      .idToken.jwtToken;
    const AuthStr = 'Bearer '.concat(USER_TOKEN);
    await axios
      .post(
        Consts.apigatewayRoute + '/getDayHistory',
        {
          day: date.day.toString(),
          year: date.year.toString(),
          month: date.month.toString(),
          UUID: '',
        },
        {
          headers: {Authorization: AuthStr},
        },
      )
      .then(response => {
        if (response.data.errorMessage) {
          this.state.plots.soilHumidity = Data;
          this.state.plots.uvIntensity = Data;
          this.state.plots.ambientTemperatureCelsius = Data;

          this.state.errorText = 'No data for selected date';
          this.state.error = true;

          this.setState({loadingGraphs: false});
        } else {
          this.state.error = false;
          this.setState({plots: response.data});
          this.setState({loadingGraphs: false});
        }
      })
      .catch(error => {
        this.state.error = true;
        this.state.errorText = 'Issue with getting data';
        this.state.plots.soilHumidity = Data;
        this.state.plots.uvIntensity = Data;
        this.state.plots.ambientTemperatureCelsius = Data;

        this.setState({loadingGraphs: false});
        console.log('error ' + error);

        Logger.saveLogs(
          this.props.plantyData.myCognitoUser.username,
          error.toString(),
          'loadHistory',
        );
      });
  }

  renderCalendar = () => {
    if (this.state.pickDay) {
      return (
        <View style={{height: this.state.height - 210}}>
          <Text style={{alignSelf: 'center', margin: 10, fontSize: 20}}>
            Please select a date:
          </Text>
          <Calendar
            current={this.state.today}
            minDate={this.state.minDay}
            maxDate={this.state.today}
            onDayPress={day => {
              this.setState({pickDay: false, loading: false});
              this.getDayFromDB(day);
            }}
            monthFormat={'MM / yyyy'}
            hideArrows={false}
            hideExtraDays={false}
            disableMonthChange={false}
            firstDay={1}
            hideDayNames={false}
            showWeekNumbers={false}
            style={{
              borderWidth: 1,
              borderColor: plantyColor,
              marginBottom: 10,
            }}
            theme={{
              backgroundColor:
                this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
              calendarBackground:
                this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
              textSectionTitleColor: green200,
              selectedDayBackgroundColor: plantyColor,
              selectedDayTextColor: '#ffffff',
              todayTextColor: plantyColor,
              dayTextColor:
                this.props.plantyData.theme === 'light' ? '#2d4150' : 'white',
              textDisabledColor:
                this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: plantyColor,
              disabledArrowColor: '#d9e1e8',
              monthTextColor: plantyColor,
              indicatorColor: plantyColor,
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 15,
            }}
          />
        </View>
      );
    } else
      return (
        <Button
          icon="calendar"
          style={{margin: 10}}
          loading={this.state.deletingPic}
          mode="outlined"
          backgroundColor="#6f9e04"
          color="#6f9e04"
          onPress={() => {
            this.setState({pickDay: true, loading: true, error: false});
          }}>
          Choose a day
        </Button>
      );
  };

  _keyExtractor = item => item.UUID;

  _renderItem = ({item}) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.navigate('Picture', {
              picture: item,
              planterName: this.state.planter.name,
            });
          }}>
          <Image
            key={item.UUID}
            source={{uri: item.url}}
            style={{
              borderColor: plantyColor,
              borderWidth: 1,
              height: this.state.width / 3 - 25,
              width: this.state.width / 3 - 25,
              margin: 5,
              padding: 1,
              borderRadius: 3,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  showPicture() {
    return (
      <Portal>
        <Dialog
          visible={this.state.modalVisible}
          onDismiss={() => this.setState({modalVisible: false})}>
          <Dialog.Content>
            <Image
              key={this.state.currentPicture.UUID}
              source={{uri: this.state.currentPicture.url}}
              style={{
                width: '99%',
                height: 300,
                margin: 5,
              }}
            />
          </Dialog.Content>
        </Dialog>
      </Portal>
    );
  }

  renderDayPictures = () => {
    if (this.state.dayPictures.length === 0) {
      return (
        <View>
          <Text style={{alignSelf: 'center'}}>
            No pictures were taken on this day
          </Text>
          <Image
            style={{alignSelf: 'center', height: 100, width: 90}}
            source={require('../../assets/sad_plant.png')}
          />
        </View>
      );
    } else
      return (
        <View>
          <FlatList
            numColumns={3}
            data={this.state.dayPictures}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />
        </View>
      );
  };

  renderDayHistory = day => {
    if (this.state.loading) {
      return <View />;
    }
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        <Divider />
        <Text
          style={{
            borderColor: plantyColor,
            borderWidth: 1,
            borderRadius: 3,
            fontWeight: 'bold',
            fontSize: 19,
            alignSelf: 'center',
            marginBottom: 15,
            marginTop: 15,
            padding: 10,
          }}>
          Showing history for: {day.dateString.replace(/-/g, '/')}
        </Text>
        <Divider />
        <Text style={{fontWeight: 'bold', fontSize: 17, marginTop: 15}}>
          Temperature
        </Text>
        <AreaGraph
          formatter={''}
          color={this.props.plantyData.theme === 'light' ? 'black' : 'white'}
          data={this.state.plots.ambientTemperatureCelsius}
          y={[-10, 60]}
        />
        <Divider />
        <Text style={{fontWeight: 'bold', fontSize: 17, marginTop: 15}}>
          UV
        </Text>

        <AreaGraph
          formatter={''}
          color={this.props.plantyData.theme === 'light' ? 'black' : 'white'}
          data={this.state.plots.uvIntensity}
          y={[0, 1000]}
        />

        <Divider />
        <Text style={{fontWeight: 'bold', fontSize: 17, marginTop: 15}}>
          Humidity
        </Text>
        <AreaGraph
          formatter={''}
          color={this.props.plantyData.theme === 'light' ? 'black' : 'white'}
          data={this.state.plots.soilHumidity}
          y={[0, 1]}
        />

        <Divider />
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 19,
            alignSelf: 'center',
            marginBottom: 15,
            marginTop: 10,
          }}>
          Pictures from that day
        </Text>
        {this.renderDayPictures()}
      </View>
    );
  };

  renderError = () => {
    if (this.state.error) {
      return (
        <Text
          style={{
            alignSelf: 'center',
            margin: 10,
            color: errorColor,
            fontSize: 20,
          }}>
          {this.state.errorText}
        </Text>
      );
    } else return <View />;
  };

  render() {
    if (this.state.loadingGraphs) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor:
              this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
          }}>
          <PaperCard style={{height: this.state.height}}>
            <Image
              style={{height: 300, width: 300, alignSelf: 'center'}}
              source={require('../../assets/plant-1.gif')}
            />
            <Text
              style={{
                fontSize: 20,
                alignSelf: 'center',
                margin: 10,
                color: plantyColor,
              }}>
              Loading...
            </Text>
          </PaperCard>
        </View>
      );
    }

    return (
      <ScrollView
        style={{
          flex: 1,
          backgroundColor:
            this.props.plantyData.theme === 'light' ? 'white' : '#27323a',
        }}>
        <PaperCard style={{margin: 3}}>
          <PaperCard.Title
            title={'History for the planter ' + this.state.planter.name}
            subtitle={'Choose a day to see history'}
          />
          <PaperCard.Content style={{marginTop: 10}}>
            {this.renderCalendar()}
            {this.renderError()}
            {this.renderDayHistory(this.state.selectedDay)}
            {this.showPicture()}
          </PaperCard.Content>
        </PaperCard>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => {
  const {plantyData} = state;

  return {plantyData};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      AddAvatarLink,
    },
    dispatch,
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(History);

let styles = StyleSheet.create({
  sickHealthy: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  backgroundVideo: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: 200,
  },
  container: {
    flex: 1,
    margin: '1%',
  },
  mainText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    backgroundColor: plantyColor,
    color: plantyColor,
    borderColor: plantyColor,
  },
  headerImage: {
    flex: 1,
    height: 100,
  },
  linearGradient: {},
  buttonText: {
    fontSize: 100,
    fontFamily: 'Gill Sans',
    textAlign: 'center',
    margin: 10,
    position: 'relative',
    color: 'black',
    backgroundColor: 'transparent',
  },
  metadata: {
    borderColor: plantyColor,
    borderWidth: 1,
    marginTop: 5,
    padding: 5,
    borderRadius: 3,
  },
  metadataText: {
    fontSize: 16,
    color: plantyColor,
  },
  calendar: {
    backgroundColor: green200,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
});
