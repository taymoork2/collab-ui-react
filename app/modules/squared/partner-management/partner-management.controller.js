(function () {
  'use strict';

  module.exports = PartnerManagementController;

  /* @ngInject */
  function PartnerManagementController($scope, $state, $translate, $window, $q, Notification, PartnerManagementService, ProPackService) {
    $scope.$on('$viewContentLoaded', function () {
      $window.document.title = $translate.instant('partnerManagement.browserTabHeaderTitle');
    });

    var vm = this;
    var svc = PartnerManagementService;

    var proPackEnabled = undefined;
    $q.all({
      proPackEnabled: ProPackService.hasProPackPurchased(),
    }).then(function (toggles) {
      proPackEnabled = toggles.proPackEnabled;
    });

    vm.getHeader = function () {
      return proPackEnabled ? $translate.instant('partnerManagement.navHeaderTitlePro') : $translate.instant('partnerManagement.navHeaderTitleNew');
    };

    vm.isLoading = false;

    vm.partnerPlaceholder = $translate.instant('partnerManagement.create.selectPartnerPlaceholder');
    vm.partnerTypes = ['DISTI', 'DVAR', 'RESELLER'];
    vm.partnerOptions = _.map(vm.partnerTypes, function (s) {
      return {
        label: $translate.instant('partnerManagement.create.partnerTypes.' + s),
        value: s,
      };
    });

    // Error messages from validators
    vm.messages = {
      required: $translate.instant('partnerManagement.error.required'),
      email: $translate.instant('partnerManagement.error.email'),
      noMatch: $translate.instant('partnerManagement.error.noMatch'),
      unused: $translate.instant('partnerManagement.error.nameInUse'),
    };

    // reset form data
    function initData() {
      vm.data = {
        email: '',
        confirmEmail: '',
        name: '',
        confirmName: '',
        partnerType: '',
        lifeCyclePartner: false,
      };
    }
    initData();

    vm.search = function () {
      vm.isLoading = true;
      svc.search(vm.data.email).then(function (resp) {
        vm.isLoading = false;
        switch (resp.status) {
          case 200:
            switch (resp.data.orgMatchBy) {
              case 'EMAIL_ADDRESS':
              case 'DOMAIN_CLAIMED':
                vm.data.emailMatch = resp.data.organizations[0];
                vm.data.name = vm.data.emailMatch.displayName;
                getOrgDetails(vm.data.emailMatch.orgId);
                $state.go((resp.data.orgMatchBy === 'EMAIL_ADDRESS') ?
                  'partnerManagement.orgExists' : 'partnerManagement.orgClaimed');
                break;

              case 'DOMAIN':
                vm.data.domainMatches = resp.data.organizations;
                $state.go('partnerManagement.searchResults');
                break;

              case 'NO_MATCH':
                $state.go('partnerManagement.create');
                break;

              default:
                Notification.errorWithTrackingId(resp,
                  'partnerManagement.error.searchFailed',
                  { msg: $translate.instant('partnerManagement.error.unexpectedResp') });
            }
            break;

          default:
            // Unexpected resp, but go on to create anyway
            // (the create API will check email as well)
            $state.go('partnerManagement.create');
        }
      }).catch(function (resp) {
        vm.isLoading = false;
        Notification.errorWithTrackingId(resp,
          'partnerManagement.error.searchFailed',
          {
            msg: (_.isEmpty(resp.data)) ?
              $translate.instant('partnerManagement.error.timeout') : resp.data.message,
          });
      });
    };

    vm.create = function () {
      vm.isLoading = true;
      svc.create(vm.data).then(function () {
        vm.isLoading = false;
        $state.go('partnerManagement.createSuccess');
      }).catch(function (resp) {
        vm.isLoading = false;
        if (!_.isEmpty(resp.data) &&
          (resp.data.message === ('Organization ' + vm.data.name + ' already exists in CI'))) {
          vm.duplicateName = vm.data.name;
          vm.createForm.name.$validate();
        } else {
          Notification.errorWithTrackingId(resp,
            'partnerManagement.error.createFailed',
            {
              msg: (_.isEmpty(resp.data)) ?
                $translate.instant('partnerManagement.error.timeout') : resp.data.message,
            });
        }
      });
    };

    vm.done = function () {
      $state.go('support.status');
    };

    vm.startOver = function () {
      initData();
      $state.go('partnerManagement.search');
    };

    function pushDetail(label, value, defValue) {
      value = value || defValue;
      if (Array.isArray(value)) {
        value = value.join(', ');
      }

      vm.data.orgDetails.push({
        label: $translate.instant('partnerManagement.orgDetails.' + label),
        value: value,
      });
    }

    function getOrgDetails(org) {
      // this is done while browser is loading page...
      vm.showSpinner = true;
      svc.getOrgDetails(org).then(function (resp) {
        vm.data.orgRaw = resp.data;
        // Alpha sort data...
        vm.data.orgRaw.claimedDomains = _.sortBy(vm.data.orgRaw.claimedDomains);
        vm.data.orgRaw.fullAdmins = _.sortBy(vm.data.orgRaw.fullAdmins,
          ['displayName', 'primaryEmail']);
        // put thumbnail on root of admin object...
        _.forEach(vm.data.orgRaw.fullAdmins, function (o) {
          var thumb = _.find(o.photos, { type: 'thumbnail' });
          if (thumb) {
            o.thumbnail = thumb.url;
          }
        });

        vm.data.orgDetails = [];
        pushDetail('createDate', new Date(vm.data.orgRaw.createdDate).toLocaleString());
        pushDetail('activeSubs', vm.data.orgRaw.numOfSubscriptions, 0);
        pushDetail('managedCusts', vm.data.orgRaw.numOfManagedOrg, 0);
        pushDetail('domains', vm.data.orgRaw.claimedDomains, '');
        pushDetail('users', vm.data.orgRaw.numOfUsers, 0);
        pushDetail('admins', _.map(vm.data.orgRaw.fullAdmins, 'displayName'), '');
        pushDetail('orgId', org);

        vm.showSpinner = false;
      }).catch(function (resp) {
        Notification.errorWithTrackingId(resp,
          'partnerManagement.error.getOrgDetails',
          {
            msg: (_.isEmpty(resp.data)) ?
              $translate.instant('partnerManagement.error.timeout') : resp.data.message,
          });
        vm.showSpinner = false;
      });
    }
  }
}());
