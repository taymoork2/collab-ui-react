(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .service('HuntGroupService', huntGroupService);

  /* ngInject */
  function huntGroupService($q, HuntGroupServiceV2, $timeout) {

    /* jshint validthis: true */

    var service = {
      getListOfHuntGroups: getListOfHuntGroups,
      deleteHuntGroup: deleteHuntGroup
    };
    return service;

    function getListOfHuntGroups(customerId) {

      //return HuntGroupServiceV2.get({
      //  customerId: customerId
      //}).$promise;

      //Following code is used to mock back-end and will be deleted when back-end gets ready
      var successResponseData = {
        'url': '/customers/' + customerId + '/features/huntgroups',
        'items': [{
          'uuid': 'abcd1234-abcd-abcd-abcddef123456',
          'name': 'Technical Support',
          'numbers': ['3011', '4145551244'],
          'memberCount': 2
        }, {
          'uuid': 'dbcd1234-abcd-abcd-abcddef123456',
          'name': 'Groceries',
          'numbers': ['5076', '4145551244'],
          'memberCount': 81
        }, {
          'uuid': 'bbcd1234-abcd-abcd-abcddef123456',
          'name': 'Marketing Department',
          'numbers': ['5076', '(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
          'memberCount': 16
        }, {
          'uuid': 'cbcd1234-abcd-abcd-abcddef123456',
          'name': 'Sales, Billing and Customer Support',
          'numbers': ['5076'],
          'memberCount': 64
        }, {
          'uuid': 'ebcd1234-abcd-abcd-abcddef123456',
          'name': 'Billing',
          'numbers': ['13026824905'],
          'memberCount': 10
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'SalesTeam',
          'numbers': ['13026824905', '4145551244'],
          'memberCount': 100
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'SlackTeamSupport',
          'numbers': ['124456-7890', '4145551244', '4145551245'],
          'memberCount': 101
        }, {
          'uuid': 'ebcd1234-abcd-abcd-abcddef123456',
          'name': 'Billing',
          'numbers': ['5076-5078'],
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
          'uuid': 'ebcd1234-abcd-abcd-abcddef123456',
          'name': 'Billing',
          'numbers': ['5076-5078'],
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
          'uuid': 'ebcd1234-abcd-abcd-abcddef123456',
          'name': 'Billing',
          'numbers': ['5076'],
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
          'uuid': 'ebcd1234-abcd-abcd-abcddef123456',
          'name': 'Billing',
          'numbers': ['5076-5078'],
          'memberCount': 10
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'SalesTeam',
          'numbers': ['1244567890', '4145551244', '4145551245'],
          'memberCount': 100
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'SlackTeamSupport',
          'numbers': ['(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
          'memberCount': 101
        }, {
          'uuid': 'ebcd1234-abcd-abcd-abcddef123456',
          'name': 'Billing',
          'numbers': ['5076-5078'],
          'memberCount': 10
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'SalesTeam',
          'numbers': ['(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
          'memberCount': 100
        }, {
          'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
          'name': 'Technical Support',
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
        'url': '/customers/' + customerId + '/features/huntgroups',
        'items': []
      };

      var successResponse = {
        'data': successResponseData,
        //'data': emptyData,
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
      //deferred.resolve(emptyData);
      //deferred.reject(failureResponse);
      return deferred.promise;
    }

    function deleteHuntGroup(customerId, huntGroupId) {

      //return HuntGroupServiceV2.delete({
      //  customerId: customerId,
      //  huntGroupId: huntGroupId
      //}).$promise;

      // Following code is used to mock back-end
      var successResponse = {
        'status': 200,
        'statusText': 'OK'
      };
      var failureResponse = {
        'data': 'Internal Server Error',
        'status': 500,
        'statusText': 'Internal Server Error'
      };

      var deferred = $q.defer();
      $timeout(function () {
        //deferred.resolve(successResponse);
        deferred.reject(failureResponse);
      });

      return deferred.promise;

    }
  }

})();
