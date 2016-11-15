(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgHeaderCtrl', CbgHeaderCtrl);

  /* @ngInject */
  function CbgHeaderCtrl($scope) {
    var vm = this;
    vm.tabs = [{
      state: 'gem.servicesPartner',
      title: 'gemini.tdTitle'
    }, {
      state: 'gem.cbgBase.cbgs',
      title: 'gemini.cbgs.title'
    }];
    vm.backState = 'gem.servicesPartner';

    $scope.$on('headerTitle', function (event, data) {
      vm.title = data;
    });
  }
})();
