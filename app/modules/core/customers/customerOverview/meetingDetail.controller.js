(function () {
  'use strict';

  angular
    .module('Core')
    .controller('MeetingDetailCtrl', MeetingDetailCtrl);

  /* @ngInject */
  function MeetingDetailCtrl($stateParams) {
    var vm = this;
    vm.meetingLicenses = $stateParams.meetingLicenses;
  }

})();
