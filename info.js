import React, { Component } from 'react'
import { View, Text } from 'react-native'

export default class Info extends Component {
  constructor(props) {
    super(props)
    this.state = {
      info: ''
    }
  }

  componentDidMount() {
    let info = this.props.info
    if (typeof info === 'object') {
      try {
        info = JSON.stringify(info, null, 2)
      } catch (err) {
        console.log(err)
      }
    }
    this.setState({
      info
    })
  }

  render() {
    return (
      <View style={{ padding: 5 }}>
        <Text style={{ color: 'black' }}>{this.state.info}</Text>
      </View>
    )
  }
}
