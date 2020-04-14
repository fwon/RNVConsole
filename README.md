# RNVConsole
vConsole for react native, inspired by vconsole & vconsole-react-native.
Debugger on top of screen. Have a try in expo https://snack.expo.io/SklJHMS3S

## Features
1. console[log, warn, error, info] in Log Panel.
2. exec Command to show message.
3. Network request list & detail.
4. Customized Version Info you want to show.

## Install
```
npm install rnvconsole
```

## Usage
```javascript
// Options
import RN from 'react-native'
import Native from '../native' // your own Module

// Show app information in INFO panel
const INFO = {
  version: '1.0.0',
  test_version: '4',
  message: 'test xxx features'
}
const options = {
  info: INFO,
  // global Object can be called in Command Input
  global: {
    rn: RN
    native: Native
  }
}

const RNVConsole = require('rnvconsole').showLogWhenDev(options)

// in render function
render() {
  return (
    <View>
      {RNVConsole} // add RNVConsole somewhere in JSX
      <View></View>
    </View>
  )
}
```

## Examples

### Log Panel
<div align=center><img width="400" align="center" src="https://raw.githubusercontent.com/fwon/blog/master/assets/rnvconsole1.jpeg"/></div>

### Command
Object defined in global options can be call in command. Such as react-native module or your native function.
<div align=center><img width="400" align="center" src="https://raw.githubusercontent.com/fwon/blog/master/assets/rnvconsole5.jpeg"/></div>

### Network Panel
<div align=center><img width="400" align="center" src="https://raw.githubusercontent.com/fwon/blog/master/assets/rnvconsole2.png"/></div>

### Info Panel
<div align=center><img width="400" align="center" src="https://raw.githubusercontent.com/fwon/blog/master/assets/rnvconsole3.jpeg"/></div>

### Dev Button
<div align=center><img width="400" align="center" src="https://raw.githubusercontent.com/fwon/blog/master/assets/rnvconsole4.jpeg"/></div>
