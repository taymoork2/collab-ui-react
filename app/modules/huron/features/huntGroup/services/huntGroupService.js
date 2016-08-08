(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .service('HuntGroupService', huntGroupService);

  /* @ngInject */

  function huntGroupService($q, HuntGroupServiceV2, UserServiceCommonV2, UserSearchServiceV2, NumberSearchServiceV2, Authinfo) {

    var customerId = Authinfo.getOrgId();
    var service = {
      getListOfHuntGroups: getListOfHuntGroups,
      deleteHuntGroup: deleteHuntGroup,
      saveHuntGroup: saveHuntGroup,
      updateHuntGroup: updateHuntGroup,
      getDetails: getDetails,
      getAllUnassignedPilotNumbers: getAllUnassignedPilotNumbers,
      getMemberInfo: getMemberInfo,
      updateMemberEmail: updateMemberEmail,
      getPilotNumberSuggestions: getPilotNumberSuggestions,
      getHuntMembers: getHuntMembers,
      isFallbackNumberValid: isFallbackNumberValid,
      getHuntMethods: getHuntMethods,
      suggestionsNeeded: suggestionsNeeded,
      getHuntMemberWithSelectedNumber: getHuntMemberWithSelectedNumber,
      NUMBER_FORMAT_DIRECT_LINE: "NUMBER_FORMAT_DIRECT_LINE",
      NUMBER_FORMAT_EXTENSION: "NUMBER_FORMAT_EXTENSION"
    };

    return service;

    function getHuntMethods() {
      return {
        longestIdle: "DA_LONGEST_IDLE_TIME",
        broadcast: "DA_BROADCAST",
        circular: "DA_CIRCULAR",
        topDown: "DA_TOP_DOWN"
      };
    }

    /**
     * Function to update the user email in a promise when a member
     * pill is opened for the first time.
     */
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

    function getHuntMembers(hint) {
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

    function getNumbers() {
      var helper = getServiceHelper();
      helper.setService(NumberSearchServiceV2);
      helper.setExtractData(function (data) {
        return data.numbers;
      });
      return helper;
    }

    function getNumberSuggestions(hint, assigned) {
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

    function getPilotNumberSuggestions(hint) {
      return getNumberSuggestions(hint, false); // hunt pilots are unassigned numbers.
    }

    function isFallbackNumberValid(hint) {
      return getNumberSuggestions(hint, true); // fallback destination are assigned numbers.
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
      var huntMembers = [];
      users.forEach(function (user) {
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

    function getHuntMemberWithSelectedNumber(user) {
      var huntMember = {};
      return getMemberInfo(customerId, user.userUuid).then(function (u) {
        huntMember.uuid = user.userUuid;
        huntMember.user = u;
        u.numbers.some(function (num) {
          var isSelectedNumber = (user.numberUuid === num.uuid);
          if (isSelectedNumber) {
            huntMember.selectableNumber = num;
          }
          return isSelectedNumber;
        });
        return huntMember;
      });
    }

    function suggestionsNeeded(typedText) {
      return (typedText && typedText.length >= 3);
    }

    function getListOfHuntGroups() {

      return HuntGroupServiceV2.query({
        customerId: customerId
      }).$promise;
    }

    function deleteHuntGroup(huntGroupId) {

      return HuntGroupServiceV2.delete({
        customerId: customerId,
        huntGroupId: huntGroupId
      }).$promise;
    }

    function saveHuntGroup(customerId, details) {
      return HuntGroupServiceV2.save({
        customerId: customerId
      }, details).$promise;
    }

    function updateHuntGroup(customerId, huntGroupId, huntGroupData) {
      return HuntGroupServiceV2.update({
        customerId: customerId,
        huntGroupId: huntGroupId
      }, huntGroupData).$promise;
    }

    function getAllUnassignedPilotNumbers() {
      var helper = getNumbers();
      helper.setApiArgs({
        number: '',
        assigned: false
      });

      return helper.fetch().then(function (nums) {
        return nums;
      });
    }

    function getDetails(customerId, huntGroupId) {
      return HuntGroupServiceV2.get({
        customerId: customerId,
        huntGroupId: huntGroupId
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
