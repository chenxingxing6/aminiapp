Page({
  data: {
    code: '', // 手机验证码input内容
    mobile: '13467898765', // 手机号
    disabled: false // 是否可以编辑手机号
  },
  /**
   * 点击发送验证码触发的事件
   * @method onSendCode
   * @param {object} object 组件传递参数,包含手机号
   */
  onSendCode(object) {
    my.alert({
      title: '温馨提示',
      content: '点击发送 -> 手机号:' + object.mobile
    });
    this.setData({ mobile: object.mobile });
  },
  /**
   * 输入验证码触发的事件
   * @method onCodeInput
   * @param {*} e
   */
  onCodeInput(e) {
    const { value } = e.detail;
    this.setData({ code: value });
  },
  /**
   * 点击提交触发的事件
   * @method defaultTap
   */
  defaultTap() {
    my.alert({
      title: '温馨提示',
      content: '点击提交 -> 手机号:' + this.data.mobile + ' -> ' + '验证码:' + this.data.code
    });
  }
});
