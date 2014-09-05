'use strict';

angular.module('Core')
  .controller('MainCtrl', ['$scope', '$window',
    function ($scope, $window) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];

      $scope.rating = 5;
      $scope.saveRatingToServer = function(rating) {
        $window.alert('Rating selected - ' + rating);
      };
    }
  ]);
