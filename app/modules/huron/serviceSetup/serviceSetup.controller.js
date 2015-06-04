(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('ServiceSetupCtrl', ServiceSetupCtrl);

  /* @ngInject */
  function ServiceSetupCtrl($q, ServiceSetup, HttpUtils, Notification, Authinfo, $translate, HuronCustomer) {

    var vm = this;
    var DEFAULT_SITE_INDEX = '000001';
    var DEFAULT_TZ = 'America/Los_Angeles';
    var DEFAULT_SD = '9';
    var DEFAULT_SITE_SD = '8';
    var DEFAULT_SITE_CODE = '100';
    var DEFAULT_MOH = 'ciscoDefault';
    var DEFAULT_FROM = '5000';
    var DEFAULT_TO = '5999';
    vm.pilotNumberSelected = undefined;
    vm.externalNumberPool = [];
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');
    vm.steeringDigits = [
      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ];
    vm.site = {
      siteIndex: DEFAULT_SITE_INDEX,
      steeringDigit: DEFAULT_SD,
      siteSteeringDigit: DEFAULT_SITE_SD,
      siteCode: DEFAULT_SITE_CODE,
      voicemailPilotNumber: ''
    };
    vm.globalMOH = DEFAULT_MOH;
    vm.internalNumberRanges = [];
    vm.firstTimeSetup = true;
    vm.hasVoicemailService = false;
    vm.addNewInternalNumberRange = addNewInternalNumberRange;
    vm.deleteInternalNumberRange = deleteInternalNumberRange;
    vm.loadExternalNumberPool = loadExternalNumberPool;
    vm.initNext = initNext;

    function getTimezones() {
      ServiceSetup.getTimeZones().then(function (timezones) {
        vm.timeZones = timezones;
        vm.site.timeZone = DEFAULT_TZ;
      });
    }

    function initServiceSetup() {
      var errors = [];
      HuronCustomer.get().then(function (customer) {
        angular.forEach(customer.links, function (service) {
          if (service.rel === 'voicemail') {
            vm.hasVoicemailService = true;
          }
        });
      }).catch(function (response) {
        errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.customerGetError'));
      }).then(function () {
        // sets firstTimeSetup to false if a site exists
        ServiceSetup.listSites().then(function () {
          if (ServiceSetup.sites.length !== 0) {
            ServiceSetup.getSite(ServiceSetup.sites[0].uuid).then(function (site) {
              vm.firstTimeSetup = false;
              vm.site.steeringDigit = site.steeringDigit;
              vm.site.siteSteeringDigit = site.siteSteeringDigit;
              vm.site.siteCode = site.siteCode;
              // get voicemail pilot number
              if (vm.hasVoicemailService) {
                ServiceSetup.getVoicemailPilotNumber().then(function (voicemail) {
                  // if the pilotNumber == customer org uuid, then voicemail is not set
                  if (voicemail.pilotNumber === Authinfo.getOrgId()) {
                    vm.externalNumberPool = [];
                    vm.pilotNumberSelected = undefined;
                  } else {
                    vm.externalNumberPool = [{
                      uuid: voicemail.name,
                      pattern: voicemail.pilotNumber
                    }];
                    vm.pilotNumberSelected = vm.externalNumberPool[0];
                  }
                }).catch(function (response) {
                  vm.externalNumberPool = [];
                  vm.pilotNumberSelected = undefined;
                  Notification.errorResponse(response, 'serviceSetupModal.voicemailGetError');
                });
              }
            });
          } else {
            vm.firstTimeSetup = true;
            if (vm.hasVoicemailService) {
              vm.loadExternalNumberPool();
            }
          }
        });
      });
    }

    function loadExternalNumberPool(pattern) {
      ServiceSetup.loadExternalNumberPool(pattern).then(function () {
        vm.externalNumberPool = ServiceSetup.externalNumberPool;
        if (vm.externalNumberPool.length > 0 && !vm.pilotNumberSelected) {
          vm.pilotNumberSelected = vm.externalNumberPool[0];
        }
      }).catch(function (response) {
        vm.externalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
    }

    function listInternalExtentionRanges() {
      ServiceSetup.listInternalNumberRanges().then(function () {
        vm.internalNumberRanges = ServiceSetup.internalNumberRanges;
        // sort - order by beginNumber ascending
        vm.internalNumberRanges.sort(function (a, b) {
          return a.beginNumber - b.beginNumber;
        });

        if (vm.internalNumberRanges.length === 0) {
          vm.internalNumberRanges.push({
            beginNumber: DEFAULT_FROM,
            endNumber: DEFAULT_TO
          });
        }
      });
    }

    function addNewInternalNumberRange() {
      vm.internalNumberRanges.push({
        beginNumber: '',
        endNumber: ''
      });
    }

    function deleteInternalNumberRange(index, internalNumberRange) {
      if (internalNumberRange.uuid) {
        ServiceSetup.deleteInternalNumberRange(internalNumberRange)
          .then(function () {
            vm.internalNumberRanges.splice(index, 1);
            if (vm.internalNumberRanges.length === 0) {
              vm.internalNumberRanges.push({
                beginNumber: DEFAULT_FROM,
                endNumber: DEFAULT_TO
              });
            }
            Notification.notify([$translate.instant('serviceSetupModal.extensionDeleteSuccess', {
              extension: internalNumberRange.name
            })], 'success');
          })
          .catch(function (response) {
            Notification.errorResponse(response, $translate.instant('serviceSetupModal.extensionDeleteError', {
              extension: internalNumberRange.name
            }));
          });
      } else {
        vm.internalNumberRanges.splice(index, 1);
      }
    }

    function validate() {
      // Validate DNs
      var isDnValid = true;
      var invalidDn = '';
      angular.forEach(vm.internalNumberRanges, function (dn) {
        if (dn.beginNumber.length !== 4) {
          isDnValid = false;
          invalidDn += (', ' + dn.beginNumber);
        }
        if (dn.endNumber.length !== 4) {
          isDnValid = false;
          invalidDn += (', ' + dn.endNumber);
        }
      });
      if (!isDnValid) {
        Notification.notify([$translate.instant('serviceSetupModal.extensionError') + invalidDn.slice(2)], 'error');
      }
      return isDnValid;
    }

    function initNext() {
      if (!validate()) {
        return $q.reject('Field validation failed.');
      } else {
        var deferreds = [];
        var errors = [];
        if (vm.firstTimeSetup) {
          if (vm.pilotNumberSelected) {
            vm.site.voicemailPilotNumber = vm.pilotNumberSelected.pattern;
          } else {
            delete vm.site.voicemailPilotNumber;
          }
          var promise = ServiceSetup.createSite(vm.site).then(function () {
            if (vm.pilotNumberSelected) {
              ServiceSetup.updateCustomerVoicemailPilotNumber({
                voicemail: {
                  pilotNumber: vm.pilotNumberSelected.pattern
                }
              }).then(function () {
                vm.firstTimeSetup = false;
              }).catch(function (response) {
                errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailUpdateError'));
              });
            }
          }).catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.siteError'));
          });
          deferreds.push(promise);
        }

        if (angular.isArray(vm.internalNumberRanges)) {
          angular.forEach(vm.internalNumberRanges, function (internalNumberRange) {
            var promise = ServiceSetup.createInternalNumberRange(internalNumberRange)
              .catch(function (response) {
                var error = Notification.processErrorResponse(response, 'serviceSetupModal.extensionAddError', {
                  extension: this.name
                });
                errors.push(error);
              }.bind(internalNumberRange));
            deferreds.push(promise);
          });
        }

        return $q.all(deferreds).then(function () {
          if (errors.length > 0) {
            Notification.notify(errors, 'error');
            return $q.reject('Site/extension create failed.');
          } else {
            Notification.notify([$translate.instant('serviceSetupModal.saveSuccess')], 'success');
          }
        });
      }
    }

    HttpUtils.setTrackingID().then(function () {
      getTimezones();
      initServiceSetup();
      listInternalExtentionRanges();
    });
  }
})();
