
const REQUEST_CACHE = [];
const REQUEST_MODEL = {
    // path: 'http://192.168.0.133:8066', // 测试
  // path: 'https://api.ydtlove.com:4430',  // 预发布
   path: 'https://api.ydtlove.com', // 正式
  // path: 'http://192.168.13.22:8066', // 亚峰
  // path: 'http://192.168.13.26:8066',  // 飞翔
  // path: 'http://192.168.13.21:8066',  // 春哥

  header: {
    webChatToken: wx.getStorageSync('ID_USER_TOKEN').token,
    authorization: wx.getStorageSync('ID_USER_TOKEN').token
  }
}

/**
 * 简单请求封装
 * url: 请求地址
 * data: 请求内容
 * method: 请求方法
 * cache: 缓存时长(单位: 秒)
 */
function FetchRequest(url, data, method = 'GET', cache = 0) {
  var request_key = GetStorageKey(url, method);
  if (cache) {
    return new Promise(Storage);
  } else {
    return new Promise(Request);
  }

  /**
   * 缓存相关
   */
  function Storage(resolve, reject) {
    wx.getStorage({
      key: request_key,
      success: StorageSuccess,
      fail: StorageError
    })

    /**
     * 成功回调
     */
    function StorageSuccess(store) {
      if (CheckCache(store.data)) {
        resolve(store.data);
      } else {
        Request(resolve, reject);
      }
    }

    /**
     * 异常处理
     */
    function StorageError(err) {
      Request(resolve, reject);
    }
  }

  /**
   * 请求接口
   */
  function Request(resolve, reject) {
    if (CheckRequest(request_key)) {
      return;
    }
    SaveRequest(request_key);
    wx.request({
      url: url.indexOf("http:") > -1 ? url : REQUEST_MODEL.path + url,
      method: method.toUpperCase(),
      data: data,
      header: REQUEST_MODEL.header,
      success: FetchSuccess,
      fail: FetchError,
      complete: RequestOver
    })

    /**
     * 成功回调
     */
    function FetchSuccess(res) {
      if (res.data.customCode >= 400 || res.statusCode >= 400) {
        FetchError(res);
        if (res.data.customCode == 403) {
          var user = require('./user.js')

          user.SaveUserInfo("")
          wx.navigateTo({
            url: "/pages/login/login.index/login.index"
          })
        } else if (res.data.customCode == 4001) {
          wx.navigateTo({
            url: "/pages/login/select-gender/inedx"
          })
        }
      } else {
        if (res.data) {
          Object.keys(res.data).forEach(function(key) {
            if (res.data[key] == null) {
              // delete res.data[key]
              // res.data[key] = ""
            }
          })
        }
        SaveCache(res);
        resolve(res);
      }
    }

    /**
     * 异常处理
     */
    function FetchError(err) {
      if (err) {
        var msg = ''
        if (err.data && err.data.message) {
          msg = err.data.message;
        } else if (err.errMsg) {
          msg = err.errMsg;
        } else {
          msg = err.message;
        }
        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }
      reject(err);
    }
  }

  /**
   * 保存缓存信息
   */
  function SaveCache(res) {
    if (cache > 0 && res.statusCode >= 200 && res.statusCode < 300) {
      res.timestamp = Date.parse(new Date()) + cache;
      wx.setStorage({
        key: GetStorageKey(url, method),
        data: res,
      })
    }
  }

  /**
   * 验证缓存是否过期
   */
  function CheckCache(data) {
    return data.timestamp < Date.parse(new Date());
  }

  function RequestOver() {
    RemoveRequest(request_key);
  }
}

/**
 * 验证请求
 */
function CheckRequest(key) {
  console.log(REQUEST_CACHE)
  return REQUEST_CACHE.indexOf(key) >= 0;
}

/**
 * 增加请求锁
 */
function SaveRequest(key) {
  var index = REQUEST_CACHE.indexOf(key);
  if (index <= 0) {
    REQUEST_CACHE.push(key);
  }
}

/**
 * 移除请求锁
 */
function RemoveRequest(key) {
  var index = REQUEST_CACHE.indexOf(key);
  if (index >= 0) {
    REQUEST_CACHE.splice(index, 1);
  }
}

function RemoveAllRequest() {
  console.log('RemoveAllRequest')
  REQUEST_CACHE.length = 0
}

/**
 * 根据请求地址和请求方式构造缓存名字
 */
function GetStorageKey(url, method) {
  return `${method.toUpperCase()}:${url.toUpperCase()}`
}

/**
 * 扩展Promise方法
 * 增加finally方法
 */
Promise.prototype.finally = function(callback) {
  var Promise = this.constructor;
  return this.then(
    function(value) {
      Promise.resolve(callback()).then(
        function() {
          return value;
        }
      );
    },
    function(reason) {
      Promise.resolve(callback()).then(
        function() {
          throw reason;
        }
      );
    }
  );
}
/**
 * 刷新凭证
 */
function ResetHeader(authorize) {
  REQUEST_MODEL.header.webChatToken = authorize;
}

module.exports = {
  fetchRequest: FetchRequest,
  ResetHeader: ResetHeader,
  cacheTime: 1800,
  resetAllRequest: RemoveAllRequest
}