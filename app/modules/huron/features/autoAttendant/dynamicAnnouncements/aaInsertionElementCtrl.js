(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAInsertionElementCtrl', AAInsertionElementCtrl);

  /* @ngInject */
  function AAInsertionElementCtrl($scope, $modal) {

    var vm = this;

    vm.mainClickFn = mainClickFn;
    //vm.closeClickFn = closeClickFn;

    /////////////////////

    function mainClickFn(result) {
      $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/dynamicAnnouncements/aaDynamicAnnouncementsModal.tpl.html',
        controller: 'AADynamicAnnouncementsModalCtrl',
        controllerAs: 'aaDynamicAnnouncementsModalCtrl',
        type: 'small',
        resolve: {
          variableSelection: function () {
            return result;
          },
          readAsSelection: function () {
            return vm.readAs;
          },
        },
        modalClass: 'aa-dynamic-announcements-modal',
      });
    }

    //function closeClickFn() {}

    function setUp() {
      vm.elementText = $scope.textValue;
      vm.readAs = $scope.readAs;
    }

    function activate() {
      setUp();
    }

    activate();

  }
})();
