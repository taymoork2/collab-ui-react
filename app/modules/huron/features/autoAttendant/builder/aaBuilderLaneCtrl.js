(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderLaneCtrl', AABuilderLaneCtrl);

  /* @ngInject */
  function AABuilderLaneCtrl($scope, $stateParams, AAUiModelService, AAModelService, AutoAttendantCeMenuModelService, Config, AACommonService, $timeout) {

    var vm = this;
    vm.schedule = "";
    vm.entries = [];
    vm.templateName = $stateParams.aaTemplate;
    vm.allowStepAddsDeletes = Config.isDev() || Config.isIntegration();
    vm.addAction = addAction;

    /////////////////////

    function addAction(index) {
      var uiMenu = vm.ui[vm.schedule];
      var menuEntry;

      menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
      uiMenu.addEntryAt(index + 1, menuEntry);
      AACommonService.setActionStatus(true);

      // scroll to the added new step/action form
      $timeout(function () {
        var $target = $("#newStepForm" + vm.schedule + (index + 1));
        var targetPosition = $target.position().top;
        var targetHeight = $target.outerHeight(true);

        var $container = $("#builderScrollContainer");
        var containerPosition = $container.position().top;

        var offset = targetPosition + containerPosition + targetHeight;
        $container.animate({
          scrollTop: offset
        }, 600);
        // todo: focus cs-select nested href
      });
    }

    function activate() {
      vm.schedule = $scope.schedule;
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = AAUiModelService.getUiModel();
    }

    activate();
  }
})();
