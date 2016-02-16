(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AARouteCallMenuCtrl', AARouteCallMenuCtrl);

  /* @ngInject */
  function AARouteCallMenuCtrl($scope, $translate, AAUiModelService) {

    var vm = this;
    vm.actionPlaceholder = $translate.instant('autoAttendant.actionPlaceholder');

    vm.options = [{
        "label": "Route to User",
        "value": "routeToUser"
      }, {
        "label": "Route to Voicemail",
        "value": "routeToVoiceMail"
      }, {
        "label": "Route to Hunt Group",
        "value": "routeToHuntGroup"
      }, {
        "label": "Route to Auto Attendant",
        "value": "goto"
      }, {
        "label": "Route to External Number",
        "value": "route"
      }

    ];

    vm.selected = {
      label: '',
      value: ''
    };

    vm.setSelects = setSelects;

    function setSelects() {

      var val;

      /* look for matching action in menuEntries
         Set label from our list. Will trigger the html and the
         appropriate controller will setup the select list
       */

      _.forEach(vm.options, function (option) {
        val = _.find(vm.menuEntry.actions, {
          name: option.value
        });
        if (angular.isDefined(val)) {
          if (val.name === option.value) {
            vm.selected.label = option.label;
            return true;
          }
        }

      });

    }

    function activate() {
      var ui = AAUiModelService.getUiModel();

      vm.menuEntry = ui[$scope.schedule].entries[$scope.index];

      setSelects();

    }

    activate();
  }
})();
