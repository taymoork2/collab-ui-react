(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('AATypeSelectCtrl', AATypeSelectCtrl);

  /* @ngInject */
  function AATypeSelectCtrl($scope, $modalInstance, $translate, $state, AAMetricNameService, Localytics) {
    var vm = $scope;
    vm.cancel = cancel;
    vm.ok = okay;
    vm.aatypes = [{
      id: 1,
      name: 'Basic',
      title: $translate.instant('autoAttendant.AABasic'),
      desc: $translate.instant('autoAttendant.AABasicDesc'),
      icons: ['icon-audio-plus', 'icon-playlist'],
      showLine: true
    }, {
      id: 2,
      name: 'Custom',
      title: $translate.instant('autoAttendant.AACustom'),
      desc: $translate.instant('autoAttendant.AACustomDesc'),
      icons: ['icon-audio-plus', 'icon-headset', 'icon-playlist']
    }, {
      id: 3,
      name: 'BusinessHours',
      title: $translate.instant('autoAttendant.AABusinessHours'),
      desc: $translate.instant('autoAttendant.AABusinessHoursDesc'),
      icons: ['icon-clock', 'icon-audio-plus', 'icon-audio-plus'],
      showTreeLine: true
    }];

    function okay(type) {
      var aatype = {};
      aatype.aaName = '';
      aatype.aaTemplate = type.name;
      Localytics.tagEvent(AAMetricNameService.CREATE_AA, {
        type: type.name
      });
      $state.go('huronfeatures.aabuilder', aatype);
      $modalInstance.close(type);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

  }
})();
