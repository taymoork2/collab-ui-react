(function () {
  'use strict';

  /* @ngInject */
  function EditableInputController($scope) {
    $scope.editorEnabled = false;
    $scope.saveInProgress = false;

    var saveSuccess = function () {
      $scope.ngModel = $scope.newText;
      $scope.disableEditor();
      $scope.saveInProgress = false;
    };

    var saveError = function () {
      $scope.saveInProgress = false;
    };

    $scope.enableEditor = function () {
      $scope.newText = angular.copy($scope.ngModel);
      $scope.editorEnabled = true;
    };

    $scope.disableEditor = function () {
      $scope.editorEnabled = false;
    };

    $scope.saveClicked = function () {
      $scope.saveInProgress = true;

      var promise = $scope.sqSave({
        newText: $scope.newText
      });

      if (!promise || !promise.then) {
        throw new Error('Save must evaluate to a promise');
      }

      promise.then(saveSuccess, saveError);
    };

    $scope.keyPressed = function (e) {
      if (e.keyCode == 27) {
        $scope.disableEditor();
      }
    };
  }

  angular
    .module('Squared')
    .directive('sqEditableInput', sqEditableInput)
    .directive('focusOn', focusOn)
    .directive('selectText', selectText);

  /* @ngInject */
  function sqEditableInput() {
    return {
      scope: {
        sqSave: '&',
        ngModel: '='
      },
      restrict: 'E',
      controller: EditableInputController,
      templateUrl: 'modules/squared/devices/widgets/editableInputDirective.html'
    };
  }

  /* @ngInject */
  function focusOn($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.$watch($attr.focusOn, function (_focusVal) {
          $timeout(function () {
            if (_focusVal) {
              $element.focus();
            }
          }, 500);
        });
      }
    };
  }

  /* @ngInject */
  function selectText($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attr) {
        $scope.$watch($attr.selectText, function (_focusVal) {
          $timeout(function () {
            if (_focusVal) {
              $element.select();
            }
          });
        });
      }
    };
  }
}());
