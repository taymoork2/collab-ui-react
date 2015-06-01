'use strict';

angular.module('Core').filter('Devices2StatusFilter', function ($filter) {
  return function (status) {
    if (status === 'Active') {
      return $filter('translate')('spacesPage.active');
    }
    if (status === 'Offline') {
      return $filter('translate')('spacesPage.offline');
    }
    if (status === 'Needs Activation') {
      return $filter('translate')('spacesPage.needsActivation');
    }
    if (status === 'Issues Detected') {
      return $filter('translate')('spacesPage.issuesDetected');
    }
  };
});
