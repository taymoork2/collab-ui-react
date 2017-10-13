// TODO: revisit this (re-implement as component for consistency)
(function () {
  'use strict';

  angular.module('Squared')
    .controller('UserEntitlementsCtrl', UserEntitlementsCtrl)
    .directive('userEntitlements', userEntitlements);

  /* @ngInject */
  function UserEntitlementsCtrl($scope, $rootScope, $timeout, $translate, Authinfo, Log, Notification, Userservice, Utils) {
    $scope.hasAccount = Authinfo.hasAccount();
    $scope.entitlements = Utils.getSqEntitlements($scope.currentUser);

    var services = Authinfo.getServices();
    var entitlementsCopy = _.clone($scope.entitlements);

    if ($scope.licenseType && $scope.hasAccount) {
      services = services.filter(function (service) {
        return service.isConfigurable && service.licenseType === $scope.licenseType;
      });
    }

    $scope.entitlementsKeys = _.map(services, 'serviceId').sort().reverse();

    $scope.isServiceAllowed = function (service) {
      return Authinfo.isServiceAllowed(service);
    };

    $scope.getServiceName = function (service) {
      return _.chain(services)
        .find({
          serviceId: service,
        })
        .get('displayName')
        .value();
    };

    $scope.shouldAddIndent = function (key, reference) {
      return key !== reference;
    };

    $scope.$on('save', function () {
      changeEntitlement($scope.currentUser);
    });

    $scope.$on('cancel', resetEntitlementsCopy);

    function resetEntitlementsCopy() {
      var watchedEntitlements = $scope.entitlements;
      // iterate over each item in watched collection, and copy item by item from backup copy
      _.forEach(watchedEntitlements, function (key, entitlementName) {
        watchedEntitlements[entitlementName] = entitlementsCopy[entitlementName];
      });
    }

    function updateEntitlementsCopy() {
      entitlementsCopy = $scope.entitlements;
    }

    function getUserEntitlementList() {
      // Build entitlements array from configurable entitlements filtered above
      return _.chain(services)
        .filter(function (service) {
          return !service.isIgnored;
        })
        .map(function (service) {
          var serviceId = service.serviceId;
          return {
            entitlementName: serviceId,
            entitlementState: $scope.entitlements[serviceId] ? 'ACTIVE' : 'INACTIVE',
          };
        })
        .value();
    }

    $scope.hasUserEntitlements = !!$scope.entitlementsKeys.length;

    function watchCheckboxes() {
      $timeout(function () {});
      var flag = false;
      $scope.$watchCollection('entitlements', function (newEntitlements, oldEntitlements) {
        if (flag) {
          flag = false;
          return;
        }
        var changedKey = Utils.changedKey(newEntitlements, oldEntitlements);

        // 'webExSquared' entitlement transitioning to false, set all other entitlements to false
        if (changedKey === 'webExSquared' && !newEntitlements.webExSquared && Utils.areEntitlementsActive($scope.entitlements)) {
          for (var key in $scope.entitlements) {
            if (key !== 'webExSquared' && key !== 'jabberMessenger') {
              $scope.entitlements[key] = false;
              flag = true;
            }
          }

          // 'webExSquared' was false, whatever changed is transitioning to true, whatever changes is NOT 'webExSquared', at least one entitlement is true
        } else if (!$scope.entitlements.webExSquared && !oldEntitlements[changedKey] && changedKey !== 'webExSquared' && Utils.areEntitlementsActive($scope.entitlements)) {
          // - tag-along 'webExSquared' transition to true
          if (changedKey !== 'jabberMessenger') {
            $scope.entitlements.webExSquared = true;
          }
        }
      });
    }

    /**
     * TODO: All entitlements are currently sent in the PATCH request in all cases,
     * even if the bucketed checkboxes are the only ones that are visible
     * (isConfigurable && hasAccount.) This works, but could be changed to
     * send only the entitlements whose values actually changed, instead of
     * all entitelments. The !hasAccount case should most likely keep the
     * current behavior of sending all entitlements, even when their values
     * didn't change.
     */
    function changeEntitlement(user) {
      Log.debug('Entitling user.', user);
      Userservice.updateUsers([{
        address: user.userName,
        name: user.name,
      }], null, getUserEntitlementList(), 'changeEntitlement', function (data) {
        var resultMsg;
        if (data.success) {
          var userStatus = data.userResponse[0].status;
          if (userStatus === 200) {
            // TODO: l10n missing
            resultMsg = data.userResponse[0].email + '\'s entitlements were updated successfully.';
            if ($scope.entitlements.webExSquared === true) {
              angular.element('.icon-' + user.id).html($translate.instant('usersPage.active'));
            } else {
              angular.element('.icon-' + user.id).html($translate.instant('usersPage.inactive'));
            }
            Notification.success(resultMsg);
          } else {
            if (userStatus === 404) {
              // TODO: l10n missing
              resultMsg = 'Entitlements for ' + data.userResponse[0].email + ' do not exist.';
            } else if (userStatus === 409) {
              // TODO: l10n missing
              resultMsg = 'Entitlement(s) previously updated.';
            } else {
              // TODO: l10n missing
              resultMsg = data.userResponse[0].email + '\'s entitlements were not updated, status: ' + userStatus;
            }
            Notification.error(resultMsg);
          }

          var updatedUser = _.find($scope.queryuserslist, {
            id: $scope.currentUser.id,
          });
          if (updatedUser) {
            for (var i = 0; i < $rootScope.services.length; i++) {
              var service = $rootScope.services[i].serviceId;
              var ciName = $rootScope.services[i].ciName;
              if ($scope.entitlements[service] === true && updatedUser.entitlements.indexOf(ciName) === -1) {
                updatedUser.entitlements.push(ciName);
              } else if ($scope.entitlements[service] === false && updatedUser.entitlements.indexOf(ciName) > -1) {
                updatedUser.entitlements.splice(updatedUser.entitlements.indexOf(ciName), 1);
              }
            }
          }
          updateEntitlementsCopy();
          $rootScope.$broadcast('entitlementsUpdated');
        } else {
          Log.error('Failed updating user with entitlements.');
          Log.error(data);
          resultMsg = 'Failed to update ' + user.userName + '\'s entitlements.';
          Notification.error(resultMsg);
        }
      });
    }

    watchCheckboxes();
  }

  function userEntitlements() {
    return {
      restrict: 'A',
      controller: 'UserEntitlementsCtrl',
      scope: {
        currentUser: '=',
        entitlements: '=',
        queryuserslist: '=',
        licenseType: '<',
      },
      template: require('modules/squared/scripts/directives/views/userentitlements.html'),
    };
  }
})();
