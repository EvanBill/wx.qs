// components/select-gender/index.js
const api = require('../../utils/request.js');
const user = require('../../utils/user.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    gender: 2 // 默认女性
  },

  /**
   * 组件的方法列表
   */
  methods: {
    selectGender: function (e){
      this.setData({
        gender: e.currentTarget.id
      })
    },
    done: function (){
      wx.showLoading({
        title: '',
      })
      api.fetchRequest("/users/bind/" + this.data.gender, null, "post").then((res) => {
        var info = user.GetUserInfo()
        info.sex = this.data.gender
        user.SaveUserInfo(info)

        this.triggerEvent('login', {
          user: info
        })
       
      }).catch(err => {
     
      }).finally(() => {
        wx.hideLoading();
      })
    }
  }
})
