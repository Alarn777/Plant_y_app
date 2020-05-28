import React from 'react'
import {AreaChart, Grid, StackedAreaChart, XAxis, YAxis} from 'react-native-svg-charts';
import { Circle, Path } from 'react-native-svg'
import {green100, green200, green300} from 'react-native-paper/src/styles/colors';
import {Dimensions, View} from 'react-native';
import * as shape from 'd3-shape';
const plantyColor = '#6f9e04';
const errorColor = '#ee3e34'
import { Defs, LinearGradient, Stop } from 'react-native-svg'

const Gradient = ({ index }) => (
    <Defs key={index}>
        <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
            <Stop offset={'0%'} stopColor={plantyColor} stopOpacity={0.9}/>
            <Stop offset={'100%'} stopColor={green300} stopOpacity={0.3}/>
        </LinearGradient>
    </Defs>
)

class AreaGraph extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            formatter: '',
            data: [
                {
                    // month: new Date(2020, 0, 1),
                    min: 11,
                    avg: 28,
                    max: 33,
                    // dates: 400,
                    label: 'Mon'
                },
                {
                    // month: new Date(2020, 1, 1),
                    min: 10,
                    avg: 24,
                    max: 31,
                    // dates: 400,
                    label: 'Tue'
                },
                {
                    // month: new Date(2020, 2, 1),
                    min: 12,
                    avg: 22,
                    max: 38,
                    // dates: 400,
                    label: 'Wed'
                },
                {
                    // month: new Date(2020, 3, 1),
                    min: 16,
                    avg: 24,
                    max: 35,
                    // dates: 400,
                    label: 'Thu'
                },
            ],
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            label_data: ['Mon', 'Tue', 'Wed', 'Thu'],
            keys: ['min', 'avg', 'max'],
            yAxisData: [],
            colors: [plantyColor, green300, green100],
            range:[]
        };
    }

    componentDidMount(): void {

        // console.log(this.props.data.datasets[0].data)

        this.setState({label_data:this.props.data.labels,data:   this.props.data.datasets[0].data,formatter:this.props.formatter})

    }


    render() {


        return (
        <View style={{padding:5}}>
            <AreaChart
                data={this.state.data}
                style={{ marginLeft: 20,height: 210,marginBottom:0 }}
                // contentInset={{ top: 20, bottom: 20 }}
                svg={{ fill: 'url(#gradient)' }}
                yMin={this.props.y[0]}
                yMax={this.props.y[1]}
            >
                <Grid/>
                <Gradient/>
            </AreaChart>
            <YAxis
                style={ { position: 'absolute', top: 0, bottom: 15 }}
                data={this.props.y}
                svg={ {
                    fontSize: 8,
                    fill: 'white',
                    stroke: 'black',
                    strokeWidth: 0.3,
                    alignmentBaseline: 'baseline',
                    baselineShift: '3',
                } }
                formatLabel={(value) =>{
                    return`${value} ${this.state.formatter}`}}

            />
            <XAxis
                data={this.state.data}
                svg={{
                    fill: 'grey',
                    fontSize: 10,
                }}
                contentInset={ { left: 30, right: 10 } }
                xAccessor={({ index }) => index}
                formatLabel={(_, index) => {
                    if( this.state.label_data[ index ] === '')
                        return ''
                    else
                        return this.state.label_data[ index ] + ' H'}}
                spacing={0.2}
                style={{marginTop:5}}
            />
        </View>
        )
    }

}

export default AreaGraph
