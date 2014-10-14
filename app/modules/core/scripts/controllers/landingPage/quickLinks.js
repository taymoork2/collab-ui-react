'use strict';

angular.module('Core')

.controller('QuikLinksCtrl', ['$scope',
  function($scope) {

    $scope.links = [{
      link: '#',
      text: 'Add Users'
    }, {
      link: '#',
      text: 'Install a Device for a User'
    }, {
      link: '#',
      text: 'Configure an Auto Attendant'
    }, {
      link: '#',
      text: 'Generate Device Activation Codes'
    }];
  }
]);
