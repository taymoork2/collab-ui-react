(function () {
  'use strict';

  angular
    .module('Hercules')
    .factory('HybridService', HybridService);

  /* @ngInject */
  function HybridService($q, Authinfo, ServiceDescriptor) {
    var extensionIds = ['squared-fusion-cal', 'squared-fusion-uc', 'squared-fusion-ec'];
    var entitlementNames = {
      'squared-fusion-cal': 'squaredFusionCal',
      'squared-fusion-uc': 'squaredFusionUC',
      'squared-fusion-ec': 'squaredFusionEC'
    };

    var service = {
      'getEntitledExtensions': getEntitledExtensions
    };

    return service;

    ////////////////

    // Filter out extensions that are not enabled in FMS
    function getEntitledExtensions() {
      return ServiceDescriptor.getServices()
        .then(function (services) {
          return _.chain(ServiceDescriptor.filterEnabledServices(services))
            .pluck('id')
            .value();
        }).then(function (enabledExtensions) {
          return _(extensionIds)
            .map(function (id) {
              return {
                'id': id,
                'entitlementState': '',
                'entitlementName': entitlementNames[id],
                'enabled': (_.indexOf(enabledExtensions, id) !== -1)
              };
            })
            .filter(function (extension) {
              return Authinfo.isEntitled(extension.id);
            })
            .value();
        });
    }
  }
})();
