(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAMetricNameService', AAMetricNameService);

  function AAMetricNameService() {
    var prefix = 'aa.';
    var service = {
      CREATE_AA: prefix + 'create',
      TIMEOUT_PHONE_MENU: prefix + 'timeout.phoneMenu',
      TIMEOUT_DIAL_BY_EXT: prefix + 'timeout.dialByExt'
    };

    return service;
  }
})();
