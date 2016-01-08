(function () {
  'use strict';

  angular
    .module('Core')
    .factory('HttpUtils', HttpUtils);

  /* @ngInject */
  function HttpUtils($q, $http, Utils) {

    return {
      setTrackingID: function () {
        return $q.when($http.defaults.headers.common.TrackingID = 'ATLAS_' + Utils.getUUID());
      },

      unsetTrackingID: function () {
        return $q.when($http.defaults.headers.common.TrackingID = undefined);
      }
    };
  }
})();
