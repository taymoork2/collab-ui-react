(function() {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaBuilderNameEdit', aaBuilderNameEdit);

  /* @ngInject */
  function aaBuilderNameEdit($sce) {
    return {
      require: '?ngModel',
      scope: {
        aaMaxLength: '@',
        aaNameFocus: '='
      },
      restrict: 'E',
      link: function (scope, element, attrs, ngModel) {
        var len;
        var keyCode_backspace = 8;
        var keyCode_delete = 46;
        var keyCode_leftarrow = 37;
        var keyCode_uparrow = 38;
        var keyCode_rightarrow = 39;
        var keyCode_downarrow = 49;
        var keyCode_enter = 13;

        var allowKeySet = [keyCode_backspace, keyCode_delete, keyCode_leftarrow, keyCode_uparrow, keyCode_rightarrow, keyCode_downarrow];

        var notAllowKeySet = [keyCode_enter];

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

        if (angular.isDefined(scope.aaMaxLength)) {
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
          if (angular.isDefined(len) && (text.length >= len)) {
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
      }
    };
  }
})();