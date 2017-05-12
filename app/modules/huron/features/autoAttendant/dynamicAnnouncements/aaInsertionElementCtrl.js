(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAInsertionElementCtrl', AAInsertionElementCtrl);

  /* @ngInject */
  function AAInsertionElementCtrl($scope) {

    var vm = this;

    vm.mainClickFn = mainClickFn;
    //vm.closeClickFn = closeClickFn;

    /////////////////////

    function mainClickFn() {}

    //function closeClickFn() {}

    function setUp() {
      vm.elementText = $scope.textValue;
    }

    function activate() {
      setUp();
    }

    activate();

  }
})();
