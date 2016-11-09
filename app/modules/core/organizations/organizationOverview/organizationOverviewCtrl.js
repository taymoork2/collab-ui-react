(function () {
  'use strict';

  angular.module('Core')
    .controller('OrganizationOverviewCtrl', OrganizationOverviewCtrl);

  /* @ngInject */
  function OrganizationOverviewCtrl($stateParams, $rootScope, $scope, $state, $filter, Orgservice, Notification) {
    var currentOrgId = $stateParams.currentOrganization.id;
    $scope.currentOrganization = $stateParams.currentOrganization;
    $scope.setEftToggle = setEftToggle;
    $scope.eftToggleLoading = true;
    $scope.updateEftToggle = updateEftToggle;
    $scope.isEFT = false;
    $scope.currentEftSetting = false;
    $scope.toggleReleaseChannelAllowed = toggleReleaseChannelAllowed;
    $scope.showHybridServices = false;

    init();

    function init() {
      initReleaseChannels();
      getOrgInfo();
      updateEftToggle();
    }

    function getOrgInfo() {
      Orgservice.getAdminOrg(function (data) {
        if (data.success) {
          $scope.currentOrganization = data;
          initReleaseChannels();
        } else {
          Notification.error('organizationsPage.orgReadFailed');
        }
      }, $scope.currentOrganization.id, true);
    }

    function initReleaseChannels() {
      $scope.showHybridServices = _.includes($scope.currentOrganization.services, 'squared-fusion-mgmt');
      if ($scope.showHybridServices) {
        var ReleaseChannel = function (name, allowed) {
          this.name = name;
          this.newAllow = allowed;
          this.oldAllow = allowed;
          this.reset = function () {
            this.newAllow = this.oldAllow;
          };
          this.updated = function () {
            this.oldAllow = this.newAllow;
          };
          this.hasChanged = function () {
            return this.newAllow !== this.oldAllow;
          };
        };
        $scope.betaChannel = new ReleaseChannel('beta', _.includes($scope.currentOrganization.services, 'squared-fusion-mgmt-channel-beta'));
        $scope.latestChannel = new ReleaseChannel('latest', _.includes($scope.currentOrganization.services, 'squared-fusion-mgmt-channel-latest'));
      }
    }

    function updateEftToggle() {
      return Orgservice.getEftSetting(currentOrgId)
        .then(function (response) {
          _.set($scope, 'isEFT', response.data.eft);
          $scope.currentEftSetting = response.data.eft;
        })
        .catch(function () {
          Notification.error('organizationsPage.eftError');
        })
        .finally(function () {
          $scope.eftToggleLoading = false;
        });
    }

    function setEftToggle(eft) {
      if (eft !== $scope.currentEftSetting) {
        Orgservice.setEftSetting(eft, currentOrgId)
          .then(function () {
            _.set($scope, 'isEFT', eft);
            _.set($scope, 'currentEftSetting', eft);
          })
          .catch(function () {
            _.set($scope, 'isEFT', $scope.currentEftSetting);
            Notification.error('organizationsPage.eftError');
          });
      }
    }

    function toggleReleaseChannelAllowed(channel) {
      if (!channel.hasChanged()) {
        return;
      }
      Orgservice.setHybridServiceReleaseChannelEntitlement(currentOrgId, channel.name, channel.newAllow).then(function () {
        Notification.success('organizationsPage.releaseChannelToggleSuccess');
        channel.updated();
      }).catch(function () {
        Notification.error('organizationsPage.releaseChannelToggleFailure');
        channel.reset();
      });
    }

    //Making sure the search field is cleared
    $('#search-input').val('');

    //A div used to cover the export button when it's disabled.
    $('#btncover').hide();

    $scope.exportBtn = {
      title: $filter('translate')('organizationsPage.exportBtn'),
      disabled: false
    };

    if ($rootScope.exporting === true) {
      $scope.exportBtn.title = $filter('translate')('organizationsPage.loadingMsg');
      $scope.exportBtn.disabled = true;
      $('#btncover').show();
    }

    $scope.manageFeatures = function () {
      $state.go('organization-overview.features');
    };
  }
})();
