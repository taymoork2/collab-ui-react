(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAInsertionElementCtrl', AAInsertionElementCtrl);

  /* @ngInject */
  function AAInsertionElementCtrl($scope, $modal, $translate, AAUiModelService, AACommonService) {

    var vm = this;

    var ui;
    var uiMenu;
    vm.mainClickFn = mainClickFn;
    vm.variableOptions = [
      {
        label: $translate.instant('autoAttendant.decisionNumberDialed'),
        value: 'Original-Called-Number',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerNumber'),
        value: 'Original-Caller-Number',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerName'),
        value: 'Original-Remote-Party-ID',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerCountryCode'),
        value: 'Original-Caller-Country-Code',
      }, {
        label: $translate.instant('autoAttendant.decisionCallerAreaCode'),
        value: 'Original-Caller-Area-Code',
      },
    ];
    //vm.closeClickFn = closeClickFn;

    /////////////////////

    function mainClickFn() {

      populateUiModel();

      var id = $scope.elementId;
      var dynaList = vm.menuEntry.dynamicList;
      _.forEach(dynaList, function (node) {
        var html = decodeURIComponent(node.htmlModel);
        if (html.search(id) >= 0) {
          openModal(node.say).result
          .then(function (result) {
            if (vm.elementText != result.variable.label || vm.readAs != result.readAs.value) {
              vm.elementText = result.variable.label;
              vm.readAs = result.readAs.value;
              node.say.value = result.variable.value;
              node.say.as = vm.readAs;
              var ele = '<aa-insertion-element element-text="' + node.say.value + '" read-as="' + node.say.as + '" element-id="' + id + '" aa-schedule="' + $scope.schedule + '" aa-index="' + $scope.index + '"></aa-insertion-element>';
              node.htmlModel = encodeURIComponent(ele);
              AACommonService.setSayMessageStatus(true);
            }
          });
        }
      });
    }

    function openModal(say) {
      return $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/dynamicAnnouncements/aaDynamicAnnouncementsModal.tpl.html',
        controller: 'AADynamicAnnouncementsModalCtrl',
        controllerAs: 'aaDynamicAnnouncementsModalCtrl',
        type: 'small',
        resolve: {
          variableSelection: function () {
            return say.value;
          },
          readAsSelection: function () {
            return say.as;
          },
        },
        modalClass: 'aa-dynamic-announcements-modal',
      });
    }

    //function closeClickFn() {}

    function populateUiModel() {
      ui = AAUiModelService.getUiModel();
      uiMenu = ui[$scope.schedule];
      vm.menuEntry = uiMenu.entries[$scope.index];
    }

    function setUp() {
      var variableOption = _.find(vm.variableOptions, { 'value': $scope.textValue });
      vm.elementText = variableOption ? variableOption.label : $scope.textValue;
      vm.readAs = $scope.readAs;
      vm.elementId = $scope.elementId;
    }

    function activate() {
      setUp();
    }

    activate();

  }
})();
