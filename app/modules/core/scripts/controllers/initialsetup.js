(function() {
  'use strict';

  angular.module('Core')
    .controller('InitialSetupCtrl', InitialSetupCtrl);

  /* @ngInject */
  function InitialSetupCtrl($scope, $location) {

    var allNavs = ['accountreview', 'adduser'];

    $scope.showNav = function (thisNav) {
      $location.path('/initialsetup/' + thisNav);
    };

    $scope.$watch(function () {
      return $location.path();
    }, function () {
      var curPath = $location.path();
      var thisNav = curPath.split('/')[2];
      for (var navNum in allNavs) {
        var nav = allNavs[navNum];
        if (nav !== thisNav) {
          $('#' + nav + 'Tab').removeClass('tabHighlight');
        } else {
          $('#' + nav + 'Tab').addClass('tabHighlight');
        }
      }
    });

  }
})();