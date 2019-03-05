// components/area-picker/index.js
const api = require('../../utils/request.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 已选中的地区id
    selectIDValue: {
      type: Array
    },
    selectStore: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    regions: [],
    indexs: [0, 0, 0],
  },
  areaIDJson: [],
  areaJson: [],

  ready: function() {
    this._requestData()
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _requestData() {
      wx.showLoading({
        mask: true,
      })
      const _this = this
      api.fetchRequest('/basicData/areaInfo', null, "GET", api.cacheTime).then(function(res) {

        var areaJson = JSON.parse(res.data.areaJson)
        var areaIDJson = JSON.parse(res.data.areaIDJson)

        var provinceID = _this.data.selectIDValue[0]
        if (!provinceID || parseInt(provinceID) < 1) {
          provinceID = "01"
        }
        var cityID = _this.data.selectIDValue[1]
        if (!cityID || parseInt(cityID) < 1) {
          cityID = "01"
        }
        var regionID = ""
        if (!_this.properties.selectStore) {
          regionID = _this.data.selectIDValue[2]
          if (!regionID || parseInt(regionID) < 1) {
            regionID = "01"
          }
        } else {
          regionID = "01"
        }


        var provinceIndex = parseInt(provinceID.substr(provinceID.length - 2, 2)) - 1
        var cityIndex = parseInt(cityID.substr(cityID.length - 2, 2)) - 1
        var regionIndex = parseInt(regionID.substr(regionID.length - 2, 2)) - 1


        if (_this.properties.selectStore) {

          if (provinceIndex == 9 ||
            provinceIndex == 1 ||
            provinceIndex == 2 ||
            provinceIndex == 21) {
            _this.setData({
              [`regions[0]`]: areaJson,
              [`regions[1]`]: [],
              [`indexs[0]`]: provinceIndex,
              [`indexs[1]`]: 0,
            });
          } else {
            _this.setData({
              [`regions[0]`]: areaJson,
              [`regions[1]`]: areaJson[provinceIndex].sub,
              [`indexs[0]`]: provinceIndex,
              [`indexs[1]`]: cityIndex,
            });
          }
        } else {
          _this.setData({
            [`regions[0]`]: areaJson,
            [`regions[1]`]: areaJson[provinceIndex].sub,
            [`regions[2]`]: areaJson[provinceIndex].sub[cityIndex].sub,
            [`indexs[0]`]: provinceIndex,
            [`indexs[1]`]: cityIndex,
            [`indexs[2]`]: regionIndex,
          });
        }


        _this.areaJson = areaJson
        _this.areaIDJson = areaIDJson

        console.log(_this.data)
        // _this._requestCityData()
      }).catch(function(err) {
        wx.showModal({
          title: '提示',
          content: err.data.message,
        })
      }).finally(() => {
        wx.hideLoading()
      })
    },


    _changeSelect(e) {
      var column = e.detail.column
      var value = e.detail.value
      switch (column) {
        case 0:
          if (this.properties.selectStore) {

            if (value == 1 ||
              value == 2 ||
              value == 9 ||
              value == 21) {
              this.setData({
                [`indexs[0]`]: value,
                [`regions[1]`]: [],
                [`indexs[1]`]: 0,
              })
            } else {
              this.setData({
                [`indexs[0]`]: value,
                [`regions[1]`]: this.areaJson[value].sub,
                [`indexs[1]`]: 0,
              })
            }


          } else {
            this.setData({
              [`indexs[0]`]: value,
              [`regions[1]`]: this.areaJson[value].sub,
              [`indexs[1]`]: 0,
              [`regions[2]`]: this.areaJson[value].sub[0].sub,
              [`indexs[2]`]: 0,
            })
          }

          break;
        case 1:
          if (this.properties.selectStore) {
            this.setData({
              [`indexs[1]`]: value,
            })
          } else {
            this.setData({
              [`indexs[1]`]: value,
              [`regions[2]`]: this.areaJson[this.data.indexs[0]].sub[value].sub,
              [`indexs[2]`]: 0,
            })
          }

          break;
        case 2:
          this.setData({
            [`indexs[2]`]: value
          })
          break;
      }
    },
    selectDone: function(e) {

      var province = this.data.regions[0][this.data.indexs[0]].name
      var provinceID = this.areaIDJson[province]
      
      var selectItem = [{
        "name": province,
        "id": provinceID
      }]

      if ((provinceID == "02" ||
        provinceID == "03" ||
        provinceID == "10" ||
        provinceID == "22" ) && 
        this.properties.selectStore) {
        selectItem.push({
          "name": "",
          "id": ""
        })
      } else {
        var city = this.data.regions[1][this.data.indexs[1]].name
        var cityID = this.areaIDJson[province + " " + city]
        selectItem.push({
          "name": city,
          "id": cityID
        })
      }

      if (!this.properties.selectStore) {
        var region = ""

        if (this.data.regions[2].length > 0) {
          region = this.data.regions[2][this.data.indexs[2]].name
        }
        var regionID = this.areaIDJson[province + " " + city + " " + region] || ""

        selectItem.push({
          "name": region,
          "id": regionID
        })
      }else{
        selectItem.push({
          "name": "",
          "id": ""
        })
      }

      this.setData({
        indexs: this.data.indexs
      })

      this.triggerEvent("selectDone", selectItem, ) // 会依次触发 pageEventListener2 、 pageEventListener1
    },
    _search: function(array, id) {
      if (id == null) {
        return 0
      }
      for (var index in array) {
        var obj = array[index]
        if (id == obj.id) {
          return index
        }
      }
      return 0
    }

  }

})