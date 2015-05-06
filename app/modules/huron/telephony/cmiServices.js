(function () {
  'use strict';

  angular
    .module('Huron')

  // Temporary email service for Huron add user email.  This will be removed when the squared/huron emails are integrated
  .factory('HuronEmailService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getEmailUrl() + '/email/userwelcome', {}, {});
  })

  .factory('ActivationCodeEmailService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getEmailUrl() + '/email/activationcode', {}, {});
  })

  .factory('DidAddEmailService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getEmailUrl() + '/email/didadd', {}, {});
  })

  .factory('IdentityOTPService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/identity/users/otp', {}, {});
  })

  .factory('UserOTPService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/common/customers/:customerId/users/:userId/otp', {
      customerId: '@customerId',
      userId: "@userId"
    }, {});
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

  .factory('CustomerCommonService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/common/customers/:customerId');
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
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sites/:siteId', {
      customerId: '@customerId',
      siteId: '@siteId'
    });
  })

  .factory('InternalNumberRangeService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/internalnumberranges/:internalNumberRangeId', {
      customerId: '@customerId',
      internalNumberRangeId: '@internalNumberRangeId'
    }, {
      save: {
        method: 'POST',
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      }
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
      query: {
        method: 'GET',
        isArray: false
      },
      update: {
        method: 'PUT'
      }
    });
  })

  .factory('DirectoryNumberUserService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId/users/:dnUserAssnId', {
      customerId: '@customerId',
      directoryNumberId: '@directoryNumberId',
      dnUserAssnId: '@dnUserAssnId'
    });
  })

  .factory('DirectoryNumberSipEndPointService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId/sipendpoints/:endpointDnAssnId', {
      customerId: '@customerId',
      sipendpointId: '@directoryNumberId',
      endpointDnAssnId: '@endpointDnAssnId'
    });
  })

  .factory('SipEndpointDirectoryNumberService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sipendpoints/:sipendpointId/directorynumbers/:endpointDnAssnId', {
      customerId: '@customerId',
      sipendpointId: '@sipendpointId',
      endpointDnAssnId: '@endpointDnAssnId'
    });
  })

  .factory('TimeZoneService', function ($resource) {
    return $resource('modules/huron/serviceSetup/timeZones.json', {}, {});
  });

})();
