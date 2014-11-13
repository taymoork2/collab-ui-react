'use strict';

angular.module('Core')
  .controller('FirstTimeWizardCtrl', ['$scope', '$translate', 'Authinfo', '$state', 'Orgservice', 'Log', 'Notification',
    function ($scope, $translate, Authinfo, $state, Orgservice, Log, Notification) {
      $scope.greeting = $translate.instant('index.greeting', {
        name: Authinfo.getUserName()
      });

      $scope.finish = function () {
        Orgservice.setSetupDone(function (data, status) {
          if (data.success) {
            Log.debug('Setup done successfully. Status: ' + status);
          } else {
            Log.debug('Failed to set setupDone for org. Status: ' + status);
          }
        });
        $state.go('home');
      };
    }
  ]);
