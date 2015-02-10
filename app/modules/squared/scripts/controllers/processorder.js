'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:ProcessorderCtrl
 * @description
 * # CreateOrgCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('ProcessorderCtrl', ['$scope', '$location', '$window', 'Log', 'Orgservice', 'Notification',
    function ($scope, $location, $window, Log, Orgservice, Notification) {

      $scope.accountId = $location.search().accountId;
      $scope.adminEmail = $location.search().adminEmail;

      $scope.createOrg = function (accountId, adminEmail, device) {
        angular.element('#createOrgButton').button('loading');
        Orgservice.createOrg(accountId, adminEmail, function (data, status) {
          angular.element('#createOrgButton').button('reset');
          if (data.success === true) {
            var redirectUrl = data.passwordResetUrl;
            $window.location.href = redirectUrl;
          } else {
            var errorMessage = ['Error creating org for accountId ' + accountId + '. Status: ' + status];
            Notification.notify(errorMessage, 'error');
          }
        });
      };
    }

  ]);
