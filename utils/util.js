const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const isEmpty = str => {
  if (str == null) return true
  if (Object.keys(str).length > 0) {
    return false
  }
  return true
}

/**
 * 图片压缩方法
 */
const imageThumbnail = (thumbnail = '400x', quality = 80) => {
  return `imageMogr2/thumbnail/${thumbnail}/quality/${quality}`;
} 
module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  isEmpty: isEmpty,
  imageThumbnail: imageThumbnail
}