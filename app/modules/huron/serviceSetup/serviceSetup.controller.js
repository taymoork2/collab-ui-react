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
      label: '(GMT-08:00) Pacific Time (US & Canada)',
      timezoneid: '4'
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
        voicemailPilotNumber: undefined
      },
      numberRanges: [],
      globalMOH: mohOptions[0]
    };

    vm.firstTimeSetup = $state.current.data.firstTimeSetup;
    vm.hasVoicemailService = false;

    vm.validations = {
      greaterThan: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        // we only validate this if beginNumber is valid or populated
        if (angular.isUndefined(scope.model.beginNumber) || scope.model.beginNumber === "") {
          return true;
        } else {
          return value >= scope.model.beginNumber;
        }
      },
      lessThan: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        // we only validate this if endNumber is valid or populated
        if (angular.isUndefined(scope.model.endNumber) || scope.model.endNumber === "") {
          // trigger validation on endNumber field
          scope.fields[2].formControl.$validate();
          return true;
        } else {
          return value <= scope.model.endNumber;
        }
      },
      rangeOverlap: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        var result = true;
        for (var i in vm.model.numberRanges) {
          // Don't validate ranges already in the model, ie. those that are already in the system
          if (angular.isUndefined(scope.model.uuid) && !angular.equals(scope.model.uuid, '')) {
            var beginNumber, endNumber;
            if (scope.index === 0) {
              beginNumber = value;
              endNumber = scope.fields[2].formControl.$viewValue;
            } else {
              beginNumber = scope.fields[0].formControl.$viewValue;
              endNumber = value;
            }
            // Skip current range under validation if it's valid, otherwise we get into a validation loop
            if ((beginNumber === vm.model.numberRanges[i].beginNumber) && (endNumber === vm.model.numberRanges[i].endNumber)) {
              continue;
            } else if (isOverlapping(beginNumber, endNumber, vm.model.numberRanges[i].beginNumber, vm.model.numberRanges[i].endNumber)) {
              result = false;
            }
          }
        }
        return result;
      },
      duplicate: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        var property;
        if (scope.index === 0) {
          property = 'beginNumber';
        } else {
          property = 'endNumber';
        }

        if (angular.isDefined(scope.model[property])) {
          return true;
        } else {
          var found = false;
          angular.forEach(vm.model.numberRanges, function (range) {
            if (range[property] === value) {
              found = true;
            }
          });

          if (found) {
            return false;
          } else {
            return true;
          }
        }
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
          $scope.to.options = vm.timeZoneOptions;
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
              },
              lessThan: {
                expression: vm.validations.lessThan,
                message: function ($viewValue, $modelValue, scope) {
                  return $translate.instant('serviceSetupModal.lessThan', {
                    'beginNumber': $viewValue,
                    'endNumber': scope.model.endNumber
                  });
                }
              },
              duplicate: {
                expression: vm.validations.duplicate,
                message: function () {
                  return $translate.instant('serviceSetupModal.rangeDuplicate');
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
            template: '<div>' + $translate.instant('serviceSetupModal.to') + '</div>'
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
              greaterThan: {
                expression: vm.validations.greaterThan,
                message: function ($viewValue, $modelValue, scope) {
                  return $translate.instant('serviceSetupModal.greaterThan', {
                    'beginNumber': scope.model.beginNumber,
                    'endNumber': $viewValue
                  });
                }
              },
              rangeOverlap: {
                expression: vm.validations.rangeOverlap,
                message: function () {
                  return $translate.instant('serviceSetupModal.rangeOverlap');
                }
              },
              duplicate: {
                expression: vm.validations.duplicate,
                message: function () {
                  return $translate.instant('serviceSetupModal.rangeDuplicate');
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
              },
              // this expressionProperty is here simply to be run, the property `data.validate` isn't actually used anywhere
              // it retriggers validation
              'data.validate': function (viewValue, modelValue, scope) {
                return scope.fc && scope.fc.$validate();
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

    function isOverlapping(x1, x2, y1, y2) {
      return Math.max(x1, y1) <= Math.min(x2, y2);
    }

    function initServiceSetup() {
      var errors = [];
      return HuronCustomer.get().then(function (customer) {
        angular.forEach(customer.links, function (service) {
          if (service.rel === 'voicemail') {
            vm.hasVoicemailService = true;
          }
        });
      }).then(function () {
        // TODO BLUE-1221 - make /customer requests synchronous until fixed
        return initTimeZone();
      }).then(function () {
        // TODO BLUE-1221 - make /customer requests synchronous until fixed
        return listInternalExtentionRanges();
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
                    vm.model.site.voicemailPilotNumber = undefined;
                    vm.pilotNumberSelected = undefined;
                  } else {
                    vm.model.site.voicemailPilotNumber = voicemail.pilotNumber;
                    vm.pilotNumberSelected = {
                      uuid: voicemail.name,
                      pattern: voicemail.pilotNumber
                    };
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
              return loadExternalNumberPool();
            }
          }
        });
      });
    }

    function loadExternalNumberPool(pattern) {
      ServiceSetup.loadExternalNumberPool(pattern).then(function () {

        var selectedVoicemailObject;
        vm.externalNumberPool = ServiceSetup.externalNumberPool;
        // if there's nothing selected yet, make the first of list selected
        if (vm.externalNumberPool.length > 0) {
          if (!vm.pilotNumberSelected) {
            vm.pilotNumberSelected = vm.externalNumberPool[0];
          }
        }
        // put the existing pilot number to the end of list
        if (vm.model.site.voicemailPilotNumber) {
          angular.forEach(vm.externalNumberPool, function (value, index) {
            // removes the pilot number from the pool and adds it to the end of list
            if (value.pattern === vm.model.site.voicemailPilotNumber) {
              selectedVoicemailObject = value;
              vm.externalNumberPool.splice(index, 1);
            }
          });
          vm.externalNumberPool.push(selectedVoicemailObject || vm.pilotNumberSelected);
        }
      }).catch(function (response) {
        vm.externalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
    }

    function initTimeZone() {
      return ServiceSetup.getTimeZones().then(function (timezones) {
        vm.timeZoneOptions = timezones;
        return ServiceSetup.listVoicemailTimezone().then(function (usertemplates) {
          if ((angular.isArray(usertemplates)) && (usertemplates.length > 0)) {
            vm.timeZone = '' + usertemplates[0].timeZone;
            vm.objectId = usertemplates[0].objectId;
            var currentTimeZone = timezones.filter(function (timezone) {
              return timezone.timezoneid === vm.timeZone;
            });
            if (currentTimeZone.length > 0) {
              vm.model.site.timeZone = currentTimeZone[0];
            }
          }
        });
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
        Notification.notify([$translate.instant('serviceSetupModal.fieldValidationFailed')], 'error');
        return $q.reject('Field validation failed.');
      } else {
        var deferreds = [];
        var errors = [];
        var promise;
        var currentSite;
        if (vm.firstTimeSetup) {
          if (vm.pilotNumberSelected) {
            vm.model.site.voicemailPilotNumber = vm.pilotNumberSelected.pattern;
          } else {
            delete vm.model.site.voicemailPilotNumber;
          }
          currentSite = angular.copy(vm.model.site);
          currentSite.timeZone = currentSite.timeZone.value;
          promise = ServiceSetup.createSite(currentSite).then(function () {
            var promises = [];
            if (vm.pilotNumberSelected) {
              promises.push(ServiceSetup.updateCustomerVoicemailPilotNumber({
                voicemail: {
                  pilotNumber: vm.pilotNumberSelected.pattern
                }
              }).catch(function (response) {
                errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailUpdateError'));
              }));
            }
            if (vm.model.site.timeZone !== DEFAULT_TZ.value) {
              promises.push(ServiceSetup.updateVoicemailTimezone(vm.model.site.timeZone.timezoneid, vm.objectId)
                .catch(function (response) {
                  errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.timezoneUpdateError'));
                }));
            }
            return $q.all(promises);
          }).catch(function (response) {
            vm.firstTimeSetup = true;
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.siteError'));
          });
          deferreds.push(promise);
        } else if (vm.pilotNumberSelected && vm.pilotNumberSelected.pattern !== vm.model.site.voicemailPilotNumber) {
          promise = ServiceSetup.updateCustomerVoicemailPilotNumber({
            voicemail: {
              pilotNumber: vm.pilotNumberSelected.pattern
            }
          }).catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailUpdateError'));
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
      $q.all(promises).finally(function () {
        vm.processing = false;
      });
    });
  }
})();
