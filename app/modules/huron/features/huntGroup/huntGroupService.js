(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .service('HuntGroupService', huntGroupService);

  /* ngInject */
  function huntGroupService($http, $q, Config) {

    /* jshint validthis: true */

    var service = {
      getListOfHuntGroups: getListOfHuntGroups,
      deleteHuntGroup: deleteHuntGroup
    };
    return service;

    /*
     TODO: When Back-End gets ready
     1. Get the service Url's from Config
     2. Make rest calls to Back-end and return the data
     3. Remove the mocked calls to back-end
     */

    function getListOfHuntGroups(customerId) {

      //return $http.get('https://huron.com/api/v2/customers/' + customerId + '/features/huntgroups/)
      var successResponseData = {
        'url': 'https://huron.com/api/v2/customers/123/features/huntgroups',
        'items': [{
          'uuid': 'abcd1234-abcd-abcd-abcddef123456',
          'name': 'Technical Support',
          'numbers': ['5076', '(414) 555-1244'],
          'memberCount': 2
        }, {
          'uuid': 'bbcd1234-abcd-abcd-abcddef123456',
          'name': 'Marketing',
          'numbers': ['5076', '(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
          'memberCount': 16
        }, {
          'uuid': 'cbcd1234-abcd-abcd-abcddef123456',
          'name': 'Sales',
          'numbers': ['5076'],
          'memberCount': 64
        }, {
          'uuid': 'dbcd1234-abcd-abcd-abcddef123456',
          'name': 'Groceries',
          'numbers': ['5076', '(127) 456-7890'],
          'memberCount': 81
        }, {
          'uuid': 'ebcd1234-abcd-abcd-abcddef123456',
          'name': 'Billing',
          'numbers': ['5076', '5078'],
          'memberCount': 10
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'SalesTeam',
          'numbers': ['(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
          'memberCount': 100
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'SlackTeamSupport',
          'numbers': ['(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
          'memberCount': 101
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'CarProblems',
          'numbers': ['(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
          'memberCount': 101
        }]
      };

      var emptyData = {
        'url': 'https://huron.com/api/v2/customers/123/features/huntgroups',
        'items': []
      };

      var successResponse = {
        'data': successResponseData,
        'status': 200,
        'statusText': 'OK'
      };
      var failureResponse = {
        'data': 'Internal Server Error',
        'status': 500,
        'statusText': 'Internal Server Error'
      };

      var deferred = $q.defer();
      deferred.resolve(successResponse);
      //deferred.reject(failureResponse);
      return deferred.promise;
    }

    function deleteHuntGroup(customerId, huntGroupId) {
      //return $http.delete('https://huron.com/api/v2/customers/' + customerId + '/features/huntgroups/' + huntGroupId)
      var successResponse = {
        'status': 200,
        'statusText': 'OK'
      };
      var failureResponse = {
        'data': 'Internal Server Error',
        'status': 500,
        'statusText': 'Internal Server Error'
      };

      //returning deferred promise untill back-ends gets ready
      var deferred = $q.defer();
      deferred.resolve(successResponse);
      //deferred.reject(failureResponse);
      return deferred.promise;
    }
  }

})();
