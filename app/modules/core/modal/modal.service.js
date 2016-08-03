(function () {
  'use strict';

  angular.module('Core')
    .factory('ModalService', ModalService);

  /* @ngInject */
  function ModalService($modal, $translate) {
    var service = {
      open: openModal
    };

    return service;

    function openModal(options) {
      options = options || {};
      return $modal.open({
        size: options.size,
        templateUrl: 'modules/core/modal/modal.tpl.html',
        controller: 'ModalCtrl',
        controllerAs: 'modal',
        type: 'dialog',
        resolve: {
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
            return 'btn--' + (options.type || 'primary');
          }
        }
      });
    }
  }
})();
