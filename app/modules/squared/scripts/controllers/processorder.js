'use strict';

/**
 * @ngdoc function
 * @name wx2AdminWebClientApp.controller:ProcessorderCtrl
 * @description
 * # ProcessorderCtrl
 * Controller of the wx2AdminWebClientApp
 */
angular.module('Squared')
  .controller('ProcessorderCtrl', ['$scope', '$location', '$window', 'Log', 'Orgservice', 'Notification', '$translate', 'Config',
    function ($scope, $location, $window, Log, Orgservice, Notification, $translate, Config) {

      $scope.accountId = $location.search().accountId;
      $scope.adminEmail = $location.search().adminEmail;
      $scope.isPartner = $location.search().isPartner;
      $scope.orderId = $location.search().orderId;
      var redirectUrl;

      Orgservice.createOrg($scope.accountId, $scope.adminEmail, function (data, status) {
        if (data.success === true) {
          if ($scope.isPartner) {
            redirectUrl = Config.getAdminPortalUrl();
          } else {
            redirectUrl = data.passwordResetUrl;
          }
        } else {
          if (status === 409) {
            redirectUrl = Config.getAdminPortalUrl();
          } else {
            Notification.notify([$translate.instant('processOrderPage.errOrgCreation', {
              orderId: $scope.orderId
            })], 'error');
          }
        }
        $window.location.href = redirectUrl;
      });
    }

  ]);
