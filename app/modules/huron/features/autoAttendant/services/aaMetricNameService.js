(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAMetricNameService', AAMetricNameService);

  function AAMetricNameService() {
    var prefix = 'aa.';
    var service = {
      CREATE_AA: prefix + 'create'
    };

    return service;
  }
})();
