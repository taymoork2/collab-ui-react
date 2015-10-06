'use strict';

(function () {

  /* @ngInject */
  function EmailSettingsService() {

    function read() {}

    function write() {}

    return {
      read: read,
      write: write
    };
  }

  angular.module('Hercules')
    .service('EmailSettingsService', EmailSettingsService);
}());
