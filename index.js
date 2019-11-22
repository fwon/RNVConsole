/**
 * vconsole for react native 开发测试工具
 */

import React, { PureComponent } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  NativeModules
} from 'react-native'
import event from './src/event'
import Network from './src/network'
import Log from './src/console'
import Info from './src/info'

const PANELS = ['Log', 'Network', 'Info']
const { width, height } = Dimensions.get('window')
let AppInfo = {}

class RNVConsole extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      showPanel: false,
      currentPanelTab: 'Log',
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(1)
    }
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value
        })
        this.state.pan.setValue({ x: 0, y: 0 })
        Animated.spring(this.state.scale, { toValue: 1.3, friction: 3 }).start()
      },
      onPanResponderMove: Animated.event([null, { dx: this.state.pan.x, dy: this.state.pan.y }]),
      onPanResponderRelease: (evt, gestureState) => {
        // 点击
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          this.togglePanel()
        }
        this.state.pan.flattenOffset()
        Animated.spring(this.state.scale, { toValue: 1, friction: 3 }).start()
      }
    })
  }

  togglePanel = () => {
    this.setState(state => ({
      showPanel: !state.showPanel
    }))
  }

  clearLogs = () => {
    const tabName = this.state.currentPanelTab
    event.trigger('clear', tabName)
  }

  showDevPanel = () => {
    NativeModules.DevMenu.show()
  }

  reload = () => {
    NativeModules.DevMenu.reload()
  }

  renderPanelHeader() {
    return (
      <View style={styles.panelHeader}>
        {PANELS.map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => {
              this.setState({
                currentPanelTab: type
              })
            }}
            style={[
              styles.panelHeaderItem,
              type === this.state.currentPanelTab && styles.activeTab
            ]}
          >
            <Text style={styles.panelHeaderItemText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  renderPanelFooter() {
    return (
      <View style={styles.panelBottom}>
        <TouchableOpacity onPress={this.clearLogs} style={styles.panelBottomBtn}>
          <Text style={styles.panelBottomBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.showDevPanel} style={styles.panelBottomBtn}>
          <Text style={styles.panelBottomBtnText}>Dev</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.togglePanel} style={styles.panelBottomBtn}>
          <Text style={styles.panelBottomBtnText}>Hide</Text>
        </TouchableOpacity>
      </View>
    )
  }

  renderEmptyPanel() {
    return (
      <View style={styles.panelEmpty}>
        <Text>敬请期待！</Text>
      </View>
    )
  }

  renderPanel() {
    const panels = {
      Log,
      Network,
      Info: <Info info={AppInfo} />,
      Empty: this.renderEmptyPanel()
    }
    return (
      <View style={styles.panel}>
        {this.renderPanelHeader()}
        <View style={styles.panelContent}>
          {panels[this.state.currentPanelTab || 'Log'] || panels.Empty}
        </View>
        {this.renderPanelFooter()}
      </View>
    )
  }

  renderHomeBtn() {
    const { pan, scale } = this.state
    const [translateX, translateY] = [pan.x, pan.y]
    const btnStyle = { transform: [{ translateX }, { translateY }, { scale }] }

    return (
      <Animated.View {...this.panResponder.panHandlers} style={[styles.homeBtn, btnStyle]}>
        <Text style={styles.homeBtnText}>RNVConsole</Text>
      </Animated.View>
    )
  }

  render() {
    return this.state.showPanel ? this.renderPanel() : this.renderHomeBtn()
  }
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: '#fff'
  },
  panel: {
    position: 'absolute',
    zIndex: 999999999,
    elevation: 999999999,
    backgroundColor: '#fff',
    width,
    height: (height / 3) * 2,
    bottom: 80,
    right: 0,
    flexDirection: 'column'
  },
  panelHeader: {
    width,
    backgroundColor: '#eee',
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9'
  },
  panelHeaderItem: {
    flex: 1,
    height: 40,
    color: '#000',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    justifyContent: 'center'
  },
  panelHeaderItemText: {
    textAlign: 'center'
  },
  panelContent: {
    width,
    flex: 0.9
  },
  panelBottom: {
    width,
    flex: 0.1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee'
  },
  panelBottomBtn: {
    flex: 1,
    height: 40,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#d9d9d9',
    justifyContent: 'center'
  },
  panelBottomBtnText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center'
  },
  panelEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  homeBtn: {
    width: 100,
    height: 40,
    backgroundColor: '#04be02',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 999999999,
    bottom: 140,
    right: 10,
    shadowColor: 'rgb(18,34,74)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    elevation: 0.4
  },
  homeBtnText: {
    color: '#fff'
  }
})

module.exports = {
  Panel: RNVConsole,
  showLogWhenDev(info) {
    AppInfo = info
    return global.__DEV__ ? <RNVConsole /> : null
  }
}
