(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .service('HuntGroupService', huntGroupService);

  /* @ngInject */

  function huntGroupService($q, HuntGroupServiceV2, UserSearchServiceV2, NumberSearchServiceV2, Authinfo, $http) {

    /* jshint validthis: true */

    var feature;
    var customerId = Authinfo.getOrgId();
    var service = {
      getListOfHuntGroups: getListOfHuntGroups,
      deleteHuntGroup: deleteHuntGroup,
      updateHuntGroup: updateHuntGroup,
      editFeature: editFeature,
      getDetails: getDetails,
      getNumbersWithSelection: getNumbersWithSelection,
      getMemberInfo: getMemberInfo,
      getPilotNumberSuggestions: suggestionForTypeAhead,
      getHuntMembers: suggestionForTypeAhead
    };

    return service;

    function suggestionForTypeAhead(filterKey, filterValue, itemsInUI, onFailure) {
      var suggestions = $q.defer();

      if (suggestionsNeeded(filterValue)) {
        var apiArgs = {};
        apiArgs[filterKey] = filterValue;
        var service = inferServiceByFilter(filterKey);
        if (service) {
          return fetchSuggestionsFromService(service, apiArgs, itemsInUI,
            onFailure, suggestions);
        }
      }

      suggestions.resolve([]);
      return suggestions.promise;
    }

    function inferServiceByFilter(filterKey) {
      var service = {};

      if (filterKey === 'number') {
        service.resource = NumberSearchServiceV2;
        service.extractItems = function (response) {
          return response.numbers;
        };
      } else if (filterKey === 'name') {
        // TODO: Replace UserSearchServiceV2 with UserServiceCommonV2 when ready.
        service.resource = UserSearchServiceV2;
        service.extractItems = function (response) {
          return addIsSelectedFlagToNumbers(response.users);
        };
      } else {
        service = undefined;
      }

      return service;
    }

    function addIsSelectedFlagToNumbers(users) {
      return users.map(function (u) {
        u.numbers.map(function(n) {
          n.isSelected = false;
          return n;
        });
        return u;
      });
    }

    function fetchSuggestionsFromService(service, apiArgs, itemsInUI, onFailure, suggestions) {
      apiArgs.customerId = customerId;
      var uuidInUI = itemsInUI.map(function (e) {
        return e.uuid;
      });

      service.resource.get(apiArgs).$promise
        .then(suggest)
        .catch(suggestNothingAndNotifyFailure);

      return suggestions.promise;

      function suggest(response) {
        var itemsFromBackend = service.extractItems(response);
        var suggestedItems = itemsFromBackend.filter(function (backendItem) {
          return (uuidInUI.indexOf(backendItem.uuid) === -1);
        });
        suggestions.resolve(suggestedItems);
      }

      function suggestNothingAndNotifyFailure(response) {
        suggestions.resolve([]);
        onFailure(response);
      }
    }

    function suggestionsNeeded(typedText) {
      return (typedText.length >= 3);
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
      // TODO: Replace UserSearchServiceV2 with UserServiceCommonV2 when ready.
      return UserSearchServiceV2.get({
        customerId: customerId,
        userId: userId
      }).$promise;

      //return UserServiceCommonV2.get({
      //  customerId: customerId,
      //  userId: userId
      //}).$promise;

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
