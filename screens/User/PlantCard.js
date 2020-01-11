import React from 'react';
import { Image,View,FlatList } from 'react-native'
import {Text} from '@ui-kitten/components';

class PlantCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            index: 0,
            userLoggedIn: true,
            userEmail: "",
            cleaners: [],
            change: false,
            user: null,

        }
        this.dealWithData = this.dealWithData.bind(this)
        this.fetchUser = this.fetchUser.bind(this)
    }

    render()
    {
        return <View><Text>asdasd</Text></View>
    }
}

export default PlantCard
