'use strict';

angular.module('Core')

.controller('QuikLinksCtrl', ['$scope', 'Authinfo',
  function($scope, Authinfo) {

    var isPageActive = function(name) {
      return Authinfo.isAllowedState(name);
    };

    $scope.links = [{
      link: '#/users/add',
      text: 'Add Users',
      show: isPageActive('users')
    }, {
      link: '#',
      text: 'Install a Device for a User',
      show: false
    }, {
      link: '#/spaces',
      text: 'Install a Devices into a Shared Space',
      show: isPageActive('spaces')
    }, {
      link: '#',
      text: 'Configure an Auto Attendant',
      show: false
    }, {
      link: '#/support',
      text: 'Search device logs',
      show: isPageActive('support')
    }];

  }
]);