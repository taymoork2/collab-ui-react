(function () {
  'use strict';
  angular
    .module('uc.autoattendant')
    .factory('AATrackChangeService', AATrackChangeService);

  /* @ngInject */
  function AATrackChangeService() {
    var trackStore = {

    };

    //////////

    return {
      track: track,
      isChanged: isChanged
    };

    function track(key, value) {
      trackStore[key] = value;
    }

    function isChanged(key, value) {
      if (angular.isDefined(trackStore[key])) {
        return !angular.equals(trackStore[key], value);
      }

      if (value) {
        return true;
      }

      return false;
    }
  }
})();
