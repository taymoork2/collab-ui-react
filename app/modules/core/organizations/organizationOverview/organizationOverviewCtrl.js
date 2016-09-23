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
    $scope.currentOrganization.isEFT = false;
    $scope.currentEftSetting = false;
    $scope.toggleReleaseChannelAllowed = toggleReleaseChannelAllowed;
    $scope.showHybridServices = _.includes($scope.currentOrganization.services, 'squared-fusion-mgmt');

    if ($scope.showHybridServices) {
      var ReleaseChannel = function (name, allowed) {
        this.name = name;
        this.newAllow = this.oldAllow = allowed;
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

    updateEftToggle();

    function updateEftToggle() {
      return Orgservice.getEftSetting(currentOrgId)
        .then(function (response) {
          _.set($scope, 'currentOrganization.isEFT', response.data.eft);
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
      if ($scope.currentEftSetting !== $scope.currentOrganization.isEFT) {
        $scope.eftToggleLoading = true;
        Orgservice.setEftSetting(eft, currentOrgId)
          .then(updateEftToggle)
          .catch(function () {
            _.set($scope, 'currentOrganization.isEFT', $scope.currentEftSetting);
            Notification.error('organizationsPage.eftError');
          })
          .finally(function () {
            $scope.eftToggleLoading = false;
          });
      }
    }

    function toggleReleaseChannelAllowed(channel) {
      if (!channel.hasChanged()) {
        return;
      }
      Orgservice.setHybridServiceReleaseChannelEntitlement(channel.name, channel.newAllow).then(function () {
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
