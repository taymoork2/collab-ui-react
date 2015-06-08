(function () {
  'use strict';

  angular.module('Core')
    .controller('OrganizationAddCtrl', OrganizationAddCtrl);

  /* @ngInject */
  function OrganizationAddCtrl($scope, $state, $translate, $q, Authinfo, Orgservice, HuronCustomer, Notification, Config, EmailService, ValidationService, AccountService) {
    var vm = this;

    vm.nameError = false;
    vm.emailError = false;
    vm.startDate = new Date();
    vm.isPartner = false;
    vm.offers = {};
    vm.model = {
      licenseCount: 100,
      licenseDuration: 90,
    };

    vm.orgInfoFields = [{
      key: 'companyPartnerName',
      type: 'input',
      templateOptions: {
        label: $translate.instant('orgsPage.companyPartnerName'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'text',
        required: true
      }
    }, {
      key: 'adminEmail',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('orgsPage.adminEmail'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'email',
        required: true
      }
    }];

    vm.organizationTermsFields = [
    {
      key: 'isPartner',
      type: 'checkbox',
      templateOptions: {
        label: $translate.instant('orgsPage.isPartner'),
        id: 'isPartner',
        class: 'col-xs-8 col-xs-offset-4'
      }
    }, {
      key: 'beId',
      type: 'input',
      templateOptions: {
        label: $translate.instant('orgsPage.beId'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        type: 'text',
        required: true
      },
      expressionProperties: {
        'hide': '!model.isPartner'
      }
    }, {
      key: 'COLLAB',
      type: 'checkbox',
      model: vm.offers,
      templateOptions: {
        label: $translate.instant('orgsPage.collab'),
        id: 'squaredOrganization',
        class: 'col-xs-8 col-xs-offset-4'
      },
      expressionProperties: {
        'templateOptions.disabled': function () {
          return vm.isSquaredUCEnabled();
        }
      }
    }, {
      key: 'SQUAREDUC',
      type: 'checkbox',
      model: vm.offers,
      templateOptions: {
        label: $translate.instant('orgsPage.squaredUC'),
        id: 'squaredUCOrganization',
        class: 'col-xs-8 col-xs-offset-4'
      },
      expressionProperties: {
        'hide': function () {
          return !vm.isSquaredUC;
        }
      }
    }, {
      key: 'licenseDuration',
      type: 'radio-list',
      templateOptions: {
        horizontal: true,
        label: $translate.instant('orgsPage.duration'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-7',
        options: [{
          label: $translate.instant('orgsPage.ninetyDays'),
          value: 90,
          id: 'organization90'
        }, {
          label: $translate.instant('orgsPage.onehundredtwentyDays'),
          value: 120,
          id: 'organization120'
        }, {
          label: $translate.instant('orgsPage.onehundredeightyDays'),
          value: 180,
          id: 'organization180'
        }]
      }
    }, {
      key: 'licenseCount',
      type: 'input',
      className: 'last-field',
      templateOptions: {
        label: $translate.instant('orgsPage.numberOfLicenses'),
        labelClass: 'col-xs-4',
        inputClass: 'col-xs-3',
        type: 'number',
        required: true
      },
      validators: {
        count: {
          expression: function ($viewValue, $modelValue) {
            return ValidationService.trialLicenseCount($viewValue, $modelValue);
          },
          message: function () {
            return $translate.instant('orgsPage.invalidOrganizationLicenseCount');
          }
        }
      }
    }];

    $scope.$watch(function () {
      return vm.offers[Config.organizations.squaredUC];
    }, function (newValue) {
      if (newValue) {
        vm.offers[Config.organizations.collab] = true;
      }
    });

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.isOffersEmpty = isOffersEmpty;

    vm.startOrganization = startOrganization;
    vm.isSquaredUCEnabled = isSquaredUCEnabled;

    function isOffersEmpty() {
      return !(vm.offers[Config.organizations.collab] || vm.offers[Config.organizations.squaredUC]);
    }

    function isSquaredUCEnabled() {
      return vm.offers[Config.organizations.squaredUC];
    }

    function startOrganization(keepModal) {
      vm.nameError = false;
      vm.emailError = false;
      angular.element('#startOrganizationButton').button('loading');

      var offersList = [];
      for (var i in vm.offers) {
        if (vm.offers[i]) {
          offersList.push(i);
        }
      }

      return AccountService.createAccount(offersList, vm.model.companyPartnerName, vm.model.adminEmail, vm.model.licenseDuration, vm.model.licenseCount, vm.startDate, offersList)
        .catch(function (response) {
          angular.element('#startOrganizationButton').button('reset');
          Notification.notify([response.data.message], 'error');
          if ((response.data.message).indexOf('Org') > -1) {
            vm.nameError = true;
          } else if ((response.data.message).indexOf('Admin User') > -1) {
            vm.emailError = true;
          }
          return $q.reject(response);
        }).then(function (response) {
          vm.model.customerOrgId = response.data.customerOrgId;
          if (offersList.indexOf(Config.organizations.squaredUC) !== -1) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.companyPartnerName, response.data.adminEmail)
              .catch(function (response) {
                angular.element('#startOrganizationButton').button('reset');
                Notification.errorResponse(response, 'organizationModal.squareducError');
                return $q.reject(response);
              });
          } else {
            return EmailService.emailNotifyOrganizationCustomer(vm.model.adminEmail, vm.model.licenseDuration, vm.model.customerOrgId)
              .catch(function (response) {
                Notification.notify([$translate.instant('didManageModal.emailFailText')], 'error');
              });
          }
        }).then(function () {
          angular.element('#startOrganizationButton').button('reset');
          if (!keepModal) {
            $state.modal.close();
          }
          var successMessage = [$translate.instant('organizationModal.addSuccess', {
            companyPartnerName: vm.model.companyPartnerName,
            licenseCount: vm.model.licenseCount,
            licenseDuration: vm.model.licenseDuration
          })];
          Notification.notify(successMessage, 'success');
          return vm.model.customerOrgId;
        });
    }
  }
})();
