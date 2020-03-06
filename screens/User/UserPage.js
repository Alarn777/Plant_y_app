/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {createAppContainer} from 'react-navigation';
import {createStackNavigator, HeaderBackButton} from 'react-navigation-stack';
import {Image, Text, TouchableOpacity, View, Dimensions} from 'react-native';
import {Auth} from 'aws-amplify';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit';
import {Avatar, Card as PaperCard, Card} from 'react-native-paper';

const plantyColor = '#6f9e04';

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.navigation.getParam('user'),
      USER_TOKEN: '',
    };
    // this.dealWithData = this.dealWithData.bind(this);
    // this.fetchUser = this.fetchUser.bind(this);
  }
  componentDidMount(): void {
    console.log(this.state.user);
  }

  static navigationOptions = ({navigation, screenProps}) => {
    const params = navigation.state.params || {};
    return {
      // headerShown: navigation.getParam('userLoggedIn'),
      headerTitle: (
        <Image
          resizeMode="contain"
          style={{height: 40, width: 40}}
          source={require('../../assets/logo.png')}
        />
      ),
      headerLeft: (
        <HeaderBackButton
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

  render() {
    return (
      <View>
        <Card>
          <PaperCard.Title
            title={this.state.user.username}
            // subtitle="Card Subtitle"
            left={props => (
              <Avatar.Icon
                {...props}
                style={{backgroundColor: plantyColor}}
                icon="account"
              />
            )}
          />
        </Card>

        {/*<Text>{this.state.user.username}</Text></Card>*/}

        <Card>
          <LineChart
            data={{
              labels: ['January', 'February', 'March', 'April', 'May', 'June'],
              datasets: [
                {
                  data: [
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                  ],
                },
              ],
            }}
            width={Dimensions.get('window').width} // from react-native
            height={210}
            yAxisLabel="$"
            yAxisSuffix="k"
            yAxisInterval={1} // optional, defaults to 1
            chartConfig={{
              // backgroundColor: '#e26a00',
              // backgroundGradientFrom: '#fb8c00',
              // backgroundGradientTo: '#ffa726',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                // stroke: '#ffa726',
              },
            }}
            bezier
            style={{
              margin: 5,
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </Card>
      </View>
    );
  }
}

export default UserPage;
