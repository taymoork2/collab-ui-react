(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('AATypeSelectCtrl', AATypeSelectCtrl);

  /* @ngInject */
  function AATypeSelectCtrl($scope, $modalInstance, $translate, $state) {
    var vm = $scope;
    vm.cancel = cancel;
    vm.ok = okay;
    vm.aatypes = [{
      id: 1,
      title: $translate.instant('autoAttendant.AABasic'),
      desc: $translate.instant('autoAttendant.AABasicDesc'),
      icons: ['icon-audio-plus', 'icon-playlist'],
      showLine: true
    }, {
      id: 2,
      title: $translate.instant('autoAttendant.AACustom'),
      desc: $translate.instant('autoAttendant.AACustomDesc'),
      icons: ['icon-audio-plus', 'icon-headset', 'icon-playlist']
    }];

    function okay(type) {
      var aatype = {};
      if (type.id === 1) {
        aatype.aaName = '';
        aatype.aaTemplate = 'template1';
      }
      $state.go('huronfeatures.aabuilder', aatype);
      $modalInstance.close(type);
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

  }
})();
