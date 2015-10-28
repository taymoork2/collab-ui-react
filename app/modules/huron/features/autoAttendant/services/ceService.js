(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('CeService', function ($resource, HuronConfig) {
      return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/callExperiences/:ceId', {
        customerId: '@customerId',
        ceId: '@ceId'
      }, {
        'update': {
          method: 'PUT',
          isArray: false
        }
      });
    });
})();
