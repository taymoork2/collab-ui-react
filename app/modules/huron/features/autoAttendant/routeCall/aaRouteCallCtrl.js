(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteCallMenuCtrl', AARouteCallMenuCtrl);

  /* @ngInject */
  function AARouteCallMenuCtrl($scope, $translate, $filter, AAUiModelService, AutoAttendantCeMenuModelService, AAModelService, AACommonService) {

    var vm = this;
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceholder');
    vm.actionPlaceholder = $translate.instant('autoAttendant.actionPlaceholder');
    vm.options = [{
        "label": "Route to Auto Attendant",
        "value": "goto"
      }, {
        "label": "Route to Hunt Group",
        "value": "routeToHuntGroup"
      }, {
        "label": "Route to User",
        "value": "routeToUser"
      }, {
        "label": "Route to Voicemail",
        "value": "routeToVoiceMail"
      }, {
        "label": "Dial by Extension",
        "value": "routeToExtension"
      }, {
        "label": "Route to External Number",
        "value": "route"
      },

    ];

    vm.selectChanged = selectChangeFn;

    vm.selected = {
      label: '',
      value: ''
    };

    function selectChangeFn() {
      var sel = vm.selected;
    }

    function setSelects() {
      var result;

      // check for existing route to option from list.
      if (result = _.find(vm.options, {
          value: _.head(_.map(vm.menuEntry.actions, 'name'))
        })) {
        vm.selected = result;
      }

    }

    function activate() {
      vm.schedule = $scope.schedule;
      var ui = AAUiModelService.getUiModel();
      vm.uiMenu = ui[vm.schedule];
      vm.entries = vm.uiMenu.entries;
      vm.menuEntry = vm.entries[$scope.index];

      setSelects();

    }

    activate();
  }
})();
