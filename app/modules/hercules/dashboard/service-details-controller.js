'use strict';

angular.module('Hercules')
  .controller('ServiceDetailsController',

    /* @ngInject */
    function ($scope, $rootScope, $state, $stateParams, ConnectorService) {
      $scope.service = $stateParams.service;
    }

  );
