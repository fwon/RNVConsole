import React, { Component } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import event from './event'
import { debounce } from './tool'

let ajaxStack = null

// ajx 请求类
class AjaxStack {
  constructor() {
    this.requestIds = []
    this.requests = {}
    this.maxLength = 100
    this.listeners = []
    this.notify = debounce(500, false, this.notify)
  }

  getRequestIds() {
    return this.requestIds
  }

  getRequests() {
    return this.requests
  }

  getRequest(id) {
    return this.requests[id] || {}
  }

  updateRequest(id, data) {
    // update item
    const item = this.requests[id] || {}

    if (this.requestIds.length > this.maxLength) {
      const _id = this.requestIds[0]
      this.requestIds = this.requestIds.slice(1)
      this.requests[id] && delete this.requests[_id]
    }
    for (const key in data) {
      item[key] = data[key]
    }
    // update dom
    const domData = {
      id,
      url: item.url,
      status: item.status,
      method: item.method || '-',
      costTime: item.costTime > 0 ? `${item.costTime}ms` : '-',
      requestHeader: item.requestHeader || null,
      responseHeader: item.responseHeader || null,
      getData: item.getData || null,
      postData: item.postData || null,
      response: null,
      actived: !!item.actived
    }
    switch (item.responseType) {
      case '':
      case 'text':
        // try to parse JSON
        if (typeof item.response === 'string') {
          try {
            domData.response = JSON.parse(item.response)
            domData.response = JSON.stringify(domData.response, null, 1)
          } catch (e) {
            // not a JSON string
            domData.response = item.response
          }
        } else if (typeof item.response !== 'undefined') {
          domData.response = Object.prototype.toString.call(item.response)
        }
        break
      case 'json':
        if (typeof item.response !== 'undefined') {
          domData.response = JSON.stringify(item.response, null, 1)
        }
        break
      case 'blob':
      case 'document':
      case 'arraybuffer':
      default:
        if (typeof item.response !== 'undefined') {
          domData.response = Object.prototype.toString.call(item.response)
        }
        break
    }
    if (item.readyState === 0 || item.readyState === 1) {
      domData.status = 'Pending'
    } else if (item.readyState === 2 || item.readyState === 3) {
      domData.status = 'Loading'
    } else if (item.readyState === 4) {
      // do nothing
    } else {
      domData.status = 'Unknown'
    }
    if (this.requestIds.indexOf(id) === -1) {
      this.requestIds.push(id)
    }
    this.requests[id] = domData
    this.notify()
  }

  clearRequests() {
    this.requestIds = []
    this.requests = {}
    this.notify()
  }

  notify() {
    this.listeners.forEach(callback => {
      callback()
    })
  }

  attach(callback) {
    this.listeners.push(callback)
  }
}

class Network extends Component {
  constructor(props) {
    super(props)
    this.name = 'Network'
    this.mountState = false
    this.state = {
      showingId: null,
      requestIds: [],
      requests: {}
    }
    ajaxStack.attach(() => {
      if (this.mountState) {
        this.setState({
          requestIds: ajaxStack.getRequestIds(),
          requests: ajaxStack.getRequests()
        })
      }
    })
  }

  componentDidMount() {
    this.mountState = true
    this.setState({
      requestIds: ajaxStack.getRequestIds(),
      requests: ajaxStack.getRequests()
    })
    event.on('clear', this.clearRequests.bind(this))
  }

  componentWillUnmount() {
    this.mountState = false
    event.off('clear', this.clearRequests.bind(this))
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.requestIds.length !== this.state.requestIds.length ||
      nextState.showingId ||
      this.state.showingId
    )
  }

  clearRequests(name) {
    if (name === this.name) {
      ajaxStack.clearRequests()
    }
  }

  renderHeader() {
    const count = Object.keys(this.state.requests).length || 0
    return (
      <View style={[styles.nwHeader]}>
        <Text style={[styles.nwHeaderTitle, styles.flex3, styles.bold]}>Name ({count})</Text>
        <Text style={[styles.nwHeaderTitle, styles.flex1, styles.bold]}>Method</Text>
        <Text style={[styles.nwHeaderTitle, styles.flex1, styles.bold]}>Status</Text>
        <Text style={[styles.nwHeaderTitle, styles.flex1, styles.bold]}>Time</Text>
      </View>
    )
  }

  renderReqItem({ item }) {
    const _item = this.state.requests[item] || {}
    return (
      <View style={styles.nwItem}>
        <TouchableOpacity
          onPress={() => {
            this.setState(state => ({
              showingId: state.showingId === _item.id ? null : _item.id
            }))
          }}
        >
          <View
            style={[
              styles.nwHeader,
              this.state.showingId === _item.id && styles.active,
              _item.status >= 400 && styles.error
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              style={[styles.nwHeaderTitle, styles.flex3]}
            >
              {_item.url}
            </Text>
            <Text style={[styles.nwHeaderTitle, styles.flex1]}>{_item.method}</Text>
            <Text numberOfLines={1} style={[styles.nwHeaderTitle, styles.flex1]}>
              {_item.status}
            </Text>
            <Text style={[styles.nwHeaderTitle, styles.flex1]}>{_item.costTime}</Text>
          </View>
        </TouchableOpacity>
        {this.state.showingId === _item.id && (
          <View style={styles.nwItemDetail}>
            <View>
              <Text style={[styles.nwItemDetailHeader, styles.bold]}>General</Text>
              <View style={styles.nwDetailItem}>
                <Text selectable style={styles.headers}>
                  {_item.url}
                </Text>
              </View>
            </View>
            {_item.requestHeader && (
              <View>
                <Text style={[styles.nwItemDetailHeader, styles.bold]}>Request Header</Text>
                {Object.keys(_item.requestHeader).map(key => (
                  <View style={[styles.nwDetailItem, styles.headers]} key={key}>
                    <Text style={styles.headerLeft}>{key}:</Text>
                    <Text selectable style={styles.headerRight}>
                      {_item.requestHeader[key]}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {_item.getData && (
              <View>
                <Text style={[styles.nwItemDetailHeader, styles.bold]}>
                  Query String Parameters
                </Text>
                {Object.keys(_item.getData).map(key => (
                  <View style={[styles.nwDetailItem, styles.headers]} key={key}>
                    <Text style={styles.headerLeft}>{key}:</Text>
                    <Text selectable style={styles.headerRight}>
                      {_item.getData[key]}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            {_item.postData && (
              <View>
                <Text style={[styles.nwItemDetailHeader, styles.bold]}>Form Data</Text>
                {Object.keys(_item.postData).map(key => (
                  <View style={styles.nwDetailItem} key={key}>
                    <Text>{key}:</Text>
                    <Text selectable>{_item.postData[key]}</Text>
                  </View>
                ))}
              </View>
            )}
            {_item.responseHeader && (
              <View>
                <Text style={[styles.nwItemDetailHeader, styles.bold]}>Response Header</Text>
                {Object.keys(_item.responseHeader).map(key => (
                  <View style={[styles.nwDetailItem, styles.headers]} key={key}>
                    <Text style={styles.headerLeft}>{key}:</Text>
                    <Text selectable style={styles.headerRight}>
                      {_item.responseHeader[key]}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <View>
              <Text style={[styles.nwItemDetailHeader, styles.bold]}>Response</Text>
              <View style={styles.nwDetailItem}>
                <Text selectable>{_item.response || ''}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    )
  }

  render() {
    return (
      <FlatList
        showsVerticalScrollIndicator
        ListHeaderComponent={this.renderHeader.bind(this)}
        extraData={this.state}
        data={this.state.requestIds}
        stickyHeaderIndices={[0]}
        renderItem={this.renderReqItem.bind(this)}
        ListEmptyComponent={() => <Text> Loading...</Text>}
        keyExtractor={item => item}
      />
    )
  }
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700'
  },
  active: {
    backgroundColor: '#fffacd'
  },
  flex3: {
    flex: 3
  },
  flex1: {
    flex: 1
  },
  error: {
    backgroundColor: '#ffe4e1',
    borderColor: '#ffb930'
  },
  nwHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff'
  },
  nwHeaderTitle: {
    borderColor: '#eee',
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    paddingHorizontal: 2
  },
  nwItem: {},
  nwItemDetail: {
    borderColor: '#eee',
    borderLeftWidth: StyleSheet.hairlineWidth,
    marginLeft: 15
  },
  nwItemDetailHeader: {
    paddingLeft: 5,
    paddingVertical: 4,
    backgroundColor: '#eee'
  },
  nwDetailItem: {
    paddingLeft: 5
  },
  headers: {
    flexDirection: 'row',
    paddingVertical: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc'
  },
  headerLeft: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc'
  },
  headerRight: {
    flex: 2,
    paddingLeft: 10,
    color: '#aaa'
  }
})

function unixId() {
  return Math.round(Math.random() * 1000000).toString(16)
}

function proxyAjax(XHR, stack) {
  if (!XHR) {
    return
  }
  const _open = XHR.prototype.open
  const _send = XHR.prototype.send
  this._open = _open
  this._send = _send

  // mock open()
  XHR.prototype.open = function(...args) {
    const XMLReq = this
    const method = args[0]
    const url = args[1]
    const id = unixId()
    let timer = null

    // may be used by other functions
    XMLReq._requestID = id
    XMLReq._method = method
    XMLReq._url = url

    // mock onreadystatechange
    const _onreadystatechange = XMLReq.onreadystatechange || function() {}
    const onreadystatechange = function() {
      const item = stack.getRequest(id)
      // update status
      item.readyState = XMLReq.readyState
      item.status = 0
      if (XMLReq.readyState > 1) {
        item.status = XMLReq.status
      }
      item.responseType = XMLReq.responseType

      if (XMLReq.readyState === 0) {
        // UNSENT
        if (!item.startTime) {
          item.startTime = +new Date()
        }
      } else if (XMLReq.readyState === 1) {
        // OPENED
        if (!item.startTime) {
          item.startTime = +new Date()
        }
      } else if (XMLReq.readyState === 2) {
        // HEADERS_RECEIVED
        item.responseHeader = {}
        const arr = headers.trim().split(/[\r\n]+/)

        // Create a map of header names to values
        arr.forEach(line => {
          const parts = line.split(': ')
          const header = parts.shift()
          const value = parts.join(': ')
          item.responseHeader[header] = value
        })
      } else if (XMLReq.readyState === 3) {
        // LOADING
      } else if (XMLReq.readyState === 4) {
        // DONE
        clearInterval(timer)
        item.endTime = +new Date()
        item.costTime = item.endTime - (item.startTime || item.endTime)
        item.response = XMLReq.response
      } else {
        clearInterval(timer)
      }

      if (!XMLReq._noVConsole) {
        stack.updateRequest(id, item)
      }
      return _onreadystatechange.apply(XMLReq, args)
    }
    XMLReq.onreadystatechange = onreadystatechange

    // some 3rd libraries will change XHR's default function
    // so we use a timer to avoid lost tracking of readyState
    let preState = -1
    timer = setInterval(() => {
      if (preState !== XMLReq.readyState) {
        preState = XMLReq.readyState
        onreadystatechange.call(XMLReq)
      }
    }, 10)

    return _open.apply(XMLReq, args)
  }

  // mock send()
  XHR.prototype.send = function(...args) {
    const XMLReq = this
    const data = args[0]

    const item = stack.getRequest(XMLReq._requestID)
    item.method = XMLReq._method.toUpperCase()
    let query = XMLReq._url.split('?') // a.php?b=c&d=?e => ['a.php', 'b=c&d=', '?e']
    item.url = query.shift() // => ['b=c&d=', '?e']

    if (query.length > 0) {
      item.getData = {}
      query = query.join('?') // => 'b=c&d=?e'
      query = query.split('&') // => ['b=c', 'd=?e']
      for (let q of query) {
        q = q.split('=')
        item.getData[q[0]] = decodeURIComponent(q[1])
      }
    }

    if (XMLReq._headers) {
      item.requestHeader = XMLReq._headers
    }

    if (item.method === 'POST') {
      // save POST data
      if (typeof data === 'string') {
        const arr = data.split('&')
        item.postData = {}
        for (let q of arr) {
          q = q.split('=')
          item.postData[q[0]] = q[1]
        }
      } else {
        item.postData = data
      }
    }

    if (!XMLReq._noVConsole) {
      stack.updateRequest(XMLReq._requestID, item)
    }

    return _send.apply(XMLReq, args)
  }
}

module.exports = (function() {
  if (!ajaxStack) {
    ajaxStack = new AjaxStack()
  }
  proxyAjax(global.originalXMLHttpRequest || global.XMLHttpRequest, ajaxStack)
  return <Network />
})()
