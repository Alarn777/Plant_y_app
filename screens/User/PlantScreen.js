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
                <Card style={{margin:5,width:'95%'}}
                      header={() => {
                          return <Text style={styles.mainText} >{item.name}</Text>;
                      }}

                      footer={() => {
                          return (
                              <View>
                              <Text style={styles.mainText} >Camera Controller</Text>
                              <Text style={{

                              textAlign:'center',
                              fontSize:16}} > is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</Text>
                              </View>)}}




                >
                    <Text style={styles.mainText} >Live stream</Text>
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
                    <Text style={styles.mainText} >Camera Controller</Text>
                <View style={{ flexDirection: 'column',
                    // flexWrap: 'wrap',
                    justifyContent:"center",
                    padding: 8}}>
                    <Button  icon={(style) => {
                        return <Icon {...style} name='log-out-outline'/>
                    }}>Up</Button>
                    <View style={{
                        // flex:
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent:"space-between",
                        padding: 8}}>
                        <Button>Left</Button>
                        <Button>Right</Button>
                    </View>
                    <Button  style={styles.button} status='primary'>Down</Button>
                </View>


                </Card>
            </View>)
    }
}

export default PlantScreen


let styles = StyleSheet.create({
    backgroundVideo: {
        // position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width:"100%",
        height:200
    },
    container: {
        // flex:1,
        justifyContent: "center",
        alignItems: "center",
    },
    mainText: {
        fontWeight: 'bold',
        textAlign:'center',
        fontSize:16
    },
    button: {
        // borderColor:'#6f9e04',
        backgroundColor: '#6f9e04',
        color:'#6f9e04'
    }
});
