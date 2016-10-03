(function () {
  'use strict';

  angular
    .module('Core')
    .controller('MeetingDetailCtrl', MeetingDetailCtrl);

  /* @ngInject */
  function MeetingDetailCtrl($stateParams, $translate) {
    var vm = this;
    var QTY = _.toUpper($translate.instant('common.quantity'));
    vm.meetingLicenses = _.map($stateParams.meetingLicenses, function (license) {
      return _.assign({}, license, {
        detail: license.qty + ' ' + QTY
      });
    });
  }

})();
