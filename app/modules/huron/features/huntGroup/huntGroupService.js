(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .service('HuntGroupService', huntGroupService);

  /* @ngInject */

  function huntGroupService($q, HuntGroupServiceV2, UserSearchServiceV2, NumberSearchServiceV2, Authinfo, $http) {

    /* jshint validthis: true */

    var customerId = Authinfo.getOrgId();

    var service = {
      getListOfHuntGroups: getListOfHuntGroups,
      deleteHuntGroup: deleteHuntGroup,
      saveHuntGroup: saveHuntGroup,
      updateHuntGroup: updateHuntGroup,
      getDetails: getDetails,
      getNumbersWithSelection: getNumbersWithSelection,
      getMemberInfo: getMemberInfo,
      getPilotNumberSuggestions: getPilotNumberSuggestions,
      getHuntMembers: getHuntMembers
    };

    return service;

    function getHuntMembers(hint) {
      if (suggestionsNeeded(hint)) {
        var helper = getServiceHelper();
        helper.setService(UserSearchServiceV2);
        helper.fetch({
          name: hint
        });
        helper.setExtractData(function (data) {
          return data.users;
        });
        helper.setMapping(constructUserNumberMappingForUI);
        return helper;
      }
      return undefined;
    }

    function getPilotNumberSuggestions(hint) {
      if (suggestionsNeeded(hint)) {
        var helper = getServiceHelper();
        helper.setService(NumberSearchServiceV2);
        helper.fetch({
          number: hint,
          assigned: false
        });
        helper.setExtractData(function (data) {
          return data.numbers;
        });
        return helper;
      }
      return undefined;
    }

    /**
     * Returns a helper object that has a set of feeder
     * closure functions. The helper takes care of response
     * extraction, filtering, mapping and failure handling
     * in a generic manner.
     */
    function getServiceHelper() {

      var asyncResult = $q.defer();
      var onFailure = '';
      var extractData = '';
      var filter = '';
      var mapping = '';
      var service = '';

      var valid = function (data) {
        return (data !== '');
      };

      var fail = function (error) {
        if (valid(onFailure)) {
          onFailure(error);
        }
        asyncResult.resolve([]);
      };

      var main = function (response) {
        var data = '';

        if (valid(extractData)) {
          data = extractData(response);
        }

        if (valid(filter)) {
          data = filterData(data);
        }

        if (valid(mapping)) {
          data = mapping(data);
        }

        asyncResult.resolve(data);

        function filterData(rArray) {
          var sKey = filter.sourceKey;
          var sArray = filter.dataToStrip;
          var rKey = filter.responseKey;

          var sArrayMapped = sArray.map(function (e) {
            return e[sKey];
          });
          return rArray.filter(function (rItem) {
            return (sArrayMapped.indexOf(rItem[rKey]) === -1);
          });
        }
      };

      return {
        setOnFailure: function (callback) {
          onFailure = callback;
        },
        setExtractData: function (callback) {
          extractData = callback;
        },
        setFilter: function (filterConfig) {
          filter = filterConfig;
        },
        setMapping: function (map) {
          mapping = map;
        },
        setService: function (s) {
          service = s;
        },
        fetch: function (apiArgs) {
          apiArgs.customerId = customerId;
          service.get(apiArgs).$promise
            .then(main)
            .catch(fail);
        },
        result: function () {
          return asyncResult.promise;
        }
      };
    }

    /**
     * The array returned by this function is directly used as entries for
     * member lookup type-ahead control. The tree structure received from the
     * backend is flattened to a table structure, so that it becomes a UI
     * friendly data modal for the type-ahead. Obviously, there is some data
     * duplication due to this. However, the keyboard accessibility benefits
     * we get due to this outweighs the data duplication cost.
     *
     * Before:
     * =======
     * user ---+--> number0
     *         |
     *         +--> number1
     *
     * After:
     * =======
     * user ------> number0
     *
     * user ------> number1
     *
     * $item = {
     *   displayUser:       [flag that is enabled only for the first selectableNumber
     *                       of the user]
     *   selectableNumber:  a number of the user that could be selected.
     *   user:              [the user object]
     *   uuid:              [uuid of the user to help in filtering]
     * }
     *
     * If a user has 2 number lines, there will be 2 $items in the array with
     * displayUser flag enabled for the first line alone.
     */
    function constructUserNumberMappingForUI(users) {
      var huntMembers = [];
      users.map(function (user) {
        var flatArr = user.numbers.map(function (number) {
          return {
            displayUser: false,
            selectableNumber: number,
            user: user,
            uuid: user.uuid
          };
        });

        if (flatArr.length > 0) {
          flatArr[0].displayUser = true;
          huntMembers = huntMembers.concat(flatArr);
        }
      });

      return huntMembers;
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

    function saveHuntGroup(customerId, details) {
      return HuntGroupServiceV2.save({
        customerId: customerId
      }, details).$promise;

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
      //  //deferred.resolve(successResponse);
      //  deferred.reject(failureResponse);
      // }, 3000);

      // return deferred.promise;
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

    function getDetails(customerId, huntGroupId) {

      return HuntGroupServiceV2.get({
        customerId: customerId,
        huntGroupId: huntGroupId
      }).$promise;
    }

    function getMemberInfo(customerId, userId) {
      // TODO: Replace UserSearchServiceV2 with UserServiceCommonV2 when ready.
      return UserSearchServiceV2.get({
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
