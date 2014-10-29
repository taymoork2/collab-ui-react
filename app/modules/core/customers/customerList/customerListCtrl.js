'use strict';

/* global $ */

angular.module('Core')
  .controller('CustomersCtrl', ['$rootScope','$scope', 'Log', 'Authinfo', 'Notification',
    function($rootScope, $scope, Log, Authinfo, Notification) {

      //Initialize
      Notification.init($scope);
      $scope.popup = Notification.popup;
      $scope.orgName = Authinfo.getOrgName();




    }
  ]);