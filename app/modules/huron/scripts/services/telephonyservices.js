'use strict';

angular.module('Huron')
  .factory('UnassignedLineService', function($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/unassigneddirectorynumbers?order=pattern-asc', {customerId: '@customerId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', headers: {"Authorization":'Bearer ' + Storage.get('accessToken')} }
    });
  })

  .factory('LineService', function($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers?order=pattern-asc', {customerId: '@customerId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} }
    });
  })

  .factory('RemoteDestinationService', function($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/remotedestinations/:remoteDestId', {customerId: '@customerId', userId: '@userId', remoteDestId: '@remoteDestId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', isArray:true},
      //save: {method:'POST', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} },
      //delete: {method:'DELETE', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} }

      //TODO: Remove when we start authenticating to CMI
      get: {method:'GET', isArray:true},
      update: {method: 'PUT'},
      save: {method:'POST'}
    });
  })

  .factory('UserDirectoryNumberService', function($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/directorynumbers/:directoryNumberId', {customerId: '@customerId', userId: '@userId', directoryNumberId: '@directoryNumberId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', isArray:true},
      //save: {method:'POST', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} },
      //delete: {method:'DELETE', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} }

      //TODO: Remove when we start authenticating to CMI
      get: {method:'GET', isArray:true},
      save: {method:'POST'}
    });
  })

  .factory('UserDirectoryNumberDetailService', function($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directorynumbers/:directoryNumberId', {customerId: '@customerId', directoryNumberId: '@directoryNumberId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', isArray:true},
      //save: {method:'POST', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} },
      //delete: {method:'DELETE', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} }

      //TODO: Remove when we start authenticating to CMI
      update: {method: 'PUT'},
      save: {method:'POST'}
    });
  })

  .factory('UnassignedDirectoryNumberService', function($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/unassigneddirectorynumbers', {customerId: '@customerId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', isArray:true}
      get: {method:'GET', isArray:true}
    });
  })

  .factory('UserServiceCommon', function($resource, HuronConfig){
    return $resource(HuronConfig.getCmiUrl() + '/common/customers/:customerId/users/:userId', {customerId: '@customerId', userId:'@userId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} }
      update: {method:'PUT'}
    });
  })

  .factory('UserServiceVoice', function($resource, HuronConfig){
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId', {customerId: '@customerId', userId:'@userId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} }
    });
  })

  .factory('CallParkService', function($resource, HuronConfig){
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/directedcallparks/:callParkId', {customerId: '@customerId', callParkId: '@callParkId'});
  });
