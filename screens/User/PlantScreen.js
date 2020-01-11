import React from 'react';
import { Image,View,FlatList,StyleSheet } from 'react-native'
import Video from 'react-native-video';
import {
    Icon,
    Text,
    Card,
    Button,
} from '@ui-kitten/components';


class PlantScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            plant: null
        }
    }

    render()
    {
        const { navigation } = this.props;
        let item = navigation.getParam('item')
        console.log(item)
        return (
            <View style={styles.container}>
                <Card style={{margin:5}}>
                <Text>{item.name}</Text>
                <Video source={{uri: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}}   // Can be a URL or a local file.
                       ref={(ref) => {
                           this.player = ref
                       }}                                      // Store reference
                       resizeMode="stretch"
                       controls={true}
                       // onBuffer={this.onBuffer}                // Callback when remote video is buffering
                       // onError={this.videoError}               // Callback when video cannot be loaded
                       style={styles.backgroundVideo}

                />
                </Card>
            </View>)
    }
}

export default PlantScreen


let styles = StyleSheet.create({
    backgroundVideo: {
        // position: 'absolute',
        // top: 0,
        // left: 0,
        // bottom: 0,
        // right: 0,
        width:300,
        height:200
    },
    container: {
        // flex:1,
        justifyContent: "center",
        alignItems: "center",
    }
});
