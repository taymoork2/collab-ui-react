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
    return $resource(HuronConfig.getCmiUrl() + '/common/customers/:customerId', {
      customerId: '@customerId'
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

  .factory('UserServiceCommonV2', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId', {}, {
      update: {
        method: 'PUT'
      }
    });
  })

  .factory('UserSearchServiceV2', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId', {
      customerId: '@customerId',
      name: '@name',
      userId: '@userId',
    });
  })

  .factory('NumberSearchServiceV2', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/numbers', {
      customerId: '@customerId',
      number: '@number',
      assigned: '@assigned'
    });
  })

  .factory('HuntGroupServiceV2', function ($resource, HuronConfig) {
    var baseUrl = HuronConfig.getCmiV2Url();
    return $resource(baseUrl + '/customers/:customerId/features/huntgroups/:huntGroupId', {
      customerId: '@customerId',
      huntGroupId: '@huntGroupId'
    }, {
      update: {
        method: 'PUT'
      },
      delete: {
        method: 'DELETE'
      }
    });
  })

  .factory('AssignAutoAttendantService', function ($resource, HuronConfig) {
    var baseUrl = HuronConfig.getCmiV2Url();
    return $resource(baseUrl + '/customers/:customerId/features/autoattendants/:cesId/numbers', {
      customerId: '@customerId',
      cesId: '@cesId'
    }, {
      get: {
        method: 'GET',
        transformResponse: function (data) {
          return transformEnvelope(data);
        }
      },
      update: {
        method: 'PUT'
      },
      delete: {
        method: 'DELETE'
      }
    });
  })

  .factory('UserServiceVoice', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId', {
      customerId: '@customerId',
      userId: '@userId'
    }, {
      query: {
        method: 'GET',
        isArray: false
      }
    });
  })

  .factory('VoicemailTimezoneService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voicemail/customers/:customerId/usertemplates/:objectId', {
      customerId: '@customerId',
      objectId: '@objectId'
    }, {
      update: {
        method: 'PUT'
      }
    });
  })

  .factory('VoicemailService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voicemail/customers/:customerId', {
      customerId: '@customerId'
    });
  })

  .factory('CompanyNumberService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/companynumbers/:companyNumberId', {
      customerId: '@customerId',
      companyNumberId: '@companyNumberId'
    }, {
      update: {
        method: 'PUT'
      }
    });
  })

  // Will remove this service later
  .factory('CallRouterService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/companynumbers/:companyNumberId', {
      customerId: '@customerId',
      companyNumberId: '@companyNumberId'
    }, {
      update: {
        method: 'PUT'
      }
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
    }, {
      update: {
        method: 'PUT'
      }
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
    }, {
      update: {
        method: 'PUT'
      }
    });
  })

  .factory('TimeZoneService', function ($resource) {
    return $resource('modules/huron/serviceSetup/timeZones.json', {}, {});
  })

  .factory('HermesQRCodeService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getEmailUrl() + '/:getqrima/encoded', {
      getqrima: 'getqrimage',
      oneTimePassword: '@oneTimePassword'
    }, {});
  })

  .factory('DeviceLogApiService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId/phones/:sipEndpointId/commands/logs', {}, {});
  })

  .factory('UserLineAssociationService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/userlineassociations', {
      customerId: '@customerId'
    });
  })

  .factory('UserLineAssociationCountService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/userlineassociationcounts', {
      customerId: '@customerId'
    });
  })

  .factory('CustomerVoiceCmiService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId', {
      customerId: '@customerId'
    }, {
      update: {
        method: 'PUT'
      }
    });
  })

  .factory('DialPlanCmiService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/clusters/:clusterId/dialplans/:dialPlanId', {
      clusterId: '@clusterId',
      dialPlanId: '@dialPlanId'
    });
  })

  .factory('DialPlanDetailsCmiService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/clusters/:clusterId/dialplandetails/:dialPlanId', {
      clusterId: '@clusterId',
      dialPlanId: '@dialPlanId'
    });
  })

  .factory('UserCosRestrictionServiceV2', function ($resource, HuronConfig) {
    var baseUrl = HuronConfig.getCmiV2Url();
    return $resource(baseUrl + '/customers/:customerId/users/:userId/features/restrictions/:restrictionId', {
      customerId: '@customerId',
      userId: '@userId',
      restrictionId: '@restrictionId'
    }, {
      update: {
        method: 'PUT'
      },
      get: {
        method: 'GET',
        transformResponse: function (data, headers) {
          return transformEnvelope(data);
        }
      }
    });
  })

  .factory('CustomerCosRestrictionServiceV2', function ($resource, HuronConfig) {
    var baseUrl = HuronConfig.getCmiV2Url();
    return $resource(baseUrl + '/customers/:customerId/features/restrictions/:restrictionId', {
      customerId: '@customerId',
      restrictionId: '@restrictionId'
    }, {
      get: {
        method: 'GET',
        transformResponse: function (data) {
          return transformEnvelope(data);
        }
      }
    });
  });

  function transformEnvelope(response) {
    var responseObj = angular.fromJson(response);
    return _.get(responseObj, '[0]', responseObj);
  }

})();
