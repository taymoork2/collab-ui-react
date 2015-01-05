(function () {
  'use strict';

  angular
    .module('Huron')

  // Temporary email service for Huron add user email.  This will be removed when the squared/huron emails are integrated
  .factory('HuronEmailService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getEmailUrl() + '/email/userwelcome', {}, {});
  })

  .factory('IdentityOTPService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/identity/users/otp', {}, {});
  })

  .factory('LineService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers?order=pattern-asc', {
      customerId: '@customerId'
    }, {});
  })

  .factory('RemoteDestinationService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/remotedestinations/:remoteDestId', {
      customerId: '@customerId',
      userId: '@userId',
      remoteDestId: '@remoteDestId'
    }, {
      update: {
        method: 'PUT'
      }
    });
  })

  .factory('UnassignedDirectoryNumberService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/unassigneddirectorynumbers', {
      customerId: '@customerId'
    });
  })

  .factory('UserDirectoryNumberService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/directorynumbers/:directoryNumberId', {
      customerId: '@customerId',
      userId: '@userId',
      directoryNumberId: '@directoryNumberId'
    });
  })

  .factory('DirectoryNumberService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId', {
      customerId: '@customerId',
      directoryNumberId: '@directoryNumberId'
    }, {
      update: {
        method: 'PUT'
      }
    });
  })

  .factory('UserServiceCommon', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/common/customers/:customerId/users/:userId', {}, {
      update: {
        method: 'PUT'
      }
    });
  })

  .factory('UserServiceVoice', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId', {
      customerId: '@customerId',
      userId: '@userId'
    });
  })

  .factory('CallParkService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directedcallparks/:callParkId', {
      customerId: '@customerId',
      callParkId: '@callParkId'
    });
  })

  .factory('InternalNumberPoolService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/internalnumberpools/:internalNumberId', {
      customerId: '@customerId',
      internalNumberId: '@internalNumberId'
    });
  })

  .factory('ExternalNumberPoolService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/externalnumberpools/:externalNumberId', {
      customerId: '@customerId',
      externalNumberId: '@externalNumberId'
    });
  })

  .factory('AlternateNumberService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId/alternatenumbers/:alternateNumberId', {
      customerId: '@customerId',
      directoryNumberId: '@directoryNumberId',
      alternateNumberId: '@alternateNumberId'
    }, {
      update: {
        method: 'PUT'
      },
      save: {
        method: 'POST',
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      }
    });
  })

  .factory('DirectoryNumberCopyService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/copy/:ultId', {
      customerId: '@customerId',
      ultId: '@ultId'
    }, {
      query: {
        method: 'GET',
        isArray: false
      },
      save: {
        method: 'POST',
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      }
    });
  })

  .factory('SiteService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sites', {
      customerId: '@customerId'
    });
  })

  .factory('InternalNumberRangeService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/internalnumberranges/:internalNumberRangeId', {
      customerId: '@customerId',
      internalNumberRangeId: '@internalNumberRangeId'
    });
  })

  .factory('UserEndpointService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/endpoints/:userEndpointAssnId', {
      customerId: '@customerId',
      userId: '@userId',
      userEndpointAssnId: '@userEndpointAssnId'
    });
  })

  .factory('SipEndpointService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sipendpoints/:sipEndpointId', {
      customerId: '@customerId',
      sipEndpointId: '@sipEndpointId'
    }, {
      update: {
        method: 'PUT'
      }
    });
  })
})();
