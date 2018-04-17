(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaBuilderNameEdit', aaBuilderNameEdit);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function aaBuilderNameEdit() {
    return {
      require: '?ngModel',
      scope: {
        aaMaxLength: '@',
        aaNameFocus: '=',
      },
      restrict: 'E',
      link: function (scope, element, attrs, ngModel) {
        var len;
        var allowKeySet = [KeyCodes.BACKSPACE, KeyCodes.DELETE, KeyCodes.LEFT, KeyCodes.UP, KeyCodes.RIGHT, KeyCodes.DOWN];
        var notAllowKeySet = [KeyCodes.ENTER];

        /////////////////////

        function isKeyInList(key, list) {
          for (var i = 0; i < list.length; i++) {
            if (key === list[i]) {
              return true;
            }
          }
          return false;
        }

        function read() {
          var text = element.text();
          ngModel.$setViewValue(text);
        }

        if (!ngModel) return;

        if (!_.isUndefined(scope.aaMaxLength)) {
          len = Number(scope.aaMaxLength);
        }

        element.attr('spellcheck', 'false');
        element.attr('contenteditable', 'true');

        ngModel.$render = function () {
          element.text(ngModel.$viewValue || '');
        };

        scope.$watch('aaNameFocus', function (value) {
          if (value === true) {
            element[0].focus();
          }
        });

        element.on('keydown', function (e) {
          var text = element.text();
          // If unsupported key input is seen (such as carriage-return), do nothing
          if (isKeyInList(e.keyCode, notAllowKeySet)) {
            e.preventDefault();
          }
          // when input length limit is reached, do not accept
          // any more key input, except arrow keys, delete key and backspace
          if (!_.isUndefined(len) && (text.length >= len)) {
            if (!isKeyInList(e.keyCode, allowKeySet)) {
              e.preventDefault();
            }
          }
        });

        element.on('keyup change', function () {
          scope.$evalAsync(read);
        });

        element.on('blur', function () {
          scope.$evalAsync(read);
          scope.aaNameFocus = false;
        });

        ngModel.$render();
      },
    };
  }
})();
