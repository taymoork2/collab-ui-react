(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('gemBase', {
      controller: GemBaseCtrl,
      templateUrl: 'modules/gemini/common/gemBase.html',
    });

  /* @ngInject */
  function GemBaseCtrl($scope) {
    var vm = this;
    vm.$onInit = $onInit;
    vm.tabs = [{
      state: 'gem.base.tds',
      title: 'gemini.tdTitle',
    }, {
      state: 'gem.base.cbgs',
      title: 'gemini.cbgs.title',
    }];

    function $onInit() {
      vm.backState = 'gem.servicesPartner';
      $scope.$on('headerTitle', function (event, data) {
        vm.title = data || vm.title;
      });
    }
  }
})();
