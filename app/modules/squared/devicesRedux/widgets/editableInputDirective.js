'use strict';

angular
  .module('Squared')
  .controller('EditableInputController',

    /* @ngInject */
    function ($scope) {
      var currentValue;
      $scope.editorEnabled = false;
      $scope.saveInProgress = false;

      var saveSuccess = function () {
        $scope.disableEditor();
        $scope.saveInProgress = false;
      };

      var saveError = function (messages) {
        $scope.saveInProgress = false;
      };

      $scope.enableEditor = function () {
        currentValue = $scope.value;
        $scope.editorEnabled = true;
      };

      $scope.disableEditor = function () {
        $scope.editorEnabled = false;
      };

      $scope.cancelClicked = function () {
        $scope.value = currentValue;
        $scope.disableEditor();
      };

      $scope.saveClicked = function () {
        $scope.saveInProgress = true;
        $scope.save(saveSuccess, saveError);
      };

      $scope.keyPressed = function (e) {
        if (e.keyCode == 27) {
          $scope.cancelClicked();
        }
      };

      if (!_.isFunction($scope.save)) {
        throw new Error('EditableInput: Attribute "save" must be a function.');
      }
    }

  )
  .directive('sqEditableInput', [
    function () {
      return {
        scope: {
          save: '=',
          value: '='
        },
        restrict: 'E',
        controller: 'EditableInputController',
        templateUrl: 'modules/squared/devicesRedux/widgets/editableInputDirective.html'
      };
    }
  ])
  .directive('focusOn', function ($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.$watch($attr.focusOn, function (_focusVal) {
          $timeout(function () {
            var noop = _focusVal ? $element.focus() : $element.blur();
          });
        });
      }
    };
  })
  .directive('selectText', function ($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.$watch($attr.focusOn, function (_focusVal) {
          $timeout(function () {
            if (_focusVal) {
              $element.select();
            }
          });
        });
      }
    };
  });
