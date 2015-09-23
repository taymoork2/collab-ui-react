/**
 * Created by sundravi on 17/08/15.
 */
(function () {
  'use strict';
  angular.module('Sunlight')
    .directive('sunlightUserChannels', sunlightUserChannels);

  function sunlightUserChannels() {
    return {
      restrict: 'EA',
      templateUrl: 'modules/sunlight/users/userOverview/sunlightUserChannels.tpl.html',
    };
  }
})
();
