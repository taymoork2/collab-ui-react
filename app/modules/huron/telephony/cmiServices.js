'use strict';

angular.module('Huron')
  .factory('UnassignedLineService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/internalnumberpools?order=pattern-asc', {
      customerId: '@customerId'
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

.factory('UserDirectoryNumberService', function ($resource, HuronConfig) {
  return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/directorynumbers/:directoryNumberId', {
    customerId: '@customerId',
    userId: '@userId',
    directoryNumberId: '@directoryNumberId'
  });
})

.factory('UserDirectoryNumberDetailService', function ($resource, HuronConfig) {
  return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId', {
    customerId: '@customerId',
    directoryNumberId: '@directoryNumberId'
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
  });
})

.factory('DirectoryNumberCopyService', function ($resource, HuronConfig) {
  return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/copy/:ultId', {
    customerId: '@customerId',
    itemId: '@ultId'
  });
});
