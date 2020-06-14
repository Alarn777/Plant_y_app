import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';

import {StackedAreaChart, YAxis, XAxis} from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import {green100, green300} from 'react-native-paper/src/styles/colors';
import {Text} from '@ui-kitten/components';
const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';

const colors = [plantyColor, green300, green100];
const svgs = [
  {onPress: () => console.log('min')},
  {onPress: () => console.log('avg')},
  {onPress: () => console.log('max')},
];

class StackedAreaGraph extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      formatter: '',
      data: [
        {
          min: 11,
          avg: 28,
          max: 33,
          label: 'Mon',
        },
        {
          min: 10,
          avg: 24,
          max: 31,
          label: 'Tue',
        },
        {
          min: 12,
          avg: 22,
          max: 38,
          label: 'Wed',
        },
        {
          min: 16,
          avg: 24,
          max: 35,
          label: 'Thu',
        },
      ],
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      label_data: ['Mon', 'Tue', 'Wed', 'Thu'],
      keys: ['min', 'avg', 'max'],
      yAxisData: [],
      colors: [plantyColor, green300, green100],
    };
  }

  WeekdayToInt(weekday) {
    if (weekday === 'Mon') return 0;
    if (weekday === 'Tue') return 1;
    if (weekday === 'Wed') return 2;
    if (weekday === 'Thu') return 3;
    if (weekday === 'Fri') return 4;
    if (weekday === 'Sat') return 5;
    if (weekday === 'Sun') return 6;
  }
  componentDidMount(): void {
    let index = 0;
    switch (this.props.mode) {
      case 'uv':
        this.state.data = [];
        this.state.label_data = [];
        this.state.data = Array(Object.keys(this.props.data).length);
        this.state.label_data = Array(Object.keys(this.props.data).length);

        for (let i = 0; i < Object.keys(this.props.data).length; i++) {
          index = this.WeekdayToInt(Object.keys(this.props.data)[i]);
          this.state.data[index] = {
            min: this.props.data[Object.keys(this.props.data)[i]].uvIntensity
              .min,
            avg: this.props.data[Object.keys(this.props.data)[i]].uvIntensity
              .avg,
            max: this.props.data[Object.keys(this.props.data)[i]].uvIntensity
              .max,
            label: Object.keys(this.props.data)[i],
          };
          this.state.label_data[index] = Object.keys(this.props.data)[i];
        }
        break;
      case 'temp':
        this.state.data = [];
        this.state.label_data = [];
        for (let i = 0; i < Object.keys(this.props.data).length; i++) {
          index = this.WeekdayToInt(Object.keys(this.props.data)[i]);

          this.state.data[index] = {
            min: this.props.data[Object.keys(this.props.data)[i]]
              .ambientTemperatureCelsius.min,
            avg: this.props.data[Object.keys(this.props.data)[i]]
              .ambientTemperatureCelsius.avg,
            max: this.props.data[Object.keys(this.props.data)[i]]
              .ambientTemperatureCelsius.max,
            label: Object.keys(this.props.data)[i],
          };
          this.state.label_data[index] = Object.keys(this.props.data)[i];
        }
        break;
      case 'humid':
        this.state.data = [];
        this.state.label_data = [];
        for (let i = 0; i < Object.keys(this.props.data).length; i++) {
          index = this.WeekdayToInt(Object.keys(this.props.data)[i]);

          this.state.data[index] = {
            min: this.props.data[Object.keys(this.props.data)[i]].soilHumidity
              .min,
            avg: this.props.data[Object.keys(this.props.data)[i]].soilHumidity
              .avg,
            max: this.props.data[Object.keys(this.props.data)[i]].soilHumidity
              .max,
            label: Object.keys(this.props.data)[i],
          };
          this.state.label_data[index] = Object.keys(this.props.data)[i];
        }

        break;
    }

    let max = 0,
      min = 9999;
    this.state.data.map(one => {
      if (one.min < min) min = one.min;
      if (one.max > max) max = one.max;
    });

    this.setState({yAxisData: [min, max]});
  }

  render() {
    return (
      <View>
        <View style={{margin: 5, height: 210}}>
          <StackedAreaChart
            data={this.state.data}
            keys={this.state.keys}
            colors={colors}
            curve={shape.curveNatural}
            showGrid={true}
            svgs={svgs}
            style={{flex: 1, marginLeft: 30, height: 210}}
          />
          <YAxis
            style={{position: 'absolute', top: 10, bottom: 10}}
            data={this.state.yAxisData}
            contentInset={{top: 0, bottom: 0}}
            svg={{
              fontSize: 8,
              fill: 'white',
              stroke: 'black',
              strokeWidth: 0.3,
              alignmentBaseline: 'baseline',
              baselineShift: '3',
            }}
            // formatLabel={(value) => value + }
            formatLabel={value => `${value} ${this.state.formatter}`}
          />
          <XAxis
            data={this.state.data}
            svg={{
              fill: 'grey',
              fontSize: 10,
            }}
            style={{marginTop: 10}}
            contentInset={{left: 30, right: 10}}
            xAccessor={({index}) => index}
            formatLabel={(_, index) => this.state.label_data[index]}
            spacing={0.2}
          />
        </View>
        <View style={styles.legend}>
          <Text style={{marginRight: 10}}>
            Min <View style={styles.legendCube} />
          </Text>
          <Text style={{marginRight: 10}}>
            Avg{' '}
            <View
              style={{
                height: 10,
                width: 10,
                backgroundColor: green300,
                margin: 1,
              }}
            />
          </Text>
          <Text style={{marginRight: 10}}>
            Max{' '}
            <View
              style={{
                height: 10,
                width: 10,
                backgroundColor: green100,
                margin: 1,
              }}
            />
          </Text>
        </View>
      </View>
    );
  }
}

export default StackedAreaGraph;

let styles = StyleSheet.create({
  legendCube: {height: 10, width: 10, backgroundColor: plantyColor, margin: 1},
  legend: {
    justifyContent: 'center',
    alignItems: 'stretch',
    flexDirection: 'row',
    alignContent: 'space-between',
  },
});
