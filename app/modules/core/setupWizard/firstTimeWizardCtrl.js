'use strict';

angular.module('Core')
  .controller('FirstTimeWizardCtrl', ['$scope', '$translate', 'Authinfo', '$state',
    function ($scope, $translate, Authinfo, $state) {
      $scope.greeting = $translate.instant('index.greeting', {
        name: Authinfo.getUserName()
      });

      $scope.finish = function () {
        $state.go('home');
      };
    }
  ]);
