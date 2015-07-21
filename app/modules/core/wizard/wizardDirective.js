(function () {
  'use strict';

  angular.module('Core')
    .factory('PromiseHook', PromiseHook)
    .controller('WizardCtrl', WizardCtrl)
    .directive('crWizard', crWizard)
    .directive('crWizardNav', crWizardNav)
    .directive('crWizardMain', crWizardMain)
    .directive('crWizardButtons', crWizardButtons);

  /* @ngInject */
  function PromiseHook($q) {
    return factory;

    function factory(scope, name, controllerAs) {
      var promises = [];
      (function traverse(scope) {
        if (!scope) {
          return;
        }

        if (controllerAs && scope[controllerAs] && scope[controllerAs][name]) {
          promises.push($q.when(scope[controllerAs][name]()));
          return;
        } else if (scope[name]) {
          promises.push($q.when(scope[name]()));
          return;
        }

        traverse(scope.$$childHead);
        traverse(scope.$$nextSibling);
      })(scope.$$childHead);

      // If we need to wait for a promise, make the button spin
      if (promises.length > 0) {
        angular.element('#wizardNext').button('loading');
      }
      return $q.all(promises);
    }
  }

  /* @ngInject */
  function WizardCtrl($scope, $rootScope, $controller, $translate, PromiseHook, $log, $modal, Authinfo, SessionStorage, $stateParams, $state) {
    var vm = this;
    vm.current = {};
    vm.currentTab = $stateParams.currentTab;
    vm.termsCheckbox = false;
    vm.isCustomerPartner = isCustomerPartner;
    vm.isFromPartnerLaunch = isFromPartnerLaunch;

    vm.getTabController = getTabController;
    vm.getSubTabController = getSubTabController;
    vm.getSubTabTitle = getSubTabTitle;

    vm.setSubTab = setSubTab;
    vm.setTab = setTab;

    vm.previousTab = previousTab;
    vm.nextTab = nextTab;
    vm.previousStep = previousStep;
    vm.nextStep = nextStep;
    vm.getRequiredTabs = getRequiredTabs;

    vm.isFirstTab = isFirstTab;
    vm.isLastTab = isLastTab;
    vm.isFirstStep = isFirstStep;
    vm.isLastStep = isLastStep;
    vm.isFirstTime = isFirstTime;
    vm.isWizardModal = isWizardModal;

    vm.nextText = $translate.instant('common.next');

    vm.openTermsAndConditions = openTermsAndConditions;
    vm.closeModal = closeModal;
    vm.isCurrentTab = isCurrentTab;
    vm.loadOverview = loadOverview;


    init();

    function init() {
      if ($stateParams.currentTab) {
        var tabIndex = _.findIndex(getTabs(), function (t) {
          return t.name === $stateParams.currentTab;
        });
        vm.current.tab = getTabs()[tabIndex];
      } else {
        vm.current.tab = getTabs()[0];
      }
      vm.current.step = getSteps()[0];

      setNextText();
    }

    function getSteps() {
      var tab = getTab();
      if (tab.steps) {
        return tab.steps;
      } else if (tab.subTabs) {
        for (var i = 0; i < tab.subTabs.length; i++) {
          if (angular.isUndefined(getSubTab()) || tab.subTabs[i] === getSubTab()) {
            vm.current.subTab = tab.subTabs[i];
            return tab.subTabs[i].steps;
          }
        }
      }
    }

    function getStep() {
      return vm.current.step;
    }

    function setStep(step) {
      vm.current.step = step;
      setNextText();
    }

    function getStepName() {
      var step = getStep();
      if (step) {
        return step.name;
      }
    }

    function getSubTab() {
      return vm.current.subTab;
    }

    function setSubTab(subTab) {
      vm.current.subTab = subTab;
      if (angular.isDefined(subTab)) {
        setStep(getSteps()[0]);
      }
    }

    function getTabs() {
      return $scope.tabs;
    }

    function getTab() {
      return vm.current.tab;
    }

    function setTab(tab, subTab, stepIndex) {
      vm.current.tab = tab;
      setSubTab(subTab);
      setStep(getSteps()[typeof stepIndex === 'undefined' ? 0 : stepIndex]);
    }

    function getSubTabTitle() {
      var tab = getTab();
      if (tab.subTabs) {
        for (var i = 0; i < tab.subTabs.length; i++) {
          if (tab.subTabs[i].name === getSubTab()) {
            return tab.subTabs[i].title;
          }
        }
      }
    }

    function getTabController($scope) {
      var tab = getTab();
      if (tab && tab.controller) {
        return $controller(tab.controller, {
          $scope: $scope
        });
      }
    }

    function getSubTabController($scope) {
      var subTab = getSubTab();
      if (subTab && subTab.controller) {
        return $controller(subTab.controller, {
          $scope: $scope
        });
      }
    }

    function loadOverview() {
      $state.go('overview');
    }

    function previousTab() {
      var tabs = getTabs();
      if (angular.isArray(tabs)) {
        var tabIndex = tabs.indexOf(getTab());
        if (tabIndex > 0) {
          setTab(tabs[tabIndex - 1]);
        }
      }
    }

    function nextTab() {
      var tabs = getTabs();
      if (angular.isArray(tabs)) {
        var tabIndex = tabs.indexOf(getTab());
        $scope.tabs[tabIndex].required = false;
        if (tabIndex + 1 < tabs.length) {
          setTab(tabs[tabIndex + 1]);
        } else if (tabIndex + 1 === tabs.length && angular.isFunction($scope.finish)) {
          $scope.finish();
        }
      }
    }

    function previousStep() {
      var steps = getSteps();
      if (angular.isArray(steps)) {
        var index = steps.indexOf(getStep());
        if (index > 0) {
          setStep(steps[index - 1]);
        } else if (index === 0) {
          previousTab();
        }
      }
    }

    function nextStep() {
      new PromiseHook($scope, getStepName() + 'Next', getTab().controllerAs).then(function () {
        //TODO remove these broadcasts
        if (getTab().name === 'messagingSetup' && getStep().name === 'setup') {
          $rootScope.$broadcast('wizard-messenger-setup-event');
          updateStep();
        } else if (getTab().name === 'communications' && getStep().name === 'claimSipUrl') {
          $rootScope.$broadcast('wizard-claim-sip-uri-event');
          updateStep();
        } else {
          updateStep();
        }
      }).finally(function () {
        angular.element('#wizardNext').button('reset');
      });

      //if(getTab()==='enterpriseSetting'){
      //call service setup. 
      //}
    }

    function updateStep() {
      var steps = getSteps();
      if (angular.isArray(steps)) {
        var index = steps.indexOf(getStep());
        if (index + 1 < steps.length) {
          setStep(steps[index + 1]);
        } else if (index + 1 === steps.length) {
          nextTab();
        }
      }
    }

    function getRequiredTabs() {
      return getTabs().filter(function (tab) {
        return tab.required;
      }).map(function (tab) {
        return $translate.instant(tab.label);
      });
    }

    function isCustomerPartner() {
      return Authinfo.getRoles().indexOf('CUSTOMER_PARTNER') > -1;
    }

    function isFromPartnerLaunch() {
      return SessionStorage.get('customerOrgId') !== null;
    }

    function isFirstTab() {
      return getTabs().indexOf(getTab()) === 0;
    }

    function isLastTab() {
      var tabs = getTabs();
      return tabs.indexOf(getTab()) === tabs.length - 1;
    }

    function isFirstStep() {
      return getSteps().indexOf(getStep()) === 0;
    }

    function isLastStep() {
      var steps = getSteps();
      return steps.indexOf(getStep()) === steps.length - 1;
    }

    function isFirstTime() {
      return $scope.isFirstTime;
    }

    function isCurrentTab(tabName) {
      return tabName === vm.current.tab.name;
    }

    function isWizardModal() {
      return true;
    }

    function setNextText() {
      if (isFirstTab() && isFirstTime() && !isCustomerPartner() && !isFromPartnerLaunch()) {
        vm.nextText = $translate.instant('firstTimeWizard.startTrial');
      } else if (isFirstTab() && isFirstStep()) {
        vm.nextText = $translate.instant('firstTimeWizard.getStarted');
      } else if ((isLastStep() && !isFirstStep()) || (isFirstTime() && isLastTab() && isLastStep())) {
        vm.nextText = $translate.instant('common.finish');
      } else if (isLastStep() && isFirstStep()) {
        vm.nextText = $translate.instant('common.save');
      } else {
        vm.nextText = $translate.instant('common.next');
      }
    }

    function openTermsAndConditions() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/core/wizard/termsAndConditions.tpl.html'
      });
    }

    function closeModal() {
      $state.modal.close();
    }

    $scope.$on('wizardNextText', function (event, action) {
      event.stopPropagation();
      if (action == 'next') {
        vm.nextText = $translate.instant('common.next');
      } else if (action == 'finish') {
        vm.nextText = $translate.instant('common.finish');
      }
    });
  }

  function crWizard() {
    var directive = {
      controller: 'WizardCtrl',
      controllerAs: 'wizard',
      restrict: 'AE',
      scope: {
        tabs: '=',
        finish: '=',
        isFirstTime: "="
      },
      templateUrl: 'modules/core/wizard/wizard.tpl.html'
    };

    return directive;
  }

  function crWizardNav() {
    var directive = {
      require: '^crWizard',
      restrict: 'AE',
      templateUrl: 'modules/core/wizard/wizardNav.tpl.html'
    };

    return directive;
  }

  /* @ngInject */
  function crWizardMain($compile, $timeout) {
    var directive = {
      require: '^crWizard',
      restrict: 'AE',
      scope: true,
      templateUrl: 'modules/core/wizard/wizardMain.tpl.html',
      link: link
    };

    return directive;

    function link(scope, element) {

      var cancelTabWatch = scope.$watch('wizard.current.tab', recompile);
      var cancelSubTabWatch = scope.$watch('wizard.current.subTab', recompile);

      function recompile(newValue, oldValue) {
        if (newValue !== oldValue) {
          cancelTabWatch();
          cancelSubTabWatch();
          $timeout(function () {
            var parentScope = scope.$parent;
            scope.$destroy();
            element.replaceWith($compile(element)(parentScope));
          });
        }
      }
    }
  }

  /* @ngInject */
  function crWizardButtons($compile, $timeout) {
    var directive = {
      restrict: 'AE',
      scope: true,
      templateUrl: 'modules/core/wizard/wizardButtons.tpl.html',
      link: link
    };

    return directive;

    function link(scope, element) {

      var cancelStepWatch = scope.$watch('wizard.current.step', recompile);

      function recompile(newValue, oldValue) {
        if (newValue !== oldValue) {
          cancelStepWatch();
          $timeout(function () {
            var parentScope = scope.$parent;
            scope.$destroy();
            element.replaceWith($compile(element)(parentScope));
          });
        }
      }
    }
  }
})();
