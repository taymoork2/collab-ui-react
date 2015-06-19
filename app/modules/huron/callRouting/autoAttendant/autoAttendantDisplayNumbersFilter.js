'use strict';

angular.module('uc.autoattendant').filter('DisplayNumbers', function () {
  return function (resources) {
    if (!angular.isArray(resources) || angular.isUndefined(resources[0])) {
      return "";
    }

    if (resources.length > 1) {
      return resources[0].getNumber() + "\n...";
    } else {
      return resources[0].getNumber();
    }
  };
});
