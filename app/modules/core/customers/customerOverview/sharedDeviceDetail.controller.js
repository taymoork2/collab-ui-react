(function () {
  'use strict';

  angular
    .module('Core')
    .controller('SharedDeviceDetailCtrl', SharedDeviceDetailCtrl);

  /* @ngInject */
  function SharedDeviceDetailCtrl($stateParams, $translate) {
    var vm = this;
    var QTY = _.toUpper($translate.instant('common.quantity'));
    vm.sharedDeviceLicenses = _.map($stateParams.sharedDeviceLicenses, function (license) {
      return _.assign({}, license, {
        detail: license.qty + ' ' + QTY,
      });
    });
  }

})();

