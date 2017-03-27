(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CareLicenseDetailCtrl', CareLicenseDetailCtrl);

  /* @ngInject */
  function CareLicenseDetailCtrl($stateParams, $translate) {
    var vm = this;
    var QTY = _.toUpper($translate.instant('common.quantity'));
    vm.careLicense = _.map($stateParams.careLicense, function (license) {
      return _.assign({}, license, {
        detail: license.qty + ' ' + QTY,
      });
    });
  }
})();

