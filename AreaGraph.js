import React from 'react';
import {AreaChart, Grid, XAxis, YAxis} from 'react-native-svg-charts';
import {green100, green300} from 'react-native-paper/src/styles/colors';
import {Dimensions, View} from 'react-native';
const plantyColor = '#6f9e04';
const errorColor = '#ee3e34';
import {Defs, LinearGradient, Stop} from 'react-native-svg';

const Gradient = ({index}) => (
  <Defs key={index}>
    <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
      <Stop offset={'0%'} stopColor={plantyColor} stopOpacity={0.9} />
      <Stop offset={'100%'} stopColor={green300} stopOpacity={0.3} />
    </LinearGradient>
  </Defs>
);

class AreaGraph extends React.PureComponent {
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
      range: [],
    };
  }

  componentDidMount(): void {
    this.setState({
      label_data: this.props.data.labels,
      data: this.props.data.datasets[0].data,
      formatter: this.props.formatter,
    });
  }

  render() {
    return (
      <View style={{padding: 5}}>
        <AreaChart
          data={this.state.data}
          style={{marginLeft: 20, height: 210, marginBottom: 0}}
          svg={{fill: 'url(#gradient)'}}
          yMin={this.props.y[0]}
          yMax={this.props.y[1]}>
          <Grid />
          <Gradient />
        </AreaChart>
        <YAxis
          style={{position: 'absolute', top: 10, bottom: 15}}
          data={this.props.y}
          svg={{
            fontSize: 8,
            fill: this.props.color,
            strokeWidth: 0.3,
            alignmentBaseline: 'baseline',
            baselineShift: '3',
          }}
          formatLabel={value => {
            return `${value} ${this.state.formatter}`;
          }}
        />
        <XAxis
          data={this.state.data}
          svg={{
            fill: this.props.color,
            fontSize: 10,
          }}
          contentInset={{left: 30, right: 10}}
          xAccessor={({index}) => index}
          formatLabel={(_, index) => {
            if (this.state.label_data[index] === '') return '';
            else return this.state.label_data[index] + ' H';
          }}
          spacing={0.2}
          style={{marginTop: 5}}
        />
      </View>
    );
  }
}

export default AreaGraph;
