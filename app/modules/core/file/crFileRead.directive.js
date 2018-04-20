(function () {
  'use strict';

  angular.module('Core')
    .directive('crFileRead', fileRead);

  var md5 = require('js-md5');
  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function fileRead($window) {
    var directive = {
      restrict: 'A',
      scope: {
        file: '=',
        fileName: '=',
        fileSize: '=?',
        fileChecksum: '=?',
        fileReadStatus: '&',
        fileReadSuccess: '&',
        fileReadFailure: '&',
        fileTypeError: '&',
        fileMaxSizeError: '&',
        readingStrategy: '@',
      },
      link: link,
    };

    return directive;

    function link(scope, element, attrs) {
      element.on('change', onChange);
      element.on('click', onClick);
      if (attrs.id) {
        $('label[for="' + attrs.id + '"]').on('keydown', onKeydown); // does not register keydown events on the element otherwise
      }

      function checkSize(size) {
        if (_.isUndefined(attrs.fileMaxSize) || (size / 1024) / 1024 < attrs.fileMaxSize) {
          return true;
        } else {
          if (_.isFunction(scope.fileMaxSizeError)) {
            scope.fileMaxSizeError();
          }
          return false;
        }
      }

      function isTypeValid(type, name) {
        if (_.isUndefined(attrs.fileType) || (type && attrs.fileType.indexOf(type) > -1)) {
          return true;
        } else {
          if (isSuffixValid(name)) {
            return true;
          } else if (_.isFunction(scope.fileTypeError)) {
            scope.fileTypeError();
          }
          return false;
        }
      }

      function isSuffixValid(name) {
        if (_.isString(name)) {
          var nameParts = name.split('.');
          var suffix = nameParts[nameParts.length - 1];
          if (attrs.fileSuffix && attrs.fileSuffix.indexOf(suffix) > -1) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      }

      function onChange(changeEvent) {
        var reader = new $window.FileReader();
        var file = changeEvent.target.files[0];
        var name = file.name;
        var type = file.type;
        var size = file.size;
        reader.onloadstart = onLoadStart;
        reader.onprogress = progress;
        reader.onload = onLoad;
        reader.onerror = onError;
        if (scope.readingStrategy === 'dataURL') {
          reader.readAsDataURL(file);
        } else if (scope.readingStrategy === 'arrayBuffer') {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsText(file);
        }

        function onLoadStart() {
          if (_.isFunction(scope.fileReadStatus)) {
            scope.fileReadStatus({
              filename: name,
              filesize: size,
              percentComplete: 0,
            });
            scope.$apply();
          }
        }

        function progress(loadEvent) {
          if (_.isFunction(scope.fileReadStatus)) {
            scope.fileReadStatus({
              filename: name,
              filesize: size,
              percentComplete: (loadEvent.loaded / loadEvent.total) * 100,
            });
            scope.$apply();
          }
        }

        function onLoad(loadEvent) {
          if (checkSize(size) && isTypeValid(type, name)) {
            scope.$apply(function () {
              scope.file = loadEvent.target.result;
              scope.fileName = name;
              if (!_.isUndefined(attrs.fileSize)) {
                scope.fileSize = size;
              }
              if (!_.isUndefined(attrs.fileChecksum)) {
                scope.fileChecksum = md5(loadEvent.target.result);
              }
            });
            if (_.isFunction(scope.fileReadSuccess)) {
              scope.fileReadSuccess({
                file: scope.file,
                filename: scope.fileName,
                filesize: scope.fileSize,
                checksum: scope.fileChecksum,
              });
            }
          }
        }

        function onError() {
          if (_.isFunction(scope.fileReadFailure)) {
            scope.fileReadFailure();
          }
        }
      }

      function onClick() {
        element.val('');
      }

      function onKeydown($event) {
        switch ($event.which) {
          case KeyCodes.ENTER:
          case KeyCodes.SPACE:
            element.click(); // just calling the onClick function here does not work; the element itself must receive an actual click
            break;
        }
      }
    }
  }
})();
