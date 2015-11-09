'use strict';

angular.module('Core')
  .controller('CustomersCtrl', ['$scope', 'Authinfo',
    function ($scope, Authinfo) {
      $scope.orgName = Authinfo.getOrgName();
    }
  ]);
