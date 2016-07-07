(function () {
  'use strict';

  /**
   * A factory to take care of fetching call park members and any other
   * data handling logic for call park members.
   */

  angular
    .module('uc.hurondetails')
    .factory('CallParkMemberDataService', CallParkMemberDataService);

  /* @ngInject */

  function CallParkMemberDataService(CallParkService, Notification, $q) {

    var selectedMembers = [];
    var currentOpenMemberUuid = '';
    var pristineSelectedMembers;

    return {
      selectMember: selectMember,
      removeMember: removeMember,
      fetchMembers: fetchMembers,
      fetchCallParkMembers: fetchCallParkMembers,
      getDisplayName: getDisplayName,
      toggleMemberPanel: toggleMemberPanel,
      getMembersNumberUuidJSON: getMembersNumberUuidJSON,
      reset: reset,
      setMemberJSON: setMemberJSON,
      getCallParkMembers: getCallParkMembers,
      isMemberDirty: isMemberDirty,
      setAsPristine: setAsPristine,
      rearrangeResponsesInSequence: rearrangeResponsesInSequence // elevated for unit testing
    };

    ////////////////

    function setAsPristine() {
      pristineSelectedMembers = angular.copy(selectedMembers);
    }

    function isMemberDirty(pristineMember) {
      var dirty = false;
      selectedMembers.some(function (m) {
        if (pristineMember.userUuid === m.user.uuid) {
          dirty = (pristineMember.numberUuid !== m.selectableNumber.uuid);
        }
        return dirty;
      });
      return dirty;
    }

    function getCallParkMembers() {
      return selectedMembers;
    }

    function getMemberAsynchronously(user, async) {
      CallParkService.getCallParkMemberWithSelectedNumber(user).then(function (m) {
        selectedMembers.push(m);
        async.resolve();
      }, function () {
        async.reject();
      });
    }

    function rearrangeResponsesInSequence(users) {
      var tempArray = angular.copy(selectedMembers);
      selectedMembers.splice(0, selectedMembers.length);

      users.forEach(function (user) {
        tempArray.some(function (u) {
          var found = (user.userUuid === u.uuid);
          var alreadyAdded = selectedMembers.indexOf(u);
          if (found && alreadyAdded === -1) {
            selectedMembers.push(u);
          }
          return found;
        });
      });
    }

    /**
     * Given call park members "members" field JSON received from
     * GET /callparks/{id} initialize the data model for the UI
     */
    function setMemberJSON(users, resetFromBackend) {
      reset(resetFromBackend);

      var asyncTask = $q.defer();
      if (resetFromBackend) {
        var promises = [];
        users.forEach(function (user) {
          var async = $q.defer();
          promises.push(async.promise);
          getMemberAsynchronously(user, async);
        });

        $q.all(promises).then(function () {
          /**
           * Rearrange responses in the right order as it is found in
           * parameter json. Note that members are fetched asynchronously,
           * so there is no conformance that responses will be sequentially
           * aligned.
           */
          rearrangeResponsesInSequence(users);
          pristineSelectedMembers = angular.copy(selectedMembers);
          asyncTask.resolve(selectedMembers);
        }, memberFailureResponse(asyncTask));

      } else {
        selectedMembers = angular.copy(pristineSelectedMembers);
        asyncTask.resolve(selectedMembers);
      }
      return asyncTask.promise;
    }

    /**
     * Reset the single data service to its origin state.
     */
    function reset(resetFromBackend) {
      selectedMembers.splice(0, selectedMembers.length);
      currentOpenMemberUuid = '';
      if (resetFromBackend) {
        pristineSelectedMembers = undefined;
      }
    }

    /**
     * Return the JSON data format to be used for POST & PUT
     * operations.
     */
    function getMembersNumberUuidJSON() {
      var members = [];
      selectedMembers.forEach(function (member) {
        if (!_.contains(members, member.selectableNumber.uuid)) {
          members.push(member.selectableNumber.uuid);
        }
      });
      return members;
    }

    /**
     * Logic for accordion opening of member panel.
     */
    function toggleMemberPanel(userUuid) {
      if (currentOpenMemberUuid === userUuid) {
        currentOpenMemberUuid = undefined;
      } else {
        currentOpenMemberUuid = userUuid;
      }
      return currentOpenMemberUuid;
    }

    /**
     * Feeder for the data service from the UI.
     */
    function selectMember(member) {
      selectedMembers.push(member);
      return selectedMembers;
    }

    /**
     * Remove the member for the data service once it
     * is removed from UI.
     */
    function removeMember(user) {
      selectedMembers.splice(
        selectedMembers.indexOf(user), 1);
      currentOpenMemberUuid = undefined;
    }

    /**
     * Return the call park members from the backend based
     * on the nameHint, but filter those selected on
     * UI already from showing.
     */
    function fetchCallParkMembers(nameHint) {
      return fetchMembers(nameHint, {
        sourceKey: 'uuid',
        responseKey: 'uuid',
        dataToStrip: selectedMembers
      });
    }

    /**
     * Given a hint and a filter function, fetch the huron
     * users from the backend and apply the filtering logic.
     */
    function fetchMembers(nameHint, filter) {
      var GetCallParkMembers = CallParkService.getMembers(nameHint);

      if (GetCallParkMembers) {
        GetCallParkMembers.setOnFailure(memberFailureResponse());
        if (filter) {
          GetCallParkMembers.setFilter(filter);
        }
        return GetCallParkMembers.fetch();
      }

      return [];
    }

    function memberFailureResponse(asyncTask) {
      return function (response) {
        Notification.errorResponse(response, 'huronCallPark.memberFetchFailure');
        if (asyncTask) {
          asyncTask.reject();
        }
      };
    }

    /**
     * Simple utility to display firstName and lastName
     * concatenated with a space.
     */
    function getDisplayName(user) {
      if (!user) {
        return;
      }

      if (!user.firstName && !user.lastName) {
        return user.userName;
      } else if (user.firstName && user.lastName) {
        return user.firstName + ' ' + user.lastName;
      } else if (user.firstName) {
        return user.firstName;
      } else if (user.lastName) {
        return user.lastName;
      } else {
        return;
      }
    }
  }
})();
