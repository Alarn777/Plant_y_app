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
import {Icon, Text, Card} from '@ui-kitten/components';
import axios from 'axios';
import Consts from '../../ENV_VARS';
import {
  ActivityIndicator,
  Button,
  Card as PaperCard,
  Dialog,
  Divider,
  Paragraph,
  Portal,
} from 'react-native-paper';

//redux
import {connect} from 'react-redux';
import {HeaderBackButton} from 'react-navigation-stack';
import {bindActionCreators} from 'redux';
import {AddAvatarLink} from '../../FriendActions';
import {Storage} from 'aws-amplify';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import WS from '../../websocket';
import {green100, green200} from 'react-native-paper/src/styles/colors';
import {LineChart} from 'react-native-chart-kit';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

const chartConfig = {
  backgroundGradientFrom: plantyColor,
  decimalPlaces: 2, // optional, defaults to 2dp
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const dayData = {
  // labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  labels: [
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
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ],
  datasets: [
    {
      //data: [20, 45, 28, 80, 99, 43, 80, 99, 43, 12],
      data: [
        20,
        45,
        28,
        80,
        99,
        43,
        80,
        99,
        43,
        12,
        20,
        45,
        28,
        80,
        99,
        43,
        80,
        99,
        43,
        12,
        80,
        99,
        43,
        12,
      ],
    },
  ],
};

class History extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      planter: this.props.navigation.getParam('planter'),
      loadBuffering: false,
      loading: false,
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
      pickDay: false,
      buttonText: '',
      pictures: [],
      dayPictures: [],
      modalVisible: false,
      currentPicture: {UUID: '0', url: ''},
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
  }

  async preloadImages(images_array) {
    console.log('Now loading images');
    this.setState({dayPictures: []});
    // console.log(images_array);
    await images_array.map(oneImage => {
      // console.log(oneImage);
      // if (oneImage.image_key.endsWith('/')) return;

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
        .catch(error => console.log(error));
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
        // console.log(response);
        this.dealWithPicsData(response.data.Items);
      })
      .catch(error => {
        console.log('error ' + error);
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

      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        alignSelf: 'center',
      },
    };
  };

  // goBack = () => {
  //   this.props.navigation.navigate('planterImagesGallery', {
  //     picWasRemoved: true,
  //   });
  // };
  getDayFromDB = day => {
    this.setState({selectedDay: day});
    let sorted_array = [];
    this.state.pictures.map(one => {
      let date = new Date(one.timestamp * 1e3)
        .toISOString()
        // .replace(/-/g, '/')
        .replace(/T/g, ' ')
        .replace(/Z/g, '')
        .slice(0, 10);
      if (date === day.dateString) {
        sorted_array.push(one);
      }
    });

    this.preloadImages(sorted_array)
      .then(r => console.log())
      .catch(error => console.log(error));
  };

  renderCalendar = () => {
    if (this.state.pickDay) {
      return (
        <Calendar
          current={this.state.today}
          minDate={this.state.minDay}
          maxDate={this.state.today}
          onDayPress={day => {
            console.log('selected day', day);
            this.setState({pickDay: false, loading: false});
            this.getDayFromDB(day);
          }}
          monthFormat={'MM / yyyy'}
          hideArrows={false}
          hideExtraDays={false}
          disableMonthChange={false}
          // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
          firstDay={1}
          hideDayNames={false}
          showWeekNumbers={false}
          style={{
            borderWidth: 1,
            borderColor: plantyColor,
            marginBottom: 10,
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            // textSectionTitleColor: '#b6c1cd',
            textSectionTitleColor: green200,
            selectedDayBackgroundColor: plantyColor,
            selectedDayTextColor: '#ffffff',
            todayTextColor: plantyColor,
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#00adf5',
            selectedDotColor: '#ffffff',
            arrowColor: plantyColor,
            disabledArrowColor: '#d9e1e8',
            monthTextColor: plantyColor,
            indicatorColor: plantyColor,
            // textDayFontFamily: 'monospace',
            // textMonthFontFamily: 'monospace',
            // textDayHeaderFontFamily: 'monospace',
            // textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            // textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 15,
          }}
        />
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
            this.setState({pickDay: true, loading: true});
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
            console.log('open ', item);

            // this.state.modalVisible = true;
            this.setState({currentPicture: item, modalVisible: true});
            this.forceUpdate();
            // console.log(this.state);
            // this.showPicture(item);
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
                // borderColor: plantyColor,
                // borderWidth: 1,
                // height: this.state.width / 3 - 25,
                width: '99%',
                height: 300,
                margin: 5,
                // padding: 1,
                // borderRadius: 3,
              }}
            />
          </Dialog.Content>
        </Dialog>
      </Portal>
    );
  }

  renderDayPictures = () => {
    if (this.state.dayPictures.length === 0) {
      return <Text>No pictures were taken on this day</Text>;
    } else
      return (
        // <View style={{flexDirection: 'row'}}>
        //   {this.state.dayPictures.map(one => {
        //     console.log(one);
        //     return (
        //       <Image
        //         key={one.UUID}
        //         source={{uri: one.url}}
        //         style={{
        //           height: this.state.width / 3 - 30,
        //           width: this.state.width / 3 - 30,
        //           margin: 5,
        //         }}
        //       />
        //     );
        //   })}
        // </View>

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
    // console.log(day);
    if (this.state.loading) {
      return <ActivityIndicator size="large" color={plantyColor} />;
    }
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          // padding: 8,
        }}>
        <Text
          style={{
            fontWeight: 'bold',
            fontSize: 19,
            alignSelf: 'center',
            marginBottom: 15,
          }}>
          Showing history for {day.dateString}
        </Text>

        <Text style={{fontWeight: 'bold', fontSize: 17}}>Temperature</Text>
        <LineChart
          data={dayData}
          width={Dimensions.get('window').width - 40} // from react-native
          height={220}
          fromZero={true}
          yAxisSuffix="C"
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={chartConfig}
          style={styles.chart}
        />

        <Text style={{fontWeight: 'bold', fontSize: 17}}>UV</Text>
        <LineChart
          data={dayData}
          width={Dimensions.get('window').width - 40} // from react-native
          height={220}
          fromZero={true}
          yAxisSuffix=""
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={chartConfig}
          style={styles.chart}
        />

        <Text style={{fontWeight: 'bold', fontSize: 17}}>Humidity</Text>
        <LineChart
          data={dayData}
          width={Dimensions.get('window').width - 40} // from react-native
          height={220}
          fromZero={true}
          yAxisSuffix="%"
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={chartConfig}
          style={styles.chart}
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

  render() {
    return (
      <ScrollView style={styles.container}>
        <PaperCard>
          <PaperCard.Title
            title={'History of ' + this.state.planter.name}
            subtitle={'Choose a day to see history'}
          />
          <PaperCard.Content style={{marginTop: 10}}>
            {this.renderCalendar()}
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