(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAMetricNameService', AAMetricNameService);

  function AAMetricNameService() {
    var prefix = 'aa.';
    var service = {
      CREATE_AA: prefix + 'createAA',
      TIMEOUT_PHONE_MENU: prefix + 'timeout.phoneMenu',
      TIMEOUT_DIAL_BY_EXT: prefix + 'timeout.dialByExt',
      IMPORT_SCHEDULE_FEATURE: prefix + 'import.schedule',
      UI_NOTIFICATION: prefix + 'ui.' + 'notification',
    };
    return service;
  }
})();
