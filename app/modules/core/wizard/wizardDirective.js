(function () {
  'use strict';

  angular.module('Core')
    .factory('PromiseHook', PromiseHook)
    .controller('WizardCtrl', WizardCtrl)
    .directive('crWizard', crWizard)
    .directive('crWizardNav', crWizardNav)
    .directive('crWizardMain', crWizardMain);

  /* @ngInject */
  function PromiseHook($q) {
    return factory;

    function factory(scope, name) {
      var promises = [];
      (function traverse(scope) {
        if (!scope) {
          return;
        }

        if (scope[name]) {
          promises.push($q.when(scope[name]()));
          return;
        }

        traverse(scope.$$childHead);
        traverse(scope.$$nextSibling);
      })(scope.$$childHead);

      return $q.all(promises);
    };
  }

  /* @ngInject */
  function WizardCtrl($scope, $controller, $translate, PromiseHook) {
    var vm = this;
    vm.current = {};

    vm.getController = getController;
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

    vm.getNextText = getNextText;

    init();

    $scope.$on('nextTab', nextTab);
    $scope.$on('setSubTab', function (event, args) {
      setSubTab(args);
    });

    function init() {
      vm.current.tab = getTabs()[0];
      vm.current.step = getSteps()[0];
    }

    function getSteps() {
      var tab = getTab();
      if (tab.steps) {
        return tab.steps;
      } else if (tab.subTabs) {
        for (var i = 0; i < tab.subTabs.length; i++) {
          if (angular.isUndefined(getSubTab()) || tab.subTabs[i].name === getSubTab()) {
            vm.current.subTab = tab.subTabs[i].name;
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

    function getController($scope) {
      var tab = getTab();
      if (tab && tab['controller']) {
        return $controller(tab['controller'], {
          $scope: $scope
        });
      }
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
      new PromiseHook($scope, getStepName() + 'Next').then(function (value) {
        var steps = getSteps();
        if (angular.isArray(steps)) {
          var index = steps.indexOf(getStep());
          if (index + 1 < steps.length) {
            setStep(steps[index + 1]);
          } else if (index + 1 === steps.length) {
            nextTab();
          }
        }
      });
    }

    function getRequiredTabs() {
      return getTabs().filter(function (tab) {
        return tab.required;
      }).map(function (tab) {
        return $translate.instant(tab.label);
      });
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

    function getNextText() {
      if (isFirstTab() && isFirstStep()) {
        return 'common.begin';
      } else if ((isLastStep() && !isFirstStep()) || (isFirstTime() && isLastTab() && isLastStep())) {
        return 'common.finish';
      } else if (isLastStep() && isFirstStep()) {
        return 'common.save';
      } else {
        return 'common.next';
      }
    }
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

    function link(scope, element, attrs, wizardCtrl) {

      var cancelTabWatch = scope.$watch('wizard.current.tab', recompile);
      var cancelStepWatch = scope.$watch('wizard.current.step', recompile);

      function recompile(newValue, oldValue) {
        if (newValue !== oldValue) {
          cancelTabWatch();
          cancelStepWatch();
          $timeout(function () {
            var parentScope = scope.$parent;
            scope.$destroy();
            element.replaceWith($compile(element)(parentScope));
          });
        }
      };
    }
  }
})();
