(function () {
  'use strict';

  module.exports = ModalCtrl;

  /* @ngInject */
  function ModalCtrl(title, message, close, dismiss, btnType, hideTitle, hideDismiss) {
    var vm = this;

    vm.hideDismiss = hideDismiss;
    vm.hideTitle = hideTitle;
    vm.title = title;
    vm.message = message;
    vm.close = close;
    vm.dismiss = dismiss;
    vm.btnType = btnType;
  }
})();
