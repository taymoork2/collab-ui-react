(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .service('HuntGroupService', huntGroupService);

  /* @ngInject */

  function huntGroupService($q, HuntGroupServiceV2, UserServiceCommonV2, NumberSearchServiceV2, TelephoneNumberService, Authinfo, $http) {

    /* jshint validthis: true */

    var feature;

    var service = {
      getListOfHuntGroups: getListOfHuntGroups,
      deleteHuntGroup: deleteHuntGroup,
      getPilotNumberSuggestions: getPilotNumberSuggestions,
      updateHuntGroup: updateHuntGroup,
      editFeature: editFeature,
      getDetails: getDetails,
      getNumbersWithSelection: getNumbersWithSelection,
      getMemberInfo: getMemberInfo
    };

    return service;

    function getPilotNumberSuggestions(typedNumber, selections, onFailure) {
      var suggestions = $q.defer();

      if (suggestionsNeeded(typedNumber)) {
        return fetchSuggestionsFromService(typedNumber, selections, onFailure, suggestions);
      }

      suggestions.resolve([]);
      return suggestions.promise;
    }

    function fetchSuggestionsFromService(typedNumber, selections, onFailure, suggestions) {

      NumberSearchServiceV2.get({
        customerId: Authinfo.getOrgId(),
        number: typedNumber
      }).$promise.then(function handleResponse(response) {
        suggestions.resolve(
          filterSelected(formatNumbers(response.numbers), selections));
      }).catch(function (response) {
        suggestions.resolve([]);
        onFailure(response);
      });

      return suggestions.promise;
    }

    function formatNumbers(numbers) {
      return numbers.map(function (n) {
        n.number = TelephoneNumberService.getDIDLabel(n.number);
        return n;
      });
    }

    function suggestionsNeeded(typedNumber) {
      return (typedNumber.length >= 3);
    }

    function filterSelected(fromList, selected) {
      return fromList.filter(function (n) {
        return (selected.indexOf(n.number) === -1);
      });
    }

    function getListOfHuntGroups(customerId) {

      return HuntGroupServiceV2.get({
        customerId: customerId
      }).$promise;

      //Following code is used to mock back-end and will be deleted when back-end gets ready
      //   var successResponseData = {
      //     'url': '/customers/' + customerId + '/features/huntgroups',
      //     'items': [{
      //       'uuid': 'abcd1234-abcd-abcd-abcddef123456',
      //       'name': 'Technical Support',
      //       'numbers': ['3011', '(414) 555-1244'],
      //       'memberCount': 2
      //     }, {
      //       'uuid': 'dbcd1234-abcd-abcd-abcddef123456',
      //       'name': 'Groceries',
      //       'numbers': ['5076', '(127) 456-7890'],
      //       'memberCount': 81
      //     }, {
      //       'uuid': 'bbcd1234-abcd-abcd-abcddef123456',
      //       'name': 'Marketing Department',
      //       'numbers': ['5076', '(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
      //       'memberCount': 16
      //     }, {
      //       'uuid': 'cbcd1234-abcd-abcd-abcddef123456',
      //       'name': 'Sales, Billing and Customer Support',
      //       'numbers': ['5076'],
      //       'memberCount': 64
      //     }, {
      //       'uuid': 'ebcd1234-abcd-abcd-abcddef123456',
      //       'name': 'Billing',
      //       'numbers': ['5076-5078'],
      //       'memberCount': 10
      //     }, {
      //       'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
      //       'name': 'SalesTeam',
      //       'numbers': ['(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
      //       'memberCount': 100
      //     }, {
      //       'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
      //       'name': 'SlackTeamSupport',
      //       'numbers': ['(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
      //       'memberCount': 101
      //     }, {
      //       'uuid': 'fbcd1234-abcd-abcd-abcddef123456',
      //       'name': 'CarProblems',
      //       'numbers': ['(124) 456-7890', '(414) 555-1244', '(414) 555-1245'],
      //       'memberCount': 101
      //     }]
      //   };

      //   var emptyData = {
      //     'url': '/customers/' + customerId + '/features/huntgroups',
      //     'items': []
      //   };

      //   var successResponse = {
      //     'data': successResponseData,
      //     //'data': emptyData,
      //     'status': 200,
      //     'statusText': 'OK'
      //   };
      //   var failureResponse = {
      //     'data': 'Internal Server Error',
      //     'status': 500,
      //     'statusText': 'Internal Server Error'
      //   };

      //   var deferred = $q.defer();
      //   deferred.resolve(successResponse);
      //   //deferred.resolve(emptyData);
      //   //deferred.reject(failureResponse);
      //   return deferred.promise;
    }

    function deleteHuntGroup(customerId, huntGroupId) {

      return HuntGroupServiceV2.delete({
        customerId: customerId,
        huntGroupId: huntGroupId
      }).$promise;

      //Following code is used to mock back-end
      //   var successResponse = {
      //     'status': 200,
      //     'statusText': 'OK'
      //   };
      //   var failureResponse = {
      //     'data': 'Internal Server Error',
      //     'status': 500,
      //     'statusText': 'Internal Server Error'
      //   };

      //   var deferred = $q.defer();
      //   $timeout(function () {
      //     deferred.resolve(successResponse);
      //     //deferred.reject(failureResponse);
      //   }, 0);

      //   return deferred.promise;

    }

    function updateHuntGroup(customerId, details) {
      return HuntGroupServiceV2.update({
        customerId: customerId
      }).$promise;

      // Following code is used to mock back-end
      // var successResponse = {
      //  'status': 200,
      //  'statusText': 'OK'
      // };
      // var failureResponse = {
      //  'data': 'Internal Server Error',
      //  'status': 500,
      //  'statusText': 'Internal Server Error'
      // };

      // var deferred = $q.defer();
      // $timeout(function () {
      //  deferred.resolve(successResponse);
      //  //deferred.reject(failureResponse);
      // }, 3000);

      // return deferred.promise;
    }

    function editFeature(_feature) {
      feature = _feature;
    }

    function getNumbersWithSelection(numbers) {
      var deferred = $q.defer();

      $http.get('https://mock-hg.de-ams.thunderhead.io/api/v2/customers/fb7d9045-921f-4628-ba60-f46d45c04c6d/numbers?secret=sunlight').then(function (data) {
        data.data.numbers.forEach(function (value, index) {
          value.isSelected = false;
          numbers.forEach(function (value1, index1) {
            if (value.number === value1.number) {
              value.isSelected = true;
            }
            if (index === data.data.numbers.length - 1 && index1 === numbers.length - 1) {
              deferred.resolve(data.data.numbers);
            }
          });
        });

      });
      return deferred.promise;
    }

    function getDetails(customerId) {
      var deferred = $q.defer();
      if (feature) {

        return HuntGroupServiceV2.get({
          customerId: customerId,
          huntGroupId: feature.huntGroupId
        }).$promise;

        // var successResponse = {
        //   "name": "Technical Difficulties",
        //   "numbers": [{
        //     "number": "972-405-2102"
        //   }, {
        //     "number": "972-405-2103"
        //   }],
        //   "huntMethod": "longest-idle",
        //   "maxRingSecs": 30,
        //   "maxWaitMins": 40,
        //   "fallbackDestination": {
        //     "number": "8177777777",
        //     "numberUuid": "2342-2342-23423-234898",
        //     "userName": "bspence",
        //     "userUuid": "97898-86823-34545-234234",
        //     "sendToVoicemail": true
        //   },
        //   "members": [{
        //     "userName": "Brian Spence",
        //     "userUuid": "97898-86823-34545-234234",
        //     "number": "8177777777",
        //     "numberUuid": "2342-2342-23423-234898"
        //   }, {
        //     "userName": "Sam Williams",
        //     "userUuid": "97898-86823-34545-234235",
        //     "number": "8166666666",
        //     "numberUuid": "2342-2342-23423-234899"
        //   }]
        // };

        // var failureResponse = {
        //   'data': 'Internal Server Error',
        //   'status': 500,
        //   'statusText': 'Internal Server Error'
        // };

        // $timeout(function () {
        //   deferred.resolve(successResponse);
        //   //deferred.reject(failureResponse);
        // }, 3000);

      } else {
        deferred.reject('error');
      }
      return deferred.promise;
    }

    function getMemberInfo(customerId, userId) {
      return UserServiceCommonV2.get({
        customerId: customerId,
        userId: userId
      }).$promise;

      // var deferred = $q.defer();
      // var successResponse = {
      //   "userName": "bspence@cisco.com",
      //   "numbers": [{
      //     "internal": "8177777777",
      //     "external": "222",
      //     "uuid": "2342-2342-23423-234898"
      //   }, {
      //     "internal": "222211",
      //     "external": "222",
      //     "uuid": "2344-4444-4444-44444"
      //   }]
      // };

      // var failureResponse = {
      //   'data': 'Internal Server Error',
      //   'status': 500,
      //   'statusText': 'Internal Server Error'
      // };

      // $timeout(function () {
      //   deferred.resolve(successResponse);
      //   //deferred.reject(failureResponse);
      // }, 3000);

      // return deferred.promise;

    }
  }

})();
