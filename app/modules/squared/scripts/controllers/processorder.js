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

      $scope.enc = $location.search().enc;
      $scope.isProcessing = true;

      Orgservice.createOrg($scope.enc, function (data, status) {
        $scope.isProcessing = false;
        if (data.success) {
          $window.location.href = data.redirectUrl;
        } else {
          $('#processOrderErrorModal').modal('show');
        }
      });
    }

  ]);
