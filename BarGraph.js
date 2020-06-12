import React from 'react'
import {Grid, BarChart, XAxis, YAxis, AreaChart} from 'react-native-svg-charts';
import { Circle, Path } from 'react-native-svg'
import {green100, green200, green300} from 'react-native-paper/src/styles/colors';
import {Dimensions, View} from 'react-native';
import * as shape from 'd3-shape';
const plantyColor = '#6f9e04';
const errorColor = '#ee3e34'
import { Defs, LinearGradient, Stop } from 'react-native-svg'
import * as scale from 'd3-scale'

const Gradient = ({ index }) => (
    <Defs key={index}>
        <LinearGradient id={'gradient'} x1={'0%'} y1={'0%'} x2={'0%'} y2={'100%'}>
            <Stop offset={'0%'} stopColor={plantyColor} stopOpacity={0.9}/>
            <Stop offset={'100%'} stopColor={green300} stopOpacity={0.3}/>
        </LinearGradient>
    </Defs>
)

const data = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
        {
            data: [20, 45, 28, 80, 99, 43],
        },
    ],
};


class BarGraph extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            formatter: '',
            data1: [
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
            data:[],
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            label_data:data.labels.data,
            keys: ['min', 'avg', 'max'],
            yAxisData: [],
            colors: [plantyColor, green300, green100],
            range:[],
            xAsixData:{
                data:[0,20],
                max:20
            }
        };

    }


    static getDerivedStateFromProps(props, state) {
        if (props.data !== state.data) {
            return {
                data: props.data.datasets[0].data,
                label_data:props.data.labels
            };
        }
        return null;
    }

    componentDidMount(): void {
        let max = 10
        this.state.xAsixData.data[1] = max +1
        this.state.xAsixData.max = max +1

        this.forceUpdate()


        // this.setState({data})

        this.setState({label_data:this.props.data.labels,data:   this.props.data.datasets[0].data,formatter:this.props.formatter})

    }


    render() {


        return (
            <View style={{padding:5}}>
                    <BarChart
                        style={{ marginLeft: 30,height: 210,marginBottom:0,marginRight:10 }}
                        data={this.state.data}
                        gridMin={0}
                        // svg={{ fill: 'url(#gradient)' }}
                        svg={{fill:plantyColor}}
                        yMin={0}
                        yMax={this.state.xAsixData.max}
                    >
                    <Grid/>
                    <Gradient/>
                    </BarChart>
                <YAxis
                    style={ { position: 'absolute', top: 10, bottom: 20,left:10 }}
                    data={this.state.xAsixData.data}
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
                        fill: 'black',
                        fontSize: 14,
                    }}
                    scale={scale.scaleBand}
                    contentInset={ { left: 0, right: 0 } }
                    xAccessor={({ index }) => index}
                    formatLabel={(_, index) => {
                            return this.state.label_data[ index ] }}
                    spacing={0.2}
                    style={{marginTop:5}}
                />
            </View>
        )
    }

}

export default BarGraph
