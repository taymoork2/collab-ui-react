(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAInsertionElementCtrl', AAInsertionElementCtrl);

  /* @ngInject */
  function AAInsertionElementCtrl($scope, $modal, $translate, AAUiModelService, AACommonService, AADynaAnnounceService) {
    var vm = this;

    var ui;

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
    vm.closeClickFn = closeClickFn;

    /////////////////////

    function mainClickFn() {
      var id = $scope.elementId;
      populateUiModel(id);
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
              var ele = '<aa-insertion-element element-text="' + node.say.value + '" read-as="' + node.say.as + '" element-id="' + id + '"></aa-insertion-element>';
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

    function closeClickFn() {
      var range = AADynaAnnounceService.getRange();
      range.endContainer.parentElement.parentElement.parentElement.remove();

      var id = $scope.elementId;
      populateUiModel(id);
      var dynaList = vm.menuEntry.dynamicList;
      _.forEach(dynaList, function (node) {
        var html = decodeURIComponent(node.htmlModel);
        if (html.search(id) >= 0) {
          vm.elementText = '';
          vm.readAs = '';
          node.say = {
            value: '',
            voice: '',
          };
          node.isDynamic = false;
          node.htmlModel = '';
          AACommonService.setSayMessageStatus(true);
        }
      });
    }

    function populateUiModel(elementId) {
      var found = false;
      ui = AAUiModelService.getUiModel();
      //checking the menuEntry which contains dynamic element corresponding to elementId
      _.some(ui, function (uiMenu) {
        var menuEntries = uiMenu.entries;
        _.some(menuEntries, function (menuEntry) {
          if (menuEntry.dynamicList) {
            var dynaList = menuEntry.dynamicList;
            _.some(dynaList, function (node) {
              var html = decodeURIComponent(node.htmlModel);
              if (html.search(elementId) >= 0) {
                vm.menuEntry = menuEntry;
                found = true;
                return found;
              }
            });
            if (found) {
              return true;
            }
          }
        });
        if (found) {
          return true;
        }
      });
    }

    function setUp() {
      var variableOption = _.find(vm.variableOptions, { value: $scope.textValue });
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
