(function () {
  'use strict';

  var LazyResource = require('modules/core/scripts/services/lazyResource').default;

  module.exports = angular
    .module('huron.resources', [
      require('angular-resource'),
      require('modules/huron/telephony/telephonyConfig'),
    ])
    // Temporary email service for Huron add user email.  This will be removed when the squared/huron emails are integrated
    .factory('HuronEmailService', HuronEmailService)
    .factory('ActivationCodeEmailService', ActivationCodeEmailService)
    .factory('DidAddEmailService', DidAddEmailService)
    .factory('IdentityOTPService', IdentityOTPService)
    .factory('LineResource', LineService)
    .factory('RemoteDestinationService', RemoteDestinationService)
    .factory('UserDirectoryNumberService', UserDirectoryNumberService)
    .factory('DirectoryNumberService', DirectoryNumberService)
    .factory('CustomerCommonService', CustomerCommonService)
    .factory('UserServiceCommon', UserServiceCommon)
    .factory('UserServiceCommonV2', UserServiceCommonV2)
    .factory('UserSearchServiceV2', UserSearchServiceV2)
    .factory('UserNumberService', UserNumberService)
    .factory('BlfInternalExtValidation', BlfInternalExtValidation)
    .factory('BlfURIValidation', BlfURIValidation)
    .factory('NumberSearchServiceV2', NumberSearchServiceV2)
    .factory('AssignAutoAttendantService', AssignAutoAttendantService)
    .factory('UserServiceVoice', UserServiceVoice)
    .factory('VoicemailService', VoicemailService)
    .factory('VoicemailTimezoneService', VoicemailTimezoneService)
    .factory('VoicemailMessageActionService', VoicemailMessageActionService)
    .factory('CompanyNumberService', CompanyNumberService)
    .factory('SimultaneousCallsServiceV2', SimultaneousCallsServiceV2)
    .factory('InternalNumberPoolService', InternalNumberPoolService)
    .factory('ExternalNumberPoolService', ExternalNumberPoolService)
    .factory('AlternateNumberService', AlternateNumberService)
    .factory('DirectoryNumberCopyService', DirectoryNumberCopyService)
    .factory('SiteService', SiteService)
    .factory('AvrilSiteService', AvrilSiteService)
    .factory('AvrilSiteUpdateService', AvrilSiteUpdateService)
    .factory('UserEndpointService', UserEndpointService)
    .factory('SipEndpointService', SipEndpointService)
    .factory('DirectoryNumberUserService', DirectoryNumberUserService)
    .factory('DirectoryNumberSipEndPointService', DirectoryNumberSipEndPointService)
    .factory('SipEndpointDirectoryNumberService', SipEndpointDirectoryNumberService)
    .factory('MediaManagerService', MediaManagerService)
    .factory('DeviceLogApiService', DeviceLogApiService)
    .factory('UserLineAssociationService', UserLineAssociationService)
    .factory('UserLineAssociationCountService', UserLineAssociationCountService)
    .factory('CustomerVoiceCmiService', CustomerVoiceCmiService)
    .factory('DialPlanCmiService', DialPlanCmiService)
    .factory('DialPlanDetailsCmiService', DialPlanDetailsCmiService)
    .factory('UserCosRestrictionServiceV2', UserCosRestrictionServiceV2)
    .factory('CustomerCosRestrictionServiceV2', CustomerCosRestrictionServiceV2)
    .factory('PlacesService', PlacesService)
    .name;

  /* @ngInject */
  function HuronEmailService($resource, HuronConfig) {
    return $resource(HuronConfig.getEmailUrl() + '/email/userwelcome', {}, {});
  }

  /* @ngInject */
  function ActivationCodeEmailService($resource, HuronConfig) {
    return $resource(HuronConfig.getEmailUrl() + '/email/activationcode', {}, {});
  }

  /* @ngInject */
  function DidAddEmailService($resource, HuronConfig) {
    return $resource(HuronConfig.getEmailUrl() + '/email/didadd', {}, {});
  }

  /* @ngInject */
  function IdentityOTPService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/identity/users/otp', {}, {});
  }

  /* @ngInject */
  function LineService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers?order=pattern-asc', {
      customerId: '@customerId',
    }, {});
  }

  /* @ngInject */
  function RemoteDestinationService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/remotedestinations/:remoteDestId', {
      customerId: '@customerId',
      userId: '@userId',
      remoteDestId: '@remoteDestId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function UserDirectoryNumberService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/directorynumbers/:directoryNumberId', {
      customerId: '@customerId',
      userId: '@userId',
      directoryNumberId: '@directoryNumberId',
    });
  }

  /* @ngInject */
  function DirectoryNumberService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId', {
      customerId: '@customerId',
      directoryNumberId: '@directoryNumberId',
    });
  }

  /* @ngInject */
  function CustomerCommonService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getCmiUrl() + '/common/customers/:customerId';
    }, {
      customerId: '@customerId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function UserServiceCommon($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/common/customers/:customerId/users/:userId', {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function UserServiceCommonV2($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId', {}, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function UserNumberService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId/numbers');
  }

  /* @ngInject */
  function BlfInternalExtValidation($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/validate/internalextension', {
      customerId: '@customerId',
      value: '@internalNumber',
    });
  }

  /* @ngInject */
  function BlfURIValidation($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/validate/uri', {
      customerId: '@customerId',
      value: '@uri',
    });
  }

  /* @ngInject */
  function UserSearchServiceV2($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId', {
      customerId: '@customerId',
      name: '@name',
      userId: '@userId',
    });
  }

  /* @ngInject */
  function NumberSearchServiceV2($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getCmiV2Url() + '/customers/:customerId/numbers';
    }, {
      customerId: '@customerId',
      number: '@number',
      assigned: '@assigned',
    });
  }

  /* @ngInject */
  function AssignAutoAttendantService($resource, HuronConfig) {
    var baseUrl = HuronConfig.getCmiV2Url();
    return $resource(baseUrl + '/customers/:customerId/features/autoattendants/:cesId/numbers', {
      customerId: '@customerId',
      cesId: '@cesId',
    }, {
      get: {
        method: 'GET',
        transformResponse: transformEnvelope,
      },
      update: {
        method: 'PUT',
      },
      delete: {
        method: 'DELETE',
      },
    });
  }

  /* @ngInject */
  function UserServiceVoice($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId', {
      customerId: '@customerId',
      userId: '@userId',
    }, {
      query: {
        method: 'GET',
        isArray: false,
      },
    });
  }

  /* @ngInject */
  function VoicemailService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voicemail/customers/:customerId', {
      customerId: '@customerId',
    });
  }

  /* @ngInject */
  function VoicemailTimezoneService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voicemail/customers/:customerId/usertemplates/:objectId', {
      customerId: '@customerId',
      objectId: '@objectId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function VoicemailMessageActionService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voicemail/customers/:customerId/usertemplates/:userTemplateId/messageactions/:messageActionId', {
      customerId: '@customerId',
      userTemplateId: '@userTemplateId',
      messageActionId: '@messageActionId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function CompanyNumberService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/companynumbers/:companyNumberId', {
      customerId: '@customerId',
      companyNumberId: '@companyNumberId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function InternalNumberPoolService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/internalnumberpools/:internalNumberId', {
      customerId: '@customerId',
      internalNumberId: '@internalNumberId',
    });
  }

  /* @ngInject */
  function ExternalNumberPoolService($resource, HuronConfig) {
    return LazyResource($resource, function () {
      return HuronConfig.getCmiUrl() + '/voice/customers/:customerId/externalnumberpools/:externalNumberId';
    }, {
      customerId: '@customerId',
      externalNumberId: '@externalNumberId',
    });
  }

  /* @ngInject */
  function AlternateNumberService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId/alternatenumbers/:alternateNumberId', {
      customerId: '@customerId',
      directoryNumberId: '@directoryNumberId',
      alternateNumberId: '@alternateNumberId',
    }, {
      update: {
        method: 'PUT',
      },
      save: {
        method: 'POST',
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
      },
    });
  }

  /* @ngInject */
  function DirectoryNumberCopyService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/copy/:ultId', {
      customerId: '@customerId',
      ultId: '@ultId',
    }, {
      query: {
        method: 'GET',
        isArray: false,
      },
      save: {
        method: 'POST',
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
      },
    });
  }

  /* @ngInject */
  function SiteService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sites/:siteId', {
      customerId: '@customerId',
      siteId: '@siteId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function AvrilSiteService($resource, HuronConfig) {
    return $resource(HuronConfig.getAvrilUrl() + '/customers/:customerId/sites/', {
      customerId: '@customerId',
    }, {
      save: {
        method: 'POST',
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
      },
    });
  }

  /* @ngInject */
  function AvrilSiteUpdateService($resource, HuronConfig) {
    return $resource(HuronConfig.getAvrilUrl() + '/customers/:customerId/sites/:siteId', {
      customerId: '@customerId',
      siteId: '@siteId',
    }, {
      update: {
        method: 'PUT',
      },
      get: {
        method: 'GET',
      },
    });
  }

  /* @ngInject */
  function UserEndpointService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/endpoints/:userEndpointAssnId', {
      customerId: '@customerId',
      userId: '@userId',
      userEndpointAssnId: '@userEndpointAssnId',
    });
  }

  /* @ngInject */
  function SipEndpointService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sipendpoints/:sipEndpointId', {
      customerId: '@customerId',
      sipEndpointId: '@sipEndpointId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function DirectoryNumberUserService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId/users/:dnUserAssnId', {
      customerId: '@customerId',
      directoryNumberId: '@directoryNumberId',
      dnUserAssnId: '@dnUserAssnId',
    });
  }

  /* @ngInject */
  function DirectoryNumberSipEndPointService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId/sipendpoints/:endpointDnAssnId', {
      customerId: '@customerId',
      sipendpointId: '@directoryNumberId',
      endpointDnAssnId: '@endpointDnAssnId',
    });
  }

  /* @ngInject */
  function SipEndpointDirectoryNumberService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sipendpoints/:sipendpointId/directorynumbers/:endpointDnAssnId', {
      customerId: '@customerId',
      sipendpointId: '@sipendpointId',
      endpointDnAssnId: '@endpointDnAssnId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function MediaManagerService($resource, HuronConfig) {
    return $resource(HuronConfig.getMmsUrl() + '/organizations/:orgId/mohPrompts', {
      orgId: '@orgId',
    }, {
      get: {
        method: 'GET',
        isArray: true,
      },
      save: {
        method: 'POST',
        headers: {
          'Access-Control-Expose-Headers': 'Location',
        },
      },
    });
  }

  /* @ngInject */
  function DeviceLogApiService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/users/:userId/phones/:sipEndpointId/commands/logs', {}, {});
  }

  /* @ngInject */
  function UserLineAssociationService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/userlineassociations', {
      customerId: '@customerId',
    });
  }

  /* @ngInject */
  function UserLineAssociationCountService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/userlineassociationcounts', {
      customerId: '@customerId',
    });
  }

  /* @ngInject */
  function CustomerVoiceCmiService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId', {
      customerId: '@customerId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }

  /* @ngInject */
  function DialPlanCmiService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/clusters/:clusterId/dialplans/:dialPlanId', {
      clusterId: '@clusterId',
      dialPlanId: '@dialPlanId',
    });
  }

  /* @ngInject */
  function DialPlanDetailsCmiService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/clusters/:clusterId/dialplandetails/:dialPlanId', {
      clusterId: '@clusterId',
      dialPlanId: '@dialPlanId',
    });
  }

  /* @ngInject */
  function UserCosRestrictionServiceV2($resource, HuronConfig) {
    var baseUrl = HuronConfig.getCmiV2Url();
    return $resource(baseUrl + '/customers/:customerId/users/:userId/features/restrictions/:restrictionId', {
      customerId: '@customerId',
      userId: '@userId',
      restrictionId: '@restrictionId',
    }, {
      update: {
        method: 'PUT',
      },
      get: {
        method: 'GET',
        transformResponse: transformEnvelope,
      },
    });
  }

  /* @ngInject */
  function SimultaneousCallsServiceV2($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/places/:placesId/numbers/:numberId', {
      customerId: '@customerId',
      numberId: '@numberId',
      placesId: '@placesId',
    }, {
      update: {
        method: 'PUT',
      },
      get: {
        method: 'GET',
      },
    });
  }

  /* @ngInject */
  function CustomerCosRestrictionServiceV2($resource, HuronConfig) {
    var baseUrl = HuronConfig.getCmiV2Url();
    return $resource(baseUrl + '/customers/:customerId/features/restrictions/:restrictionId', {
      customerId: '@customerId',
      restrictionId: '@restrictionId',
    }, {
      get: {
        method: 'GET',
        transformResponse: transformEnvelope,
      },
      update: {
        method: 'PUT',
      },
    });
  }

  function transformEnvelope(response) {
    var responseObj = _.isString(response) ? JSON.parse(response) : response;
    return _.get(responseObj, '[0]', responseObj);
  }

  /* @ngInject */
  function PlacesService($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiV2Url() + '/customers/:customerId/places/:placesId', {
      customerId: '@customerId',
      placesId: '@placesId',
    }, {
      update: {
        method: 'PUT',
      },
    });
  }
})();
