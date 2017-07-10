(function () {
  'use strict';

  angular.module('Core')
    .controller('WizardFinishCtrl', WizardFinishCtrl);

  /* @ngInject */
  function WizardFinishCtrl($q, $scope, $translate, Notification, SetupWizardService) {
    $scope.sendEmailModel = false;
    $scope.initNext = function () {
      var deferred = $q.defer();
      if (!_.isUndefined($scope.wizard) && _.isFunction($scope.wizard.getRequiredTabs)) {
        var required = $scope.wizard.getRequiredTabs();
        if (_.isArray(required) && required.length > 0) {
          var errors = [];
          for (var i = 0; i < required.length; i++) {
            errors.push($translate.instant('firstTimeWizard.completeRequired', {
              name: required[i],
            }));
          }
          Notification.notify(errors, 'error');
          deferred.reject();
        }
      }
      deferred.resolve();
      return deferred.promise;
    };

    $scope.hasPendingLicenses = function () {
      return !_.isEmpty(SetupWizardService.pendingMeetingLicenses);
    };
  }
})();
