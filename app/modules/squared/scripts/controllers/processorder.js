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
      $scope.isProcessing = true;

      Orgservice.createOrg($scope.accountId, $scope.adminEmail, $scope.orderId, function (data, status) {
        $scope.isProcessing = false;
        if (data.success === true) {
          if ($scope.isPartner === 'true') {
            redirectUrl = Config.getAdminPortalUrl();
          } else {
            redirectUrl = data.passwordResetUrl;
          }
          $window.location.href = redirectUrl;
        } else {
          if (status === 409) {
            redirectUrl = Config.getAdminPortalUrl();
            $window.location.href = redirectUrl;
          } else {
            $scope.message = $translate.instant('processOrderPage.errOrgCreation', {
              orderId: $scope.orderId
            });
            $('#processOrderErrorModal').modal('show');
          }
        }
      });
    }

  ]);
