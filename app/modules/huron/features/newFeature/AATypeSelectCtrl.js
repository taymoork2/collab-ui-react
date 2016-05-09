(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('AATypeSelectCtrl', AATypeSelectCtrl);

  /* @ngInject */
  function AATypeSelectCtrl($scope, $modalInstance, $translate, $state, AAMetricNameService) {
    var vm = $scope;
    vm.cancel = cancel;
    vm.ok = okay;
    vm.aatypes = [{
      id: 1,
      name: $translate.instant('autoAttendant.AABasic'),
      title: $translate.instant('autoAttendant.AABasic'),
      desc: $translate.instant('autoAttendant.AABasicDesc'),
      icons: ['icon-audio-plus', 'icon-playlist'],
      showLine: true
    }, {
      id: 2,
      name: $translate.instant('autoAttendant.AACustom'),
      title: $translate.instant('autoAttendant.AACustom'),
      desc: $translate.instant('autoAttendant.AACustomDesc'),
      icons: ['icon-audio-plus', 'icon-headset', 'icon-playlist']
    }, {
      id: 3,
      name: 'OpenClosed',
      title: $translate.instant('autoAttendant.AABusinessHours'),
      desc: $translate.instant('autoAttendant.AABusinessHoursDesc'),
      icons: ['icon-clock', 'icon-audio-plus', 'icon-audio-plus'],
      showTreeLine: true
    }];

    function okay(type) {
      var aatype = {};
      if (type.id === 1) {
        aatype.aaName = '';
        aatype.aaTemplate = 'template1';
      } else if (type.id === 3) {
        aatype.aaName = '';
        aatype.aaTemplate = 'OpenClosedHoursTemplate';
      }
      Localytics.tagEvent(AAMetricNameService.CREATE_AA, {
        type: type.title
      });
      $state.go('huronfeatures.aabuilder', aatype);
      $modalInstance.close(type);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

  }
})();
