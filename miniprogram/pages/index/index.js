//index.js
const app = getApp()

const LPN_LENGTH = 10

const RECENT_LINES_NUM = 5
const DEFAULT_RECENT_LINES_TEXT = '\n\n\n\n\n'

const db = wx.cloud.database()
const db_lpnrecdata = db.collection('lpnrecdata')

var util = require('../../utils/util.js')

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    scannedLines: [],
    recentScannedText: DEFAULT_RECENT_LINES_TEXT,
    scansCount: 0,
    warningText: '',
    btnScanDisabled: true,
    processDataDisabled: true,
    btnClearDataDisabled: true,
    localFilePath: `${wx.env.USER_DATA_PATH}/lpnrecdata.csv`,
    idSelectedLocation: 0,
    locationList: [
      {id:0, name:'N/A 未选择', dp:'0'},
      {id:1, name:'01号滑槽',dp:'133'},
      {id:2, name:'02号滑槽',dp:'150'},
      {id:3, name:'03号滑槽',dp:'101'},
      {id:4, name:'04号滑槽',dp:'117'},
      {id:5, name:'05号滑槽',dp:'134'},
      {id:6, name:'06号滑槽',dp:'151'},
      {id:7, name:'07号滑槽',dp:'102'},
      {id:8, name:'08号滑槽',dp:'118'},
      {id:9, name:'09号滑槽',dp:'135'},
      {id:10, name:'10号滑槽',dp:'152'},
      {id:11, name:'11号滑槽',dp:'103'},
      {id:12, name:'12号滑槽',dp:'119'},
      {id:13, name:'13号滑槽',dp:'136'},
      {id:14, name:'14号滑槽',dp:'153'},
      {id:15, name:'15号滑槽',dp:'104'},
      {id:16, name:'16号滑槽',dp:'120'},
      {id:17, name:'17号滑槽',dp:'137'},
      {id:18, name:'18号滑槽',dp:'154'},
      {id:19, name:'19号滑槽',dp:'105'},
      {id:20, name:'20号滑槽',dp:'121'},
      {id:21, name:'21号滑槽',dp:'138'},
      {id:22, name:'22号滑槽',dp:'155'},
      {id:23, name:'23号滑槽',dp:'106'},
      {id:24, name:'24号滑槽',dp:'122'},
      {id:25, name:'25号滑槽',dp:'139'},
      {id:26, name:'26号滑槽',dp:'156'},
      {id:27, name:'27号滑槽',dp:'107'},
      {id:28, name:'28号滑槽',dp:'123'},
      {id:29, name:'29号滑槽',dp:'140'},
      {id:30, name:'30号滑槽',dp:'157'},
      {id:31, name:'31号滑槽',dp:'108'},
      {id:32, name:'32号滑槽',dp:'124'},
      {id:33, name:'33号滑槽',dp:'141'},
      {id:34, name:'34号滑槽',dp:'158'},
      {id:35, name:'35号滑槽',dp:'109'},
      {id:36, name:'36号滑槽',dp:'125'},
      {id:37, name:'37号滑槽',dp:'142'},
      {id:38, name:'38号滑槽',dp:'159'},
      {id:39, name:'39号滑槽',dp:'110'},
      {id:40, name:'40号滑槽',dp:'126'},
      {id:41, name:'41号滑槽',dp:'143'},
      {id:42, name:'42号滑槽',dp:'160'},
      {id:43, name:'43号滑槽',dp:'111'},
      {id:44, name:'44号滑槽',dp:'127'},
      {id:45, name:'45号滑槽',dp:'144'},
      {id:46, name:'46号滑槽',dp:'161'},
      {id:47, name:'47号滑槽',dp:'112'},
      {id:48, name:'48号滑槽',dp:'128'},
      {id:49, name:'49号滑槽',dp:'145'},
      {id:50, name:'50号滑槽',dp:'162'},
      {id:51, name:'51号滑槽',dp:'113'},
      {id:52, name:'52号滑槽',dp:'129'},
      {id:53, name:'53号滑槽',dp:'146'},
      {id:54, name:'54号滑槽',dp:'163'},
      {id:55, name:'55号滑槽',dp:'130'},
      {id:56, name:'56号滑槽',dp:'114'},
      {id:57, name:'57号滑槽',dp:'147'},
      {id:58, name:'58号滑槽',dp:'164'},
      {id:59, name:'59号滑槽',dp:'115'},
      {id:60, name:'60号滑槽',dp:'131'},
      {id:61, name:'61号滑槽',dp:'148'},
      {id:62, name:'62号滑槽',dp:'165'},
      {id:63, name:'63号滑槽',dp:'116'},
      {id:64, name:'64号滑槽',dp:'132'},
      {id:65, name:'65号滑槽',dp:'149'},
      {id:66, name:'66号滑槽',dp:'166'},
      {id:67, name:'CM201转盘',dp:'170'},
      {id:68, name:'CM202转盘',dp:'171'},
      {id:69, name:'CM203转盘',dp:'172'},
      {id:70, name:'CM204转盘',dp:'173'},
      {id:71, name:'CM205转盘',dp:'174'}
    ]
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  locationPickerChange: function(e) {
    this.setData({
      idSelectedLocation: e.detail.value
    })
    this.setData({
      btnScanDisabled: e.detail.value == 0
    })
  },
  scanLpn: function(e) {
    var loc = this.data.locationList[this.data.idSelectedLocation]
    var curDate = new Date()
    var dataLine = [util.formatDateShort(curDate), util.formatTimeShort(curDate), loc.id, loc.dp, loc.name]
    var dataLineText = ''
    let lines = this.data.scannedLines
    let curCount = this.data.scansCount
    var that = this

    wx.scanCode({
      onlyFromCamera: true,
      scanType:['barCode'],
      success (ret) {
        if (ret.result.length == LPN_LENGTH) {
          dataLine.push(ret.result)
          if (that.data.processDataDisabled && lines.length > 0) {
            that.setData({processDataDisabled: false})
          }
          dataLineText = dataLine.join(';')
          console.log(dataLineText)
  
          lines.push(dataLineText)
          that.setData({
            warningText: '',
            scannedLines: lines,
            scansCount: curCount + 1,
            recentScannedText: lines.length > RECENT_LINES_NUM ? lines.slice(-RECENT_LINES_NUM).join('\n') : (lines.join('\n') + '\n'.repeat(RECENT_LINES_NUM - lines.length + 1))
          })
  
          db_lpnrecdata.add({
            data: {
              recdate: dataLine[0],
              rectime: dataLine[1],
              locid: dataLine[2],
              locdp: dataLine[3],
              locname: dataLine[4],
              lpn: dataLine[5]
            },
            fail: console.error
          })
        }
        else {
          that.setData({
            warningText: 'Warning: LPN length < 10, please re-scan.\n警告：条码长度应为10位，请重新扫描'
          })
        }
      }
    })
  },
  uploadLpnDataToCloud: function(e) {
    const fsm = wx.getFileSystemManager()
    var that = this
    fsm.writeFile({
      filePath: this.data.localFilePath,
      data: this.data.scannedLines.join('\n'),
      fail: console.error
    })

    wx.cloud.uploadFile({
      cloudPath:'lpnrecdata/lpnrec_'+util.formatDateTimeAsPostfix(new Date())+'.csv',
      filePath:this.data.localFilePath,
      success: res => {
        console.log(res.fileID)
        that.setData({
          btnClearDataDisabled: false
        })
      },
      fail: console.error
    })
  },
  copyLpnDataToClipboard: function(e) {
    wx.setClipboardData({
      data: this.data.scannedLines.join('\n'),
      fail: console.error
    })
  },
  clearLpnData: function(e) {
    this.setData({
      scannedLines: [],
      recentScannedText: DEFAULT_RECENT_LINES_TEXT,
      scansCount: 0,
      processDataDisabled: true,
      btnClearDataDisabled: true,
      success: res => {
        console.log('LpnData is cleared, it is empty now.')
      },
      fail: console.error
    })
  }
})
