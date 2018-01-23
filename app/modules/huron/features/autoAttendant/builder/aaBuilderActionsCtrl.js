(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var aaSayMessageTemplatePath = require('ngtemplate-loader?module=uc.autoattendant!modules/huron/features/autoAttendant/sayMessage/aaSayMessage.tpl.html');
  var aaPhoneMenuTemplatePath = require('ngtemplate-loader?module=uc.autoattendant!modules/huron/features/autoAttendant/phoneMenu/aaPhoneMenu.tpl.html');
  var aaDialByExtTemplatePath = require('ngtemplate-loader?module=uc.autoattendant!modules/huron/features/autoAttendant/dialByExt/aaDialByExt.tpl.html');
  var aaRouteCallMenuTemplatePath = require('ngtemplate-loader?module=uc.autoattendant!modules/huron/features/autoAttendant/routeCall/aaRouteCallMenu.tpl.html');
  var aaDecisionTemplatePath = require('ngtemplate-loader?module=uc.autoattendant!modules/huron/features/autoAttendant/decision/aaDecision.tpl.html');
  var aaCallerInputTemplatePath = require('ngtemplate-loader?module=uc.autoattendant!modules/huron/features/autoAttendant/callerInput/aaCallerInput.tpl.html');
  var aaRestApiTemplatePath = require('ngtemplate-loader?module=uc.autoattendant!modules/huron/features/autoAttendant/restApi/aaRestApi.tpl.html');

  angular
    .module('uc.autoattendant')
    .controller('AABuilderActionsCtrl', AABuilderActionsCtrl);

  /* @ngInject */
  function AABuilderActionsCtrl($rootScope, $scope, $translate, $controller, $modal, AAUiModelService, AACommonService, AutoAttendantCeMenuModelService, AutoAttendantHybridCareService, CustomVariableService) {
    var vm = this;
    var appendSpecialCharHelp = '<br><br>' + $translate.instant('autoAttendant.sayMessageSpecialChar');
    var appendRouteToPhoneNumberHelp = '<br><br>' + $translate.instant('autoAttendant.routeToPhoneNumberHelp');

    vm.options = [{
      title: $translate.instant('autoAttendant.actionSayMessage'),
      controller: 'AASayMessageCtrl as aaSay',
      url: aaSayMessageTemplatePath,
      hint: $translate.instant('autoAttendant.actionSayMessageHint'),
      help: $translate.instant('autoAttendant.sayMessageHelp') + appendSpecialCharHelp,
      metric: 'Say-Message-Title',
      showHelpLink: true,
      actions: ['play', 'say', 'dynamic'],
    }, {
      title: $translate.instant('autoAttendant.actionPhoneMenu'),
      controller: 'AAPhoneMenuCtrl as aaPhoneMenu',
      url: aaPhoneMenuTemplatePath,
      hint: $translate.instant('autoAttendant.actionPhoneMenuHint'),
      help: $translate.instant('autoAttendant.phoneMenuHelp') + appendSpecialCharHelp + appendRouteToPhoneNumberHelp,
      metric: 'Phone-Menu-Title',
      showHelpLink: true,
      actions: ['runActionsOnInput'],
    }, {
      title: $translate.instant('autoAttendant.actionRouteCall'),
      controller: 'AARouteCallMenuCtrl as aaRouteCallMenu',
      url: aaRouteCallMenuTemplatePath,
      hint: $translate.instant('autoAttendant.actionRouteCallHint'),
      help: $translate.instant('autoAttendant.routeCallMenuHelp'),
      metric: 'Route-Call-Title',
      showHelpLink: false,
      actions: ['route', 'goto', 'routeToUser', 'routeToVoiceMail', 'routeToHuntGroup', 'routeToQueue', 'routeToSipEndpoint'],
    }, {
      title: $translate.instant('autoAttendant.actionDecision'),
      ifTitle: $translate.instant('autoAttendant.actionIfDecision'),
      controller: 'AADecisionCtrl as aaDecisionCtrl',
      url: aaDecisionTemplatePath,
      hint: $translate.instant('autoAttendant.actionDecisionHint'),
      help: $translate.instant('autoAttendant.actionDecisionHelp'),
      metric: 'Decision-Title',
      showHelpLink: true,
      actions: ['conditional'],
    }, {
      title: $translate.instant('autoAttendant.actionCallerInput'),
      controller: 'AACallerInputCtrl as aaCallerInput',
      url: aaCallerInputTemplatePath,
      hint: $translate.instant('autoAttendant.actionCallerInputHint'),
      help: $translate.instant('autoAttendant.actionCallerInputHelp') + appendSpecialCharHelp,
      metric: 'Caller-Input-Title',
      type: [3, 4],
      showHelpLink: true,
      actions: ['runActionsOnInput'],
    }];

    vm.actionPlaceholder = $translate.instant('autoAttendant.actionPlaceholder');
    vm.option = ''; // no default option
    vm.schedule = '';
    vm.selectHint = '';

    vm.getOptionController = getOptionController;
    vm.selectOption = selectOption;
    vm.getSelectHint = getSelectHint;
    vm.removeAction = removeAction;

    var PHONE_MENU_INDEX = 1;

    /////////////////////
    function selectOption() {
      // if we are selecting a phone menu, re-initialize uiMenu.entries[vm.index] with a CeMenu.
      if (vm.option.actions[0] === 'runActionsOnInput' && !_.has(vm.option, 'type')) {
        var menu = AutoAttendantCeMenuModelService.newCeMenu();
        menu.type = 'MENU_OPTION';
        var uiMenu = vm.ui[vm.schedule];
        uiMenu.entries[vm.index] = menu;
      }
      AACommonService.setActionStatus(true);
    }

    function getSelectHint() {
      if (!vm.selectHint) {
        _.each(vm.options, function (option, index) {
          if (option.title && option.hint) {
            vm.selectHint = vm.selectHint
              .concat('<i>')
              .concat(option.title)
              .concat('</i>')
              .concat(' - ')
              .concat(option.hint)
              .concat('<br>');
            if (index < vm.options.length - 1) {
              vm.selectHint = vm.selectHint.concat('<br>');
            }
          }
        });
      }

      return vm.selectHint;
    }

    function getOptionController() {
      if (vm.option && vm.option.controller) {
        return $controller(vm.option.controller, {
          $scope: $scope,
        });
      }
    }
    function openVarNamesModal(vname, thisCeHasVar) {
      return $modal.open({
        template: require('modules/huron/features/autoAttendant/builder/aaVarNames.tpl.html'),
        controller: 'AAVarNamesModalCtrl',
        controllerAs: 'aaVarNamesModalCtrl',
        type: 'dialog',
        resolve: {
          varNames: function () {
            return vname;
          },
          ceHasVar: function () {
            return thisCeHasVar;
          },
        },
      }).result.then(function () {
        // user clicked Ok
        return true;
      }, function () {
        // user clicked cancel
        return false;
      });
    }

    function checkIfModal(varNames, thisCeHasVar) {
      if (!_.isEmpty(varNames) || thisCeHasVar) {
        // there are dependent Ce's
        return openVarNamesModal(varNames, thisCeHasVar);
      }
      // no dependent Ces, good to go
      return true;
    }

    function checkVarNameDependencies(varNameToCheck) {
      // flag as we need to alert if the current Ce uses this variable.
      // Current Ce will not be returned in list of dependant Ce
      var thisCeHasVar = AACommonService.collectThisCeActionValue(vm.ui, true, true).filter(function (value) {
        return _.isEqual(value, varNameToCheck);
      }).length > 1; // one for this CallerInput

      return CustomVariableService.getVariableDependencies(varNameToCheck).then(function (varNames) {
        return checkIfModal(varNames, thisCeHasVar);
      }, function () {
        return checkIfModal([], thisCeHasVar);
      });
    }
    function deleteMenu(uiMenu, index) {
      uiMenu.deleteEntryAt(index);
      AACommonService.setActionStatus(true);
    }

    function removeAction(index) {
      var uiMenu = vm.ui[vm.schedule];
      var entryI = uiMenu.entries[index];
      if (AutoAttendantCeMenuModelService.isCeMenu(entryI)) {
        AutoAttendantCeMenuModelService.deleteCeMenuMap(entryI.getId());
      }

      if (_.has(entryI, 'actions[0].variableName')) {
        checkVarNameDependencies(entryI.actions[0].variableName).then(function (okToDelete) {
          if (okToDelete) {
            deleteMenu(uiMenu, index);
            $rootScope.$broadcast('CE Updated');
          }
        });
      } else {
        deleteMenu(uiMenu, index);
      }
    }

    function setOption() {
      if ($scope.index >= 0) {
        var menuEntry = vm.ui[vm.schedule].getEntryAt($scope.index);
        if (menuEntry.type == 'MENU_OPTION') {
          vm.option = vm.options[PHONE_MENU_INDEX];
        } else if (menuEntry.actions.length > 0 && menuEntry.actions[0].getName()) {
          var matchType = function (action) {
            return menuEntry.actions[0].getName() === action &&
              (_.has(vm.options[i], 'type') ? _.includes(vm.options[i].type, menuEntry.actions[0].inputType) : true);
          };
          for (var i = 0; i < vm.options.length; i++) {
            var isMatch = vm.options[i].actions.some(matchType);
            if (isMatch) {
              vm.option = vm.options[i];
            }
          }
        }
      }
    }

    function setFeatureToggledActions() {
      if (AACommonService.isMediaUploadToggle()) {
        vm.options[0].help = vm.options[0].help.concat('<br></br>').concat($translate.instant('autoAttendant.mediaUploadFileInfo'));
        vm.options[1].help = vm.options[1].help.concat('<br></br>').concat($translate.instant('autoAttendant.mediaUploadFileInfo'));
        vm.options[2].help = vm.options[2].help.concat('<br></br>').concat($translate.instant('autoAttendant.mediaUploadFileInfo'));
      }

      if (AACommonService.isRestApiToggle()) {
        vm.options.push({
          title: $translate.instant('autoAttendant.actionRestApi'),
          controller: 'AARestApiCtrl as aaRestApiCtrl',
          url: aaRestApiTemplatePath,
          metric: 'Rest-Api-Title',
          showHelpLink: false,
          actions: ['doREST'],
        });
      }
      /* spark call options will be shown in case
       * 1. hybrid toggle is disabled
       * 2. hybrid toggle is enabled and customer have spark call configuration */
      if ((!AACommonService.isHybridEnabledOnOrg()) ||
        (AACommonService.isHybridEnabledOnOrg() && AutoAttendantHybridCareService.isSparkCallConfigured())) {
        vm.options.push({
          title: $translate.instant('autoAttendant.phoneMenuDialExt'),
          controller: 'AADialByExtCtrl as aaDialByExtCtrl',
          url: aaDialByExtTemplatePath,
          hint: $translate.instant('autoAttendant.actionDialByExtensionHint'),
          help: $translate.instant('autoAttendant.actionDialByExtensionHelp'),
          metric: 'Dial-By-Extension-Title',
          showHelpLink: false,
          type: [2, 5], // 2 goes for dialByExtension whereas 5 for dialByEsn
          actions: ['runActionsOnInput'],
        });
      }
    }

    function activate() {
      setFeatureToggledActions();
      vm.index = $scope.index;
      vm.schedule = $scope.schedule;
      vm.ui = AAUiModelService.getUiModel();
      setOption();
      vm.options.sort(AACommonService.sortByProperty('title'));
    }

    activate();
  }
})();
