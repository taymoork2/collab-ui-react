(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('ServiceSetupCtrl', ServiceSetupCtrl);

  /* @ngInject */
  function ServiceSetupCtrl($q, $state, ServiceSetup, HttpUtils, Notification, Authinfo, $translate, HuronCustomer, ValidationService) {
    var vm = this;
    var DEFAULT_SITE_INDEX = '000001';
    var DEFAULT_TZ = {
      value: 'America/Los_Angeles',
      label: '(GMT-08:00) Pacific Time (US & Canada)'
    };
    var DEFAULT_SD = '9';
    var DEFAULT_SITE_SD = '8';
    var DEFAULT_SITE_CODE = '100';
    var DEFAULT_FROM = '5000';
    var DEFAULT_TO = '5999';

    var mohOptions = [{
      label: $translate.instant('serviceSetupModal.ciscoDefault'),
      value: 'ciscoDefault'
    }, {
      label: $translate.instant('serviceSetupModal.fall'),
      value: 'fall'
    }, {
      label: $translate.instant('serviceSetupModal.winter'),
      value: 'winter'
    }];

    vm.processing = true;
    vm.pilotNumberSelected = undefined;
    vm.externalNumberPool = [];
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');
    vm.steeringDigits = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

    vm.model = {
      site: {
        siteIndex: DEFAULT_SITE_INDEX,
        steeringDigit: DEFAULT_SD,
        siteSteeringDigit: DEFAULT_SITE_SD,
        siteCode: DEFAULT_SITE_CODE,
        timeZone: DEFAULT_TZ,
        voicemailPilotNumber: ''
      },
      numberRanges: [],
      globalMOH: mohOptions[0]
    };

    vm.firstTimeSetup = $state.current.data.firstTimeSetup;
    vm.hasVoicemailService = false;

    vm.validations = {
      greaterThanLessThan: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        return value >= scope.model.beginNumber;
      }
    };

    vm.fields = [{
      model: vm.model.site,
      className: 'service-setup',
      fieldGroup: [{
        key: 'timeZone',
        type: 'select',
        className: 'service-setup-timezone',
        templateOptions: {
          label: $translate.instant('serviceSetupModal.timeZone'),
          description: $translate.instant('serviceSetupModal.tzDescription'),
          options: [],
          labelfield: 'label',
          valuefield: 'value',
          inputPlaceholder: $translate.instant('serviceSetupModal.searchTimeZone'),
          filter: true
        },
        controller: /* @ngInject */ function ($scope, ServiceSetup) {
          ServiceSetup.getTimeZones().then(function (timezones) {
            $scope.to.options = timezones;
          });
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return !vm.firstTimeSetup;
          }
        }
      }, {
        key: 'steeringDigit',
        type: 'select',
        className: 'service-setup-steering-digit',
        templateOptions: {
          label: $translate.instant('serviceSetupModal.steeringDigit'),
          description: $translate.instant('serviceSetupModal.steeringDigitDescription'),
          options: vm.steeringDigits
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return !vm.firstTimeSetup;
          }
        }
      }, {
        key: 'siteSteeringDigit',
        type: 'select',
        className: 'service-setup-steering-digit',
        templateOptions: {
          label: $translate.instant('serviceSetupModal.siteSteeringDigit'),
          description: $translate.instant('serviceSetupModal.siteSteeringDigitDescription'),
          options: vm.steeringDigits
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return !vm.firstTimeSetup;
          }
        }
      }, {
        key: 'siteCode',
        type: 'input',
        className: 'service-setup-site-code',
        templateOptions: {
          label: $translate.instant('serviceSetupModal.siteCode'),
          description: $translate.instant('serviceSetupModal.siteCodeDescription'),
          type: 'text',
          required: true,
          maxlength: 5
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return !vm.firstTimeSetup;
          }
        }
      }]
    }, {
      key: 'numberRanges',
      type: 'repeater',
      className: 'service-setup service-setup-extension',
      templateOptions: {
        label: $translate.instant('serviceSetupModal.internalExtensionRange'),
        description: $translate.instant('serviceSetupModal.internalNumberRangeDescription'),
        fields: [{
          className: 'formly-field-inline service-setup-extension-range',
          fieldGroup: [{
            className: 'form-inline formly-field formly-field-input',
            type: 'input',
            key: 'beginNumber',
            validators: {
              numeric: {
                expression: ValidationService.numeric,
                message: function () {
                  return $translate.instant('validation.numeric');
                }
              }
            },
            templateOptions: {
              required: true,
              maxlength: 4,
              minlength: 4
            },
            expressionProperties: {
              'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
                return angular.isDefined(scope.model.uuid);
              }
            }
          }, {
            className: 'form-inline formly-field service-setup-extension-range-to',
            noFormControl: true,
            template: '<div>to</div>'
          }, {
            className: 'form-inline formly-field formly-field-input',
            type: 'input',
            key: 'endNumber',
            validators: {
              numeric: {
                expression: ValidationService.numeric,
                message: function () {
                  return $translate.instant('validation.numeric');
                }
              },
              greaterThanLessThan: {
                expression: vm.validations.greaterThanLessThan,
                message: function ($viewValue, $modelValue, scope) {
                  return $translate.instant('serviceSetupModal.greaterThanLessThan', {
                    'beginNumber': scope.model.beginNumber,
                    'endNumber': $viewValue
                  });
                }
              }
            },
            templateOptions: {
              maxlength: 4,
              minlength: 4,
              required: true
            },
            expressionProperties: {
              'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
                return angular.isDefined(scope.model.uuid);
              }
            }
          }, {
            type: 'button',
            key: 'deleteBtn',
            templateOptions: {
              btnClass: 'btn-sm btn-link',
              label: $translate.instant('common.delete'),
              onClick: function (options, scope) {
                vm.deleteInternalNumberRange(scope.model);
              }
            },
            controller: /* @ngInject */ function ($scope) {
              if ($scope.formOptions.formState.formIndex === 0 && vm.firstTimeSetup) {
                $scope.to.btnClass = 'btn-sm btn-link hide-delete';
              }
            }
          }]
        }]
      }
    }, {
      type: 'button',
      key: 'addBtn',
      templateOptions: {
        btnClass: 'btn-sm btn-link',
        label: $translate.instant('serviceSetupModal.addMoreExtensionRanges'),
        onClick: function (options, scope) {
          vm.addInternalNumberRange();
        }
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return vm.form.$invalid;
        },
        'hide': 'model.numberRanges.length > 9'
      }
    }];

    vm.additionalFields = [{
      key: 'globalMOH',
      type: 'select',
      className: 'service-setup',
      templateOptions: {
        inputClass: 'service-setup-moh',
        label: $translate.instant('serviceSetupModal.globalMOH'),
        description: $translate.instant('serviceSetupModal.mohDescription'),
        options: mohOptions,
        labelfield: 'label',
        valuefield: 'value'
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return !vm.firstTimeSetup;
        },
        'hide': function ($viewValue, $modelValue, scope) {
          return vm.firstTimeSetup;
        }
      }
    }];

    vm.addInternalNumberRange = addInternalNumberRange;
    vm.deleteInternalNumberRange = deleteInternalNumberRange;
    vm.loadExternalNumberPool = loadExternalNumberPool;
    vm.initNext = initNext;

    function initServiceSetup() {
      var errors = [];
      return HuronCustomer.get().then(function (customer) {
        angular.forEach(customer.links, function (service) {
          if (service.rel === 'voicemail') {
            vm.hasVoicemailService = true;
          }
        });
      }).catch(function (response) {
        errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.customerGetError'));
      }).then(function () {
        return ServiceSetup.listSites().then(function () {
          if (ServiceSetup.sites.length !== 0) {
            return ServiceSetup.getSite(ServiceSetup.sites[0].uuid).then(function (site) {
              vm.firstTimeSetup = false;

              vm.model.site.steeringDigit = site.steeringDigit;
              vm.model.site.siteSteeringDigit = site.siteSteeringDigit;
              vm.model.site.siteCode = site.siteCode;
              // get voicemail pilot number
              if (vm.hasVoicemailService) {
                return ServiceSetup.getVoicemailPilotNumber().then(function (voicemail) {
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
      return ServiceSetup.listInternalNumberRanges().then(function () {
        vm.model.numberRanges = ServiceSetup.internalNumberRanges;
        // sort - order by beginNumber ascending
        vm.model.numberRanges.sort(function (a, b) {
          return a.beginNumber - b.beginNumber;
        });

        if (vm.model.numberRanges.length === 0) {
          vm.model.numberRanges.push({
            beginNumber: DEFAULT_FROM,
            endNumber: DEFAULT_TO
          });
        }
      });
    }

    function addInternalNumberRange() {
      vm.model.numberRanges.push({
        beginNumber: '',
        endNumber: ''
      });
    }

    function deleteInternalNumberRange(internalNumberRange) {
      if (angular.isDefined(internalNumberRange.uuid)) {
        ServiceSetup.deleteInternalNumberRange(internalNumberRange)
          .then(function () {
            var index = _.findIndex(vm.model.numberRanges, function (chr) {
              return (chr.uuid == internalNumberRange.uuid);
            });

            if (index !== -1) {
              vm.model.numberRanges.splice(index, 1);
            }

            if (vm.model.numberRanges.length === 0) {
              vm.model.numberRanges.push({
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
        var index = _.findIndex(vm.model.numberRanges, {
          'beginNumber': internalNumberRange.beginNumber,
          'endNumber': internalNumberRange.endNumber
        });
        if (index !== -1) {
          vm.model.numberRanges.splice(index, 1);
        }
      }
    }

    function initNext() {
      if (vm.form.$invalid) {
        return $q.reject('Field validation failed.');
      } else {
        var deferreds = [];
        var errors = [];
        var promise;

        if (vm.firstTimeSetup) {
          if (vm.pilotNumberSelected) {
            vm.model.site.voicemailPilotNumber = vm.pilotNumberSelected.pattern;
          } else {
            delete vm.model.site.voicemailPilotNumber;
          }
          vm.model.site.timeZone = vm.model.site.timeZone.value;
          promise = ServiceSetup.createSite(vm.model.site).then(function () {
            if (vm.pilotNumberSelected) {
              return ServiceSetup.updateCustomerVoicemailPilotNumber({
                voicemail: {
                  pilotNumber: vm.pilotNumberSelected.pattern
                }
              }).catch(function (response) {
                errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailUpdateError'));
              });
            }
          }).then(function () {
            vm.firstTimeSetup = false;
          }).catch(function (response) {
            vm.firstTimeSetup = true;
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.siteError'));
          });
          deferreds.push(promise);
        }

        if (angular.isArray(vm.model.numberRanges)) {
          angular.forEach(vm.model.numberRanges, function (internalNumberRange) {
            if (angular.isUndefined(internalNumberRange.uuid)) {
              promise = ServiceSetup.createInternalNumberRange(internalNumberRange)
                .catch(function (response) {
                  var error = Notification.processErrorResponse(response, 'serviceSetupModal.extensionAddError', {
                    extension: this.name
                  });
                  errors.push(error);
                }.bind(internalNumberRange));
              deferreds.push(promise);
            }
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
      var promises = [];
      promises.push(initServiceSetup());
      promises.push(listInternalExtentionRanges());
      $q.all(promises).finally(function () {
        vm.processing = false;
      });
    });
  }
})();
