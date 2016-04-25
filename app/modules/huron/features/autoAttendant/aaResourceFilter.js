(function() {
  'use strict';

  angular.module('uc.autoattendant')
    .filter('preferredAAResource', function () {
      return function (ceInfo) {
        if (angular.isUndefined(ceInfo)) {
          return "";
        }
        var resources = ceInfo.getResources();
        if (!angular.isArray(resources) || angular.isUndefined(resources[0])) {
          return "";
        }
        // todo: priority for display is (1) E164 number, (2) extension, (3) from another AA
        // for now returns first number
        return resources[0].getNumber();
      };
    })
    .filter('moreAAResources', function ($translate) {
      return function (ceInfo) {
        if (angular.isUndefined(ceInfo)) {
          return "";
        }
        var resources = ceInfo.getResources();
        if (!angular.isArray(resources) || angular.isUndefined(resources[0])) {
          return "";
        }

        if (resources.length > 1) {

          return $translate.instant('autoAttendant.resourceCountPlusMore', {
            count: resources.length - 1
          });
        }

        return "";
      };
    })
    .filter('allAAResources', function () {
      return function (ceInfo) {
        if (angular.isUndefined(ceInfo)) {
          return "";
        }
        var resources = ceInfo.getResources();
        if (!angular.isArray(resources) || angular.isUndefined(resources[0])) {
          return "";
        }

        if (resources.length > 0) {
          var resourcesHtml = resources.join('<br>');
          return resourcesHtml;
        }

        return "";
      };
    });
})();