'use strict';

angular.module('Core')

.factory('PromiseHook', ['$q', function ($q) {
  return function PromiseHook(scope, name) {
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
}])

.controller('WizardCtrl', ['$scope', '$controller', '$translate', 'PromiseHook',
  function ($scope, $controller, $translate, PromiseHook) {
    $scope.current = {};

    var init = function () {
      $scope.current.tab = getTabs()[0];
      $scope.current.step = getSteps()[0];
    };

    var getSteps = function () {
      var tab = getTab();
      if (tab.steps) {
        return tab.steps;
      } else if (tab.subTabs) {
        for (var i = 0; i < tab.subTabs.length; i++) {
          if (angular.isUndefined(getSubTab()) || tab.subTabs[i].name === getSubTab()) {
            $scope.current.subTab = tab.subTabs[i].name;
            return tab.subTabs[i].steps;
          }
        }
      }
    };

    var getStep = function () {
      return $scope.current.step;
    };

    var setStep = function (step) {
      $scope.current.step = step;
    };

    var getStepName = function () {
      var step = getStep();
      if (step) {
        return step.name;
      }
    };

    var getSubTab = function (subTab) {
      return $scope.current.subTab;
    };

    var setSubTab = function (subTab) {
      $scope.current.subTab = subTab;
      if (angular.isDefined(subTab)) {
        setStep(getSteps()[0]);
      }
    };

    var getTabs = function () {
      return $scope.tabs;
    };

    var getTab = function () {
      return $scope.current.tab;
    };

    var setTab = function (tab, subTab, stepIndex) {
      $scope.current.tab = tab;
      setSubTab(subTab);
      setStep(getSteps()[typeof stepIndex === 'undefined' ? 0 : stepIndex]);
    };

    $scope.getSubTabTitle = function () {
      var tab = getTab();
      if (tab.subTabs) {
        for (var i = 0; i < tab.subTabs.length; i++) {
          if (tab.subTabs[i].name === getSubTab()) {
            return tab.subTabs[i].title;
          }
        }
      }
    };

    $scope.getController = function ($scope) {
      var tab = getTab();
      if (tab && tab['controller']) {
        return $controller(tab['controller'], {
          $scope: $scope
        });
      }
    };

    $scope.setSubTab = function (subTab) {
      setSubTab(subTab);
    }

    $scope.setTab = function (tab, subTab, stepIndex) {
      setTab(tab, subTab, stepIndex);
    };

    $scope.previousTab = function () {
      var tabs = getTabs();
      if (angular.isArray(tabs)) {
        var tabIndex = tabs.indexOf(getTab());
        if (tabIndex > 0) {
          setTab(tabs[tabIndex - 1]);
        }
      }
    };

    $scope.nextTab = function () {
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
    };

    $scope.previousStep = function () {
      var steps = getSteps();
      if (angular.isArray(steps)) {
        var index = steps.indexOf(getStep());
        if (index > 0) {
          setStep(steps[index - 1]);
        } else if (index === 0) {
          $scope.previousTab();
        }
      }
    };

    $scope.nextStep = function () {
      new PromiseHook($scope, getStepName() + 'Next').then(function (value) {
        var steps = getSteps();
        if (angular.isArray(steps)) {
          var index = steps.indexOf(getStep());
          if (index + 1 < steps.length) {
            setStep(steps[index + 1]);
          } else if (index + 1 === steps.length) {
            $scope.nextTab();
          }
        }
      });
    };

    $scope.getRequiredTabs = function () {
      return getTabs().filter(function (tab) {
        return tab.required;
      }).map(function (tab) {
        return $translate.instant(tab.label);
      });
    };

    this.isFirstTab = function () {
      return getTabs().indexOf(getTab()) === 0;
    };

    this.isLastTab = function () {
      var tabs = getTabs();
      return tabs.indexOf(getTab()) === tabs.length - 1;
    };

    this.isFirstStep = function () {
      return getSteps().indexOf(getStep()) === 0;
    };

    this.isLastStep = function () {
      var steps = getSteps();
      return steps.indexOf(getStep()) === steps.length - 1;
    };

    this.isFirstTime = function () {
      return $scope.isFirstTime;
    };

    init();
  }
])

.directive('crWizard', [function () {
  return {
    controller: 'WizardCtrl',
    restrict: 'AE',
    scope: {
      tabs: '=',
      finish: '=',
      isFirstTime: "="
    },
    templateUrl: 'modules/core/wizard/wizard.tpl.html'
  };
}])

.directive('crWizardNav', [function () {
  return {
    require: '^crWizard',
    restrict: 'AE',
    templateUrl: 'modules/core/wizard/wizardNav.tpl.html'
  };
}])

.directive('crWizardMain', ['$compile', '$timeout', function ($compile, $timeout) {
  return {
    require: '^crWizard',
    restrict: 'AE',
    scope: true,
    templateUrl: 'modules/core/wizard/wizardMain.tpl.html',
    link: function (scope, element, attrs, wizardCtrl) {

      scope.isNotFirstStep = function () {
        return !wizardCtrl.isFirstStep();
      };

      scope.getNextText = function () {
        if (wizardCtrl.isFirstTab() && wizardCtrl.isFirstStep()) {
          return 'common.begin';
        } else if ((wizardCtrl.isLastStep() && !wizardCtrl.isFirstStep()) || (wizardCtrl.isFirstTime() && wizardCtrl.isLastTab() && wizardCtrl.isLastStep())) {
          return 'common.finish';
        } else if (wizardCtrl.isLastStep() && wizardCtrl.isFirstStep()) {
          return 'common.save';
        } else {
          return 'common.next';
        }
      };

      var cancelTabWatch, cancelStepWatch;
      var recompile = function (newValue, oldValue) {
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

      cancelTabWatch = scope.$watch('current.tab', recompile);
      cancelStepWatch = scope.$watch('current.step', recompile);
    }
  }
}]);
