(function () {
  'use strict';

  module.exports = ModalService;

  /* @ngInject */
  function ModalService($modal, $translate) {
    var service = {
      open: openModal,
    };

    return service;

    function openModal(options) {
      options = options || {};
      return $modal.open({
        template: require('modules/core/modal/modal.tpl.html'),
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        type: options.type || 'dialog',
        resolve: {
          hideDismiss: function () {
            return options.hideDismiss || false;
          },
          hideTitle: function () {
            return options.hideTitle || false;
          },
          title: function () {
            return options.title || $translate.instant('common.modal');
          },
          message: function () {
            return options.message || '';
          },
          close: function () {
            return !_.isUndefined(options.close) ? options.close : $translate.instant('common.ok');
          },
          dismiss: function () {
            return !_.isUndefined(options.dismiss) ? options.dismiss : $translate.instant('common.cancel');
          },
          btnType: function () {
            return 'btn--' + (options.btnType || 'primary');
          },
        },
      });
    }
  }
})();
