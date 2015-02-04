'use strict';

angular.module('Core')
  .controller('FirstTimeWizardCtrl', ['$scope', '$translate', 'Authinfo', '$state', 'Orgservice', 'Log',
    function ($scope, $translate, Authinfo, $state, Orgservice, Log) {
      $scope.greeting = $translate.instant('index.greeting', {
        name: Authinfo.getUserName()
      });

      $scope.finish = function () {
        Orgservice.setSetupDone().then(function () {
          Authinfo.setSetupDone(true);
        }).finally(function () {
          $state.go('overview');
        });
      };
    }
  ]);
