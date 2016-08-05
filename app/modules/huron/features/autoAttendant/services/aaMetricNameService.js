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
      BUILDER_PAGE: prefix + 'builder',
      UI_HELP: prefix + 'help',
      UI_NOTIFICATION: prefix + 'notification',
      TIME_ZONE: prefix + 'timezone'
    };
    return service;
  }
})();
