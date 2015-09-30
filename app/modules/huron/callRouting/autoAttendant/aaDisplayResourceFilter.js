'use strict';

angular.module('uc.autoattendant')
  .filter('DisplayPreferredResource', function () {
    return function (resources) {
      if (!angular.isArray(resources) || angular.isUndefined(resources[0])) {
        return "";
      }

      // todo: priority for display is (1) E164 number, (2) extension, (3) from another AA

      return resources[0].getNumber();
    };
  })
  .filter('DisplayMoreResource', function () {
    return function (resources) {
      if (!angular.isArray(resources) || angular.isUndefined(resources[0])) {
        return "";
      }

      if (resources.length > 1) {
        return "+" + (resources.length - 1) + " more";
      }

      return "";
    };
  })
  .filter('DisplayAllResource', function () {
    return function (resources) {
      if (!angular.isArray(resources) || angular.isUndefined(resources[0])) {
        return "";
      }

      if (resources.length > 0) {

        //todo: return all resources formatted

        return "All";
      }

      return "";
    };
  });
