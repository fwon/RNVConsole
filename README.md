# RNVConsole
vConsole for react native, inspired by vconsole & vconsole-react-native.
Debugger on top of screen. Have a try in expo https://snack.expo.io/SklJHMS3S

## Features
1. console[log, warn, error, info] in Log Panel.
2. Network request list & detail.
3. Customized Version Info you want to show.

## Install
```
npm install rnvconsole
```

## Usage
```javascript
/* INFO is optional */
const INFO = {
  version: '1.0.0',
  test_version: '4',
  message: 'test xxx features'
}
const RNVConsole = require('rnvconsole').showLogWhenDev(INFO)

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

### Network Panel
<div align=center><img width="400" align="center" src="https://raw.githubusercontent.com/fwon/blog/master/assets/rnvconsole2.png"/></div>

### Info Panel
<div align=center><img width="400" align="center" src="https://raw.githubusercontent.com/fwon/blog/master/assets/rnvconsole3.jpeg"/></div>

### Dev Button
<div align=center><img width="400" align="center" src="https://raw.githubusercontent.com/fwon/blog/master/assets/rnvconsole4.jpeg"/></div>
