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

  .factory('UserDirectoryNumberService', function($resource, HuronConfig) {
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId/userdirectorynumberassociations/:directoryNumberId', {customerId: '@customerId', userId: '@userId', directoryNumberId: '@directoryNumberId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', isArray:true},
      //save: {method:'POST', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} },
      //delete: {method:'DELETE', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} }

      //TODO: Remove when we start authenticating to CMI
      get: {method:'GET', isArray:true},
      save: {method:'POST'}
    });
  })

  .factory('UserServiceVoice', function($resource, HuronConfig){
    return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/users/:userId', {customerId: '@customerId', userId:'@userId'}, {
      //TODO: Uncomment when we start authenticating to CMI
      //get: {method:'GET', headers: {"Authorization":'Bearer ' + Storage.get('accessToken'))} }
    });
  });
