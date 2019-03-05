const api = require('./request.js')

const STORE_KEY_USER = 'ID_USER_TOKEN'

const util = require('./util.js')

/**
 * 获取用户信息
 */
export function GetUserInfo() {
  return wx.getStorageSync(STORE_KEY_USER)
}

/**
 * 验证用户信息
 */
export function CheckUserInfo(redirect = false) {
  var user = GetUserInfo();
  if (user) {
    return true;
  } else {
    if (redirect) {
      wx.navigateTo({
        url: "/pages/login/login.index/login.index"
      })
    }
    return false;
  }
}


export function CheckUserMobile(redirect = false) {
  if (CheckUserInfo(redirect)) {
    if (GetUserMobile()) {
      return true;
    } else {
      if (redirect) {
        wx.navigateTo({
          url: '/pages/login/login.index/login.index?isBindMobile=true',
        })
        return false;
      }
    }
  } else {
    return false;
  }
}


export function SaveUserInfo(user) {
  try {
    wx.setStorageSync(STORE_KEY_USER, user)
  } catch (err) {
    wx.setStorage({key:STORE_KEY_USER, data:user ,fail:(e)=>{
      console.log(e, err)
    }})
  }
  api.ResetHeader(user.token)
}

export function GetUserMobile() {
  const user = GetUserInfo();
  if (user) {
    if (user.mobile!="")
      return user.mobile;
  }

  return null;
}

export function SaveUserMobile(mobile) {
  const user = GetUserInfo();
  if (user) {
    user.mobile = mobile;
    SaveUserInfo(user);
  }
}

export function GetUserName() {
  const user = GetUserInfo();
  if (user) {
    return user.nickName;
  }
  return null;
}

export function SaveUserName(name) {
  const user = GetUserInfo();
  if (user) {
    user.nickName = name;
    SaveUserInfo(user);
  }
}
/** 
 * 判断生日是否为当天弹出领取优惠券(用户未登录点击授权) 
 */
 function checkBox() {
  api.fetchRequest('/users/info').then(function (res) {
    var str = res.data.birthday
    var date = ""
    try {
      date = str.slice(0, 10);
    } catch (err) {
      date = ""
    }

    if (date == util.formatDate(new Date()) && date != null) {
      if (wx.getStorageSync('isGetCoupon') != 1) {
        api.fetchRequest(`/activities?type=${'3'}`).then(function (res) {
          wx.setStorageSync("isGetCoupon", 1)
          wx.navigateTo({
            url: `/pages/user/get-coupon/index?activityIds=${res.data}`,
          })
        }).catch(function (res) {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        })
      }

    }

  })
}
export function UserLogin(userDetail) {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: '加载中...',
    });
    wx.login({
      success: function (res) {
        var code = res.code;

        var temp = {
          "code": code,
          "encryptedData": userDetail.encryptedData,
          "iv": userDetail.iv
        }

        const userInfo = userDetail.userInfo
        //后台端口请求
        api.fetchRequest('/users/login', temp, "POST").then(function (res) {
          var user = res.data;
          user.avatarUrl = userInfo.avatarUrl;
          user.nickName = user.realName || userInfo.nickName;
          user.isLogin = true;
          user.mobile = user.mobile || '';
          wx.hideLoading();
          SaveUserInfo(user);
          resolve(user);
          checkBox()
        }).catch(err => {
          reject(err);
        }).finally(() => {
          wx.hideLoading();
        })

        //获取用户信息 (废弃)
        // wx.getUserInfo({
        //   success: function (res) {
            
        //   }
        // })
      },
      fail: function (err) {
        wx.hideLoading();

        reject(err);
        wx.showToast({
          title: err.data.message,
          icon: 'none'
        });
      }
    })
  });
}

/**
 * 验证手机号
 */
export function TestingMobile(mobile) {
  let phonetel = /^(1)\d{10}$/;
  if (phonetel.test(mobile)) {
    return true
  } else {
    return false
  }
}