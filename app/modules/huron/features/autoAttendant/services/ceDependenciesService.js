(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('CeDependenciesService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/dependencies', {
        customerId: '@customerId'
      }, {
        'update': {
          method: 'PUT',
          isArray: false
        }
      });
    });
})();
