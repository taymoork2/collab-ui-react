(function () {
  'use strict';

  angular.module('uc.cdrlogsupport', [])
    .directive('ucFileRead', ucFileRead);

  /* @ngInject */
  function ucFileRead($window) {
    var directive = {
      restrict: 'A',
      scope: {
        file: '=',
        fileName: '=',
        fileMaxSizeError: '&',
        fileTypeError: '&',
      },
      link: link,
    };

    return directive;

    function link(scope, element, attrs) {
      function checkSize(size) {
        if (_.isUndefined(attrs.fileMaxSize) || (size / 1024) / 1024 < attrs.fileMaxSize) {
          return true;
        } else if (_.isFunction(scope.fileMaxSizeError)) {
          scope.fileMaxSizeError();
        }
        return false;
      }

      function isTypeValid(type, name) {
        if (_.isUndefined(attrs.fileType) || (type && attrs.fileType.indexOf(type) > -1) || isSuffixValid(name)) {
          return true;
        } else if (_.isFunction(scope.fileTypeError)) {
          scope.fileTypeError();
        }
        return false;
      }

      function isSuffixValid(name) {
        if (_.isString(name)) {
          var nameParts = name.split('.');
          var suffix = nameParts[nameParts.length - 1];
          if (attrs.fileSuffix && attrs.fileSuffix.indexOf(suffix) > -1) {
            return true;
          }
        }
        return false;
      }

      element.on('change', function (changeEvent) {
        var reader = new $window.FileReader();
        var file = changeEvent.target.files[0];
        var name = file.name;
        var type = file.type;
        var size = file.size;

        if (checkSize(size) && isTypeValid(type, name)) {
          reader.onload = function (loadEvent) {
            scope.$apply(function () {
              scope.file = loadEvent.target.result;
              scope.fileName = name;
            });
          };
          reader.readAsText(file);
        }
      });

      element.on('click', function () {
        element.val('');
        scope.file = undefined;
        scope.fileName = undefined;
      });
    }

  }

})();
