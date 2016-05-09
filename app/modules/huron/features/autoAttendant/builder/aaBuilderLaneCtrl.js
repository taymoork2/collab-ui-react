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
        var targetHeight = angular.isDefined($target.outerHeight(true)) ? $target.outerHeight(true) : 0;
        var targetEnd = angular.isDefined($target.offset()) ? $target.offset().top + targetHeight : targetHeight;

        var $container = $("#builderScrollContainer");
        var containerEnd = angular.isDefined($container.offset()) && angular.isDefined($container.outerHeight(true)) ? $container.offset().top + $container.outerHeight(true) : 0;

        if (targetEnd > containerEnd) {
          var scrollPosition = $container.scrollTop();
          var offset = scrollPosition + targetHeight + 60; //60 is the space for the vertical lane and the +
          $container.animate({
            scrollTop: offset
          }, 800);

        }
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
