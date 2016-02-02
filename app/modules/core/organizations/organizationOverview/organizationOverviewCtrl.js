'use strict';

angular.module('Core')
  .controller('OrganizationOverviewCtrl', ['$stateParams', '$rootScope', '$scope', '$state', '$location', 'Storage', 'Log', '$filter', 'Orgservice', 'Authinfo', 'Notification', '$dialogs',
    function ($stateParams, $rootScope, $scope, $state, $location, Storage, Log, $filter, Orgservice, Authinfo, Notification, $dialogs) {

      $scope.currentOrganization = $stateParams.currentOrganization;

      var getOrgInfo = function () {
        Orgservice.getAdminOrg(function (data, status) {
          if (data.success) {
            $scope.org = data;
            if (data.services) {
              $scope.svcs = data.services;
            }
          } else {
            Log.debug('Get existing org failed. Status: ' + status);
          }
        }, $scope.currentOrganization.id, true);
      };

      getOrgInfo();

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

      $scope.$on('AuthinfoUpdated', function () {
        getOrgInfo();
      });

      $scope.manageFeatures = function () {
        $state.go('organization-overview.features');
      };
    }
  ]);
