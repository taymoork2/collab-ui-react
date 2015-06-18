'use strict';

angular
  .module('Squared')
  .controller('LoaderButtonController',

    /* @ngInject */
    function ($scope, $attrs) {

      $scope.buttonClicked = function () {
        $scope.loading = true;
        $scope.click(function () {
          $scope.loading = false;
        });
      };

      if (!_.isFunction($scope.click)) {
        throw new Error('LoaderButton: Attribute "click" must be a function.');
      }

      // not sure why i need to do this...
      $scope.class = $attrs.class;
    }

  )
  .directive('sqLoaderButton', [
    function () {
      return {
        scope: {
          click: '=',
          ngDisabled: '=',
        },
        transclude: true,
        restrict: 'E',
        controller: 'LoaderButtonController',
        templateUrl: 'modules/squared/devicesRedux/widgets/loaderButtonDirective.html'
      };
    }
  ]);
