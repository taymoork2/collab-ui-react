(function () {
  'use strict';

  angular.module('Sunlight')
    .directive('sunlightUserProfile', sunlightUserProfile);

  function sunlightUserProfile() {
    return {
      restrict: 'EA',
      template: require('modules/sunlight/users/userOverview/sunlightUserProfile.tpl.html'),
    };
  }
})();
