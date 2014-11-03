'use strict';

angular.module('Huron')
  .factory('UnassignedLineService', function ($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/unassigneddirectorynumbers?order=pattern-asc', {
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
    get: {
      method: 'GET',
      isArray: true
    },
    update: {
      method: 'PUT'
    },
    save: {
      method: 'POST'
    }
  });
})

.factory('UserDirectoryNumberService', function ($resource, HuronConfig) {
  return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/directorynumbers/:directoryNumberId', {
    customerId: '@customerId',
    userId: '@userId',
    directoryNumberId: '@directoryNumberId'
  }, {
    get: {
      method: 'GET',
      isArray: true
    }
  });
})

.factory('UserDirectoryNumberDetailService', function ($resource, HuronConfig) {
  return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId', {
    customerId: '@customerId',
    directoryNumberId: '@directoryNumberId'
  }, {
    update: {
      method: 'PUT'
    },
    save: {
      method: 'POST'
    }
  });
})

.factory('UnassignedDirectoryNumberService', function ($resource, HuronConfig) {
  return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/unassigneddirectorynumbers', {
    customerId: '@customerId'
  }, {
    get: {
      method: 'GET',
      isArray: true
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
  }, {});
})

.factory('CallParkService', function ($resource, HuronConfig) {
  return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directedcallparks/:callParkId', {
    customerId: '@customerId',
    callParkId: '@callParkId'
  });
});
