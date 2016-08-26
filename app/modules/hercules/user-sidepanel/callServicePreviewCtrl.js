(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('CallServicePreviewCtrl', CallServicePreviewCtrl);

  /*@ngInject*/
  function CallServicePreviewCtrl($scope, $state, $stateParams, Authinfo, Userservice, Notification, USSService2, ClusterService, $timeout, ServiceDescriptor, UriVerificationService, DomainManagementService, $translate, FeatureToggleService, ResourceGroupService) {
    $scope.saveLoading = false;
    $scope.currentUser = $stateParams.currentUser;
    var isEntitled = function (ent) {
      return $stateParams.currentUser.entitlements && $stateParams.currentUser.entitlements.indexOf(ent) > -1;
    };

    var sipUri = _.find($scope.currentUser.sipAddresses, {
      type: "enterprise"
    });

    $scope.isInvitePending = Userservice.isInvitePending($scope.currentUser);
    $scope.localizedServiceName = $translate.instant('hercules.serviceNames.' + $stateParams.extensionId);
    $scope.localizedOnboardingWarning = $translate.instant('hercules.userSidepanel.warningInvitePending', {
      ServiceName: $scope.localizedServiceName
    });

    $scope.callServiceAware = {
      id: 'squared-fusion-uc',
      name: 'squaredFusionUC',
      entitled: isEntitled('squared-fusion-uc'),
      sipUri: sipUri ? sipUri.value : null
    };
    $scope.callServiceConnect = {
      id: 'squared-fusion-ec',
      name: 'squaredFusionEC',
      entitled: isEntitled('squared-fusion-ec'),
      orgEntitled: Authinfo.isFusionEC(),
      enabledInFMS: false
    };
    $scope.resourceGroup = {
      show: false,
      saving: false,
      init: function () {
        this.options = [{ label: $translate.instant('hercules.resourceGroups.noGroupSelected'), value: '' }];
        this.selected = this.current = this.options[0];
      },
      reset: function () {
        this.selected = this.current;
        this.saving = false;
      },
      hasChanged: function () {
        return this.selected !== this.current;
      }
    };
    $scope.resourceGroup.init();

    // Only show callServiceConnect if it's enabled
    if ($scope.callServiceConnect.orgEntitled) {
      ServiceDescriptor.isServiceEnabled($scope.callServiceConnect.id, function (error, enabled) {
        if (!error) {
          $scope.callServiceConnect.enabledInFMS = enabled;
        }
      });
    }

    $scope.$watch('callServiceAware.entitled', function (newVal, oldVal) {
      if (newVal != oldVal) {
        $scope.setShouldShowButtons();
      }
    });

    $scope.$watch('callServiceConnect.entitled', function (newVal, oldVal) {
      if (newVal != oldVal) {
        $scope.setShouldShowButtons();
      }
    });

    var entitlementHasChanged = function () {
      return $scope.callServiceConnect.entitled !== isEntitled($scope.callServiceConnect.id) || $scope.callServiceAware.entitled !== isEntitled($scope.callServiceAware.id);
    };

    var updateStatus = function () {
      USSService2.getStatusesForUser($scope.currentUser.id).then(function (statuses) {
        $scope.callServiceAware.status = _.find(statuses, function (status) {
          return $scope.callServiceAware.id === status.serviceId;
        });
        $scope.callServiceConnect.status = _.find(statuses, function (status) {
          return $scope.callServiceConnect.id === status.serviceId;
        });
        if ($scope.callServiceAware.status && $scope.callServiceAware.status.connectorId) {
          ClusterService.getConnector($scope.callServiceAware.status.connectorId).then(function (connector) {
            $scope.callServiceAware.homedConnector = connector;
          });
        }
        if ($scope.callServiceConnect.status && $scope.callServiceConnect.status.connectorId) {
          ClusterService.getConnector($scope.callServiceConnect.status.connectorId).then(function (connector) {
            $scope.callServiceConnect.homedConnector = connector;
          });
        }
      });
    };

    var setSelectedResourceGroup = function (resourceGroupId) {
      var selectedGroup = _.find($scope.resourceGroup.options, function (group) {
        return group.value === resourceGroupId;
      });
      // TODO: deal with the fact that a resourceGroupId is set on the user, but no longer exists?
      if (selectedGroup) {
        $scope.resourceGroup.selected = selectedGroup;
        $scope.resourceGroup.current = selectedGroup;
      }
    };

    var readResourceGroups = function () {
      if (!FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroups)) {
        return;
      }
      ResourceGroupService.getAll().then(function (groups) {
        if (groups && groups.length > 0) {
          _.each(groups, function (group) {
            $scope.resourceGroup.options.push({
              label: group.name + (group.releaseChannel ? ' (' + group.releaseChannel + ')' : ''),
              value: group.id
            });
          });
          if ($scope.callServiceAware.status && $scope.callServiceAware.status.resourceGroupId) {
            setSelectedResourceGroup($scope.callServiceAware.status.resourceGroupId);
          } else {
            USSService2.getUserProps($scope.currentUser.id).then(function (props) {
              if (props.resourceGroups && props.resourceGroups[$scope.callServiceAware.id]) {
                setSelectedResourceGroup(props.resourceGroups[$scope.callServiceAware.id]);
              }
            });
          }
          $scope.resourceGroup.show = true;
        }
      });
    };

    updateStatus();
    readResourceGroups();

    var addEntitlementToCurrentUser = function (entitlement) {
      if (!_.includes($stateParams.currentUser.entitlements, entitlement)) {
        $stateParams.currentUser.entitlements.push(entitlement);
      }
    };

    var removeEntitlementFromCurrentUser = function (entitlement) {
      _.remove($stateParams.currentUser.entitlements, function (e) {
        return e === entitlement;
      });
    };

    var updateEntitlements = function () {
      $scope.savingEntitlements = true;
      var user = [{
        'address': $scope.currentUser.userName
      }];
      var entitlements = [{
        entitlementName: $scope.callServiceAware.name,
        entitlementState: $scope.callServiceAware.entitled === true ? 'ACTIVE' : 'INACTIVE'
      }];
      if ($scope.callServiceConnect.orgEntitled && $scope.callServiceConnect.enabledInFMS) {
        entitlements.push({
          entitlementName: $scope.callServiceConnect.name,
          entitlementState: $scope.callServiceAware.entitled === true && $scope.callServiceConnect.entitled === true ? 'ACTIVE' : 'INACTIVE'
        });
      }

      Userservice.updateUsers(user, null, entitlements, 'updateEntitlement', function (data) {
        var entitleResult = {
          msg: null,
          type: 'null'
        };
        if (data.success) {
          var userStatus = data.userResponse[0].status;
          if (userStatus === 200) {
            if (!$stateParams.currentUser.entitlements) {
              $stateParams.currentUser.entitlements = [];
            }
            if ($scope.callServiceAware.entitled) {
              addEntitlementToCurrentUser($scope.callServiceAware.id);
            } else {
              removeEntitlementFromCurrentUser($scope.callServiceAware.id);
              $scope.callServiceConnect.entitled = false;
            }
            if ($scope.callServiceConnect.orgEntitled && $scope.callServiceConnect.enabledInFMS) {
              if ($scope.callServiceConnect.entitled) {
                addEntitlementToCurrentUser($scope.callServiceConnect.id);
              } else {
                removeEntitlementFromCurrentUser($scope.callServiceConnect.id);
              }
            }
            console.log('Yes baby', $stateParams.currentUser.entitlements);
            $scope.setShouldShowButtons();
            $timeout(function () {
              updateStatus();
            }, 2000);
          } else if (userStatus === 404) {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.entitlements-dont-exist', {
              userName: $scope.currentUser.userName
            });
            entitleResult.type = 'error';
          } else if (userStatus === 409) {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.previously-updated');
            entitleResult.type = 'error';
          } else {
            entitleResult.msg = $translate.instant('hercules.userSidepanel.not-updated', {
              userName: $scope.currentUser.userName
            });
            entitleResult.type = 'error';
          }
          if (userStatus !== 200) {
            Notification.notify([entitleResult.msg], entitleResult.type);
          }

        } else {
          entitleResult = {
            msg: $translate.instant('hercules.userSidepanel.not-updated', {
              userName: $scope.currentUser.userName
            }),
            type: 'error'
          };
          Notification.notify([entitleResult.msg], entitleResult.type);
        }
        $scope.savingEntitlements = false;
        $scope.saving = $scope.resourceGroup.saving;
      });
    };

    var setResourceGroupOnUser = function (resourceGroupId) {
      $scope.resourceGroup.saving = true;
      var props = { userId: $scope.currentUser.id, resourceGroups: { 'squared-fusion-uc': resourceGroupId } };
      USSService2.updateUserProps(props).then(function () {
        $scope.resourceGroup.current = $scope.resourceGroup.selected;
        $scope.setShouldShowButtons();
      }).catch(function () {
        Notification.error('hercules.resourceGroups.failedToSetGroup');
      }).finally(function () {
        $scope.resourceGroup.saving = false;
        $scope.saving = $scope.savingEntitlements;
      });
    };

    $scope.save = function () {
      $scope.savingEntitlements = false;
      $scope.resourceGroup.saving = false;
      $scope.saving = true;
      if (entitlementHasChanged()) {
        updateEntitlements();
      }
      if ($scope.resourceGroup.hasChanged()) {
        setResourceGroupOnUser($scope.resourceGroup.selected.value);
      }
    };

    $scope.reset = function () {
      $scope.callServiceAware.entitled = isEntitled($scope.callServiceAware.id);
      $scope.callServiceConnect.entitled = isEntitled($scope.callServiceConnect.id);
      $scope.resourceGroup.reset();
      $scope.showButtons = false;
    };

    $scope.closePreview = function () {
      $state.go('users.list');
    };

    $scope.getStatus = function (status) {
      return USSService2.decorateWithStatus(status);
    };

    $scope.domainVerificationError = false; // need to be to be backwards compatible.
    $scope.checkIfDomainIsVerified = function (awareEntitled) {
      if (awareEntitled) {
        if (sipUri) {
          DomainManagementService.getVerifiedDomains().then(function (domainList) {
            if (!UriVerificationService.isDomainVerified(domainList, sipUri.value)) {
              $scope.domainVerificationError = true;
            }
          });
        }
      } else {
        $scope.domainVerificationError = false;
      }
    };

    // Do this at construct time
    $scope.checkIfDomainIsVerified($scope.callServiceAware.entitled);

    $scope.navigateToCallSettings = function () {
      $state.go('call-service.settings');
    };

    $scope.setShouldShowButtons = function () {
      $scope.showButtons = $scope.resourceGroup.hasChanged() || entitlementHasChanged();
    };
  }

}());
