(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .service('CallParkService', CallParkService);

  /* @ngInject */

  function CallParkService($q, CallParkServiceV2, UserServiceCommonV2, UserSearchServiceV2, NumberSearchServiceV2, Authinfo) {

    var customerId = Authinfo.getOrgId();
    var service = {
      getListOfCallParks: getListOfCallParks,
      deleteCallPark: deleteCallPark,
      saveCallPark: saveCallPark,
      updateCallPark: updateCallPark,
      getDetails: getDetails,
      getAllUnassignedNumbers: getAllUnassignedNumbers,
      getMemberInfo: getMemberInfo,
      updateMemberEmail: updateMemberEmail,
      getNumberSuggestions: getNumberSuggestions,
      getMembers: getMembers,
      suggestionsNeeded: suggestionsNeeded,
      NUMBER_FORMAT_DIRECT_LINE: "NUMBER_FORMAT_DIRECT_LINE",
      NUMBER_FORMAT_EXTENSION: "NUMBER_FORMAT_EXTENSION"
    };

    return service;

    function updateMemberEmail(user) {
      var asyncResponse = $q.defer();
      if (!user.email) {
        return getMemberInfo(customerId, user.uuid).then(function (u) {
          user.email = u.email;
        });
      } else {
        asyncResponse.resolve();
        return asyncResponse.promise;
      }
    }

    function getMembers(hint) {
      if (suggestionsNeeded(hint)) {
        var helper = getServiceHelper();
        helper.setService(UserSearchServiceV2);
        helper.setApiArgs({
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

    // function is currently not used in this milestone
    function getNumbers() {
      var helper = getServiceHelper();
      helper.setService(NumberSearchServiceV2);
      helper.setExtractData(function (data) {
        return data.numbers;
      });
      return helper;
    }

    function getNumberSuggestions(hint, assigned) {
      assigned = angular.isDefined(assigned) ? assigned : false;
      if (suggestionsNeeded(hint)) {
        var helper = getNumbers();
        helper.setApiArgs({
          number: hint,
          assigned: assigned
        });
        return helper;
      }
      return undefined;
    }

    /**
     * Returns a helper object that has a set of feeder
     * closure functions. The helper takes care of response
     * extraction, filtering, mapping and failure handling
     * inside main private method.
     */
    function getServiceHelper() {

      var asyncResult = $q.defer();
      var onFailure = '';
      var extractData = '';
      var filter = '';
      var mapping = '';
      var service = '';
      var apiArgs = '';

      var helper = {
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
        setApiArgs: function (args) {
          apiArgs = args;
          apiArgs.customerId = customerId;
        },
        fetch: function () {
          service.get(apiArgs).$promise
            .then(main)
            .catch(fail);
          return asyncResult.promise;
        }
      };
      return helper;

      ////////////

      function valid(data) {
        return (data !== '');
      }

      function fail(error) {
        if (valid(onFailure)) {
          onFailure(error);
        }
        asyncResult.resolve([]);
      }

      function main(response) {
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
      }
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
      var members = [];
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
          members = members.concat(flatArr);
        }
      });

      return members;
    }

    function suggestionsNeeded(typedText) {
      return (typedText && typedText.length >= 3);
    }

    // function will be used in future milestone
    function getListOfCallParks() {

      return CallParkServiceV2.get({
        customerId: customerId
      }).$promise;
    }

    function deleteCallPark(callParkId) {

      return CallParkServiceV2.delete({
        customerId: customerId,
        callParkId: callParkId
      }).$promise;
    }

    function saveCallPark(customerId, details) {
      return CallParkServiceV2.save({
        customerId: customerId
      }, details).$promise;
    }

    function updateCallPark(customerId, callParkId, callParkData) {
      return CallParkServiceV2.update({
        customerId: customerId,
        callParkId: callParkId
      }, callParkData).$promise;
    }

    // function will be used in a future milestone
    function getAllUnassignedNumbers() {
      var helper = getNumbers();
      helper.setApiArgs({
        number: '',
        assigned: false
      });

      return helper.fetch().then(function (nums) {
        return nums;
      });
    }

    function getDetails(customerId, callParkId) {
      return CallParkServiceV2.get({
        customerId: customerId,
        callParkId: callParkId
      }).$promise;
    }

    function getMemberInfo(customerId, userId) {
      return UserServiceCommonV2.get({
        customerId: customerId,
        userId: userId
      }).$promise;
    }
  }

})();
