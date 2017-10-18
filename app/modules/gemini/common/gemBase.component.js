(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('gemBase', {
      controller: GemBaseCtrl,
      template: require('modules/gemini/common/gemBase.html'),
    });

  /* @ngInject */
  function GemBaseCtrl($scope, $translate) {
    var vm = this;
    vm.$onInit = $onInit;
    vm.tabs = [{
      state: 'gem.base.tds',
      title: $translate.instant('gemini.tdTitle'),
    }, {
      state: 'gem.base.cbgs',
      title: $translate.instant('gemini.cbgTitle'),
    }];

    function $onInit() {
      vm.backState = 'gem.servicesPartner';
      $scope.$on('headerTitle', function (event, data) {
        vm.title = data || vm.title;
      });
    }
  }
})();
