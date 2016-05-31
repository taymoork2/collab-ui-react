(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('ServiceSetupCtrl', ServiceSetupCtrl);

  /* @ngInject*/
  function ServiceSetupCtrl($q, $state, ServiceSetup, Notification, Authinfo, $translate,
    HuronCustomer, ValidationService, ExternalNumberPool, DialPlanService, TelephoneNumberService,
    ExternalNumberService, ModalService, FeatureToggleService) {
    var vm = this;
    var DEFAULT_SITE_INDEX = '000001';
    var DEFAULT_TZ = {
      value: 'America/Los_Angeles',
      label: '(GMT-08:00) Pacific Time (US & Canada)',
      timezoneid: '4'
    };
    var DEFAULT_SD = '9';
    var DEFAULT_SITE_SD = '8';
    var DEFAULT_EXT_LEN = '4';
    var DEFAULT_SITE_CODE = '100';
    var DEFAULT_FROM = '5000';
    var DEFAULT_TO = '5999';

    var VOICE_ONLY = 'VOICE_ONLY';
    var DEMO_STANDARD = 'DEMO_STANDARD';

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
    vm.externalNumberPool = [];
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');
    vm.steeringDigits = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];
    vm.availableExtensions = [
      '3', '4', '5'
    ];

    vm.model = {
      site: {
        siteIndex: DEFAULT_SITE_INDEX,
        steeringDigit: DEFAULT_SD,
        siteSteeringDigit: DEFAULT_SITE_SD,
        extensionLength: DEFAULT_EXT_LEN,
        siteCode: DEFAULT_SITE_CODE,
        timeZone: DEFAULT_TZ,
        voicemailPilotNumber: undefined,
        vmCluster: undefined,
        emergencyCallBackNumber: undefined
      },
      //var to hold ranges in sync with DB
      numberRanges: [],
      previousLength: DEFAULT_EXT_LEN,
      //var to hold ranges in view display
      displayNumberRanges: [],
      globalMOH: mohOptions[0],
      ftswCompanyVoicemail: {
        ftswCompanyVoicemailEnabled: false,
        ftswCompanyVoicemailNumber: undefined
      },
      ftswSteeringDigit: undefined,
      hideExtensionLength: true
    };

    vm.firstTimeSetup = $state.current.data.firstTimeSetup;
    vm.hasVoicemailService = false;
    vm.hasVoiceService = false;
    vm.hasSites = false;
    vm.customer = undefined;
    vm.hideFieldInternalNumberRange = false;
    vm.hideFieldSteeringDigit = false;
    vm.timeZoneToggleEnabled = false;
    vm.previousTimeZone = DEFAULT_TZ;

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
        }
        return true;
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
            } else if (ServiceSetup.isOverlapping(beginNumber, endNumber, vm.model.numberRanges[i].beginNumber, vm.model.numberRanges[i].endNumber)) {
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
      },
      singleNumberRangeCheck: function (viewValue, modelValue, scope) {
        var value = modelValue || viewValue;
        var result = true;
        var beginNumber, endNumber;

        if (scope.index === 0) {
          beginNumber = value;
          endNumber = scope.fields[2].value();
        } else {
          beginNumber = scope.fields[0].value();
          endNumber = value;
        }

        if (beginNumber === endNumber) {
          result = false;
        } else {
          result = true;
        }
        return result;
      }
    };

    vm.steerDigitOverLapValidation = function ($viewValue, $modelValue, scope) {
      if (_.get(vm, 'model.site.steeringDigit.length') > 0 &&
        ((_.startsWith(_.get(scope, 'model.beginNumber'), _.get(vm, 'model.site.steeringDigit'))) ||
          (_.startsWith(_.get(scope, 'model.endNumber'), _.get(vm, 'model.site.steeringDigit'))))) {
        return true;
      }
      return false;
    };

    vm.steeringDigitChangeValidation = function ($viewValue, $modelValue, scope) {
      if (vm.firstTimeSetup) {
        return false;
      } else if (vm.model.site.steeringDigit !== vm.model.ftswSteeringDigit) {
        return true;
      }
      return false;
    };

    vm.initialFields = [{
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
          $scope.$watchCollection(function () {
            return vm.timeZoneOptions;
          }, function (timeZones) {
            $scope.to.options = timeZones;
          });
        },
        expressionProperties: {
          'templateOptions.required': function () {
            return vm.timeZoneToggleEnabled;
          },
          'templateOptions.disabled': function () {
            return !vm.timeZoneToggleEnabled && !vm.firstTimeSetup;
          }
        }
      }, {
        key: 'steeringDigit',
        type: 'select',
        className: 'service-setup-steering-digit',
        templateOptions: {
          label: $translate.instant('serviceSetupModal.steeringDigit'),
          description: $translate.instant('serviceSetupModal.steeringDigitDescription'),
          warnMsg: $translate.instant('serviceSetupModal.steeringDigitChangeWarning'),
          isWarn: false,
          options: vm.steeringDigits
        },
        hideExpression: function () {
          return vm.hideFieldSteeringDigit;
        },
        expressionProperties: {
          'templateOptions.isWarn': vm.steeringDigitChangeValidation
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
        hideExpression: function ($viewValue, $modelValue, scope) {
          return true;
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return vm.hasSites;
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
        hideExpression: function ($viewValue, $modelValue, scope) {
          return true;
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return vm.hasSites;
          }
        }
      }]
    }, {
      model: vm.model.site,
      key: 'extensionLength',
      type: 'select',
      className: 'service-setup service-setup-extension-length',
      templateOptions: {
        label: $translate.instant('serviceSetupModal.extensionLength'),
        description: $translate.instant('serviceSetupModal.extensionLengthDescription'),
        warnMsg: $translate.instant('serviceSetupModal.extensionLengthChangeWarning'),
        isWarn: false,
        options: vm.availableExtensions,
        onChange: function (options, scope) {
          if (vm.model.site.extensionLength !== vm.model.previousLength) {
            return ModalService.open({
                title: $translate.instant('common.warning'),
                message: $translate.instant('serviceSetupModal.extensionLengthChangeWarning'),
                close: $translate.instant('common.continue'),
                dismiss: $translate.instant('common.cancel'),
                type: 'negative'
              })
              .result.then(function () {
                vm.model.previousLength = vm.model.site.extensionLength;
                for (var i = 0; i < vm.model.displayNumberRanges.length; i++) {
                  vm.model.displayNumberRanges[i].beginNumber = adjustExtensionRanges(vm.form['formly_formly_ng_repeat' + i]['formly_formly_ng_repeat' + i + '_input_beginNumber_0'].$viewValue, '0');
                  vm.model.displayNumberRanges[i].endNumber = adjustExtensionRanges(vm.form['formly_formly_ng_repeat' + i]['formly_formly_ng_repeat' + i + '_input_endNumber_2'].$viewValue, '9');
                }
              })
              .catch(function () {
                vm.model.site.extensionLength = vm.model.previousLength;
                return $q.reject();
              });
          }
        }
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return angular.isDefined(_.get(scope.originalModel.displayNumberRanges, "[0].uuid", undefined));
        },
        // hide function added to expressionPropertties because hideExpression does not dependably hide
        // the element on load, and will evaluate only after the model updates after first load
        'hide': function () {
          return vm.model.hideExtensionLength;
        }
      }
    }, {
      key: 'displayNumberRanges',
      type: 'repeater',
      className: 'service-setup service-setup-extension',
      templateOptions: {
        label: $translate.instant('serviceSetupModal.internalExtensionRange'),
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
              },
              singleNumberRangeCheck: {
                expression: vm.validations.singleNumberRangeCheck,
                message: function () {
                  return $translate.instant('serviceSetupModal.singleNumberRangeError');
                }
              }
            },
            templateOptions: {
              required: true,
              warnMsg: $translate.instant('directoryNumberPanel.steeringDigitOverlapWarning', {
                steeringDigitInTranslation: vm.model.site.steeringDigit
              })
            },
            expressionProperties: {
              'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
                return angular.isDefined(scope.model.uuid);
              },
              'templateOptions.isWarn': vm.steerDigitOverLapValidation,
              'templateOptions.minlength': function() {
                return vm.model.site.extensionLength;
              },
              'templateOptions.maxlength': function() {
                return vm.model.site.extensionLength;
              }
            }
          }, {
            className: 'form-inline formly-field service-setup-extension-range-to',
            noFormControl: true,
            template: '<span>' + $translate.instant('serviceSetupModal.to') + '</span>'
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
              },
              singleNumberRangeCheck: {
                expression: vm.validations.singleNumberRangeCheck,
                message: function () {
                  return $translate.instant('serviceSetupModal.singleNumberRangeError');
                }
              }
            },
            templateOptions: {
              warnMsg: $translate.instant('directoryNumberPanel.steeringDigitOverlapWarning', {
                steeringDigitInTranslation: vm.model.site.steeringDigit
              }),
              required: true
            },
            expressionProperties: {
              'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
                return angular.isDefined(scope.model.uuid);
              },
              // this expressionProperty is here simply to be run, the property `data.validate` isn't actually used anywhere
              // it retriggers validation
              'data.validate': function (viewValue, modelValue, scope) {
                if (scope.fc) {
                  if (_.isArray(scope.fc)) {
                    return scope.fc[0].$validate();
                  } else {
                    return scope.fc.$validate();
                  }
                } else return false;
              },
              'templateOptions.isWarn': vm.steerDigitOverLapValidation,
              'templateOptions.minlength': function() {
                return vm.model.site.extensionLength;
              },
              'templateOptions.maxlength': function() {
                return vm.model.site.extensionLength;
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
              $scope.$watchCollection(function () {
                return vm.model.displayNumberRanges;
              }, function (displayNumberRanges) {
                if (displayNumberRanges.length === 1) {
                  $scope.to.btnClass = 'btn-sm btn-link hide-delete';
                } else if (displayNumberRanges.length > 1 && !vm.firstTimeSetup && angular.isUndefined($scope.model.uuid)) {
                  $scope.to.btnClass = 'btn-sm btn-link ';
                } else if (displayNumberRanges.length > 1 && vm.firstTimeSetup && angular.isUndefined($scope.model.uuid)) {
                  $scope.to.btnClass = 'btn-sm btn-link ';
                } else if (vm.model.numberRanges.length === 1 && displayNumberRanges.length !== 1) {
                  if (angular.isDefined(vm.model.numberRanges[0].uuid)) {
                    $scope.to.btnClass = 'btn-sm btn-link hide-delete';
                  }

                }
              });
            }
          }]
        }]
      },
      expressionProperties: {
        'templateOptions.description': function () {
          return $translate.instant('serviceSetupModal.internalNumberRangeDescription', {
            'length': vm.model.site.extensionLength
          });
        }
      },
      hideExpression: function () {
        return vm.hideFieldInternalNumberRange;
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
      hideExpression: function () {
        if (vm.model.displayNumberRanges.length > 9) {
          return true;
        } else {
          return vm.hideFieldInternalNumberRange;
        }
      },
      controller: function ($scope) {
        $scope.$watch(function () {
          return vm.form.$invalid;
        }, function () {
          if (vm.form.$invalid) {
            $scope.options.templateOptions.disabled = true;
          } else {
            $scope.options.templateOptions.disabled = false;
          }
        });
      }
    }, {
      // Since it is possible to have both the FTSW and
      // huron settings page in the DOM at the same time the id
      // or key has to be unique to avoid having the same id
      // for these elements. See settingsCtrl.js
      key: 'ftswCompanyVoicemail',
      type: 'nested',
      className: 'service-setup',
      templateOptions: {
        inputClass: 'service-setup-company-voicemail',
        label: $translate.instant('serviceSetupModal.companyVoicemail'),
        description: $translate.instant('serviceSetupModal.companyVoicemailDescription')
      },
      data: {
        fields: [{
          key: 'ftswCompanyVoicemailEnabled',
          type: 'switch'
        }, {
          key: 'ftswCompanyVoicemailNumber',
          type: 'select',
          className: 'service-setup-company-voicemail-number',
          templateOptions: {
            options: [],
            inputPlaceholder: $translate.instant('directoryNumberPanel.searchNumber'),
            labelfield: 'label',
            valuefield: 'uuid',
            filter: true,
            warnMsg: $translate.instant('serviceSetupModal.voicemailNoExternalNumbersError'),
            isWarn: false
          },
          hideExpression: function () {
            return !vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled;
          },
          expressionProperties: {
            'templateOptions.required': function () {
              return vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled;
            }
          },
          controller: function ($scope) {
            $scope.$watchCollection(function () {
              return vm.externalNumberPool;
            }, function (externalNumberPool) {
              // remove the emergency callback number from the list of options
              $scope.to.options = _.reject(externalNumberPool, function (externalNumber) {
                return externalNumber.pattern === _.get(vm, 'model.site.emergencyCallBackNumber.pattern');
              });
              // add the existing voicemailPilotNumber back into the list of options
              if (vm.model.site.voicemailPilotNumber && !_.find($scope.to.options, function (externalNumber) {
                  return externalNumber.pattern === vm.model.site.voicemailPilotNumber;
                })) {
                var tmpExternalNumber = {
                  pattern: vm.model.site.voicemailPilotNumber,
                  label: TelephoneNumberService.getDIDLabel(vm.model.site.voicemailPilotNumber)
                };
                $scope.to.options.push(tmpExternalNumber);
              }
              // if a warning existed, then numbers became available remove the warning
              if ($scope.to.options.length > 0) {
                $scope.options.templateOptions.isWarn = false;
              }
            });

            $scope.$watch(function () {
              return vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled;
            }, function (toggleValue) {
              if (toggleValue) {
                var showWarning = false;
                if ($scope.to.options.length > 0) {
                  if (_.isUndefined(vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber)) {
                    vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = $scope.to.options[0];
                  }
                } else {
                  showWarning = true;
                }
                $scope.options.templateOptions.isWarn = showWarning;
              }
            });
          }
        }]
      }
    }, {
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
      hideExpression: function ($viewValue, $modelValue, scope) {
        return vm.firstTimeSetup;
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return !vm.firstTimeSetup;
        }
      }
    }];

    vm.addInternalNumberRange = addInternalNumberRange;
    vm.deleteInternalNumberRange = deleteInternalNumberRange;
    vm.loadExternalNumberPool = loadExternalNumberPool;
    vm.initServiceSetup = initServiceSetup;
    vm.initNext = initNext;

    function getBeautifiedExternalNumber(pattern) {
      var didLabel = TelephoneNumberService.getDIDLabel(pattern);
      var externalNumber = _.findWhere(vm.externalNumberPoolBeautified, {
        pattern: didLabel
      });
      return externalNumber;
    }

    function initServiceSetup() {
      var errors = [];
      return HuronCustomer.get().then(function (customer) {
        vm.customer = customer;
        angular.forEach(customer.links, function (service) {
          if (service.rel === 'voicemail') {
            vm.hasVoicemailService = true;
          } else if (service.rel === 'voice') {
            vm.hasVoiceService = true;
          }
        });
      }).catch(function (response) {
        errors.push(Notification.errorResponse(response, 'serviceSetupModal.customerGetError'));
      }).then(function () {
        // Get the timezone feature toggle setting
        return enableTimeZoneFeatureToggle();
      }).then(function () {
        // Get the extemsion length feature toggle setting
        return enableExtensionLengthFeatureToggle();
      }).then(function () {
        // TODO BLUE-1221 - make /customer requests synchronous until fixed
        return initTimeZone();
      }).then(function () {
        // TODO BLUE-1221 - make /customer requests synchronous until fixed
        return listInternalExtensionRanges();
      }).then(function () {
        return setServiceValues();
      }).then(function () {
        return ServiceSetup.listSites().then(function () {
          if (ServiceSetup.sites.length !== 0) {
            return ServiceSetup.getSite(ServiceSetup.sites[0].uuid).then(function (site) {
              vm.firstTimeSetup = false;
              vm.hasSites = true;

              vm.model.site.steeringDigit = site.steeringDigit;
              vm.model.ftswSteeringDigit = site.steeringDigit;
              vm.model.site.siteSteeringDigit = site.siteSteeringDigit;
              vm.model.site.extensionLength = site.extensionLength;
              _.remove(vm.steeringDigits, function (digit) {
                return digit === site.siteSteeringDigit;
              });
              vm.model.site.siteCode = site.siteCode;
              vm.model.site.vmCluster = site.vmCluster;
              vm.model.site.emergencyCallBackNumber = site.emergencyCallBackNumber;
              vm.model.site.timeZone = _.find(vm.timeZoneOptions, function (timezone) {
                return timezone.value === site.timeZone;
              });
              vm.previousTimeZone = vm.model.site.timeZone;
            });
          }
        });
      }).then(function () {
        if (vm.hasVoicemailService) {
          return ServiceSetup.getVoicemailPilotNumber().then(function (voicemail) {
            if (voicemail.pilotNumber === Authinfo.getOrgId()) {
              // There may be existing customers who have yet to set the company
              // voicemail number; likely they have it set to orgId.
              // Remove this logic once we can confirm no existing customers are configured
              // this way.
              vm.model.site.voicemailPilotNumber = undefined;
            } else if (voicemail.pilotNumber) {
              vm.model.site.voicemailPilotNumber = voicemail.pilotNumber;
              vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;

              vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber = {
                pattern: voicemail.pilotNumber,
                label: TelephoneNumberService.getDIDLabel(voicemail.pilotNumber)
              };
            }
          }).catch(function (response) {
            Notification.errorResponse(response, 'serviceSetupModal.voicemailGetError');
          });
        }
      }).then(function () {
        vm.fields = vm.initialFields;
        return loadExternalNumberPool();
      });
    }

    function adjustExtensionRanges(range, char) {
      var length = parseInt(vm.model.site.extensionLength);

      return (length < range.length) ? range.slice(0, length) : _.padRight(range, length, char);
    }

    function loadExternalNumberPool(pattern) {
      return ExternalNumberService.refreshNumbers(Authinfo.getOrgId()).then(function () {
        vm.externalNumberPool = ExternalNumberService.getUnassignedNumbers();
      }).catch(function (response) {
        vm.externalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
    }

    function initTimeZone() {
      return ServiceSetup.getTimeZones().then(function (timezones) {
        vm.timeZoneOptions = timezones;
        if (vm.hasVoicemailService) {
          return listVoicemailTimezone(timezones);
        }
      });
    }

    function enableTimeZoneFeatureToggle() {
      return FeatureToggleService.supports(FeatureToggleService.features.atlasHuronDeviceTimeZone).then(function (result) {
        if (result) {
          vm.timeZoneToggleEnabled = result;
        }
      }).catch(function (response) {
        Notification.errorResponse(response, 'serviceSetupModal.errorGettingTimeZoneToggle');
      });
    }

    function enableExtensionLengthFeatureToggle() {
      return FeatureToggleService.supports(FeatureToggleService.features.extensionLength).then(function (result) {
        vm.model.hideExtensionLength = !result;
      }).catch(function (response) {
        // extension length feature toggle not enabled for customer
      });
    }

    function listVoicemailTimezone(timezones) {
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
    }

    function listInternalExtensionRanges() {
      return ServiceSetup.listInternalNumberRanges().then(function () {
        vm.model.numberRanges = ServiceSetup.internalNumberRanges;

        // do not show singlenumber intenalranges
        vm.model.displayNumberRanges = vm.model.numberRanges.filter(function (obj) {
          return obj.beginNumber != obj.endNumber;
        });

        // sort - order by beginNumber ascending
        vm.model.displayNumberRanges.sort(function (a, b) {
          return a.beginNumber - b.beginNumber;
        });

        if (vm.model.displayNumberRanges.length === 0) {
          vm.model.displayNumberRanges.push({
            beginNumber: DEFAULT_FROM,
            endNumber: DEFAULT_TO
          });
        }
      }).catch(function (response) {
        if (response.status === 404) {
          vm.model.displayNumberRanges.push({
            beginNumber: DEFAULT_FROM,
            endNumber: DEFAULT_TO
          });
        }
      });
    }

    function addInternalNumberRange() {
      vm.model.displayNumberRanges.push({
        beginNumber: '',
        endNumber: ''
      });
    }

    function deleteInternalNumberRange(internalNumberRange) {
      if (angular.isDefined(internalNumberRange.uuid)) {
        ServiceSetup.deleteInternalNumberRange(internalNumberRange)
          .then(function () {
            // delete the range from DB list
            var index = _.findIndex(vm.model.numberRanges, function (chr) {
              return (chr.uuid == internalNumberRange.uuid);
            });
            if (index !== -1) {
              vm.model.numberRanges.splice(index, 1);
            }
            //delete the range from display list
            var index1 = _.findIndex(vm.model.displayNumberRanges, {
              'beginNumber': internalNumberRange.beginNumber,
              'endNumber': internalNumberRange.endNumber
            });
            if (index1 !== -1) {
              vm.model.displayNumberRanges.splice(index1, 1);
            }

            if (vm.model.displayNumberRanges.length === 0) {
              vm.model.displayNumberRanges.push({
                beginNumber: '',
                endNumber: ''
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
        //delete the range from display list
        var index = _.findIndex(vm.model.displayNumberRanges, {
          'beginNumber': internalNumberRange.beginNumber,
          'endNumber': internalNumberRange.endNumber
        });
        if (index !== -1) {
          vm.model.displayNumberRanges.splice(index, 1);
        }

        // delete the range from DB list too if there
        var index1 = _.findIndex(vm.model.numberRanges, {
          'beginNumber': internalNumberRange.beginNumber,
          'endNumber': internalNumberRange.endNumber
        });
        if (index1 !== -1) {
          vm.model.numberRanges.splice(index1, 1);
        }

      }
    }

    function setServiceValues() {
      DialPlanService.getCustomerDialPlanDetails(Authinfo.getOrgId()).then(function (response) {
        if (response.extensionGenerated === 'true') {
          vm.hideFieldInternalNumberRange = true;
        } else {
          vm.hideFieldInternalNumberRange = false;
        }
        if (response.steeringDigitRequired === 'true') {
          vm.hideFieldSteeringDigit = false;
        } else {
          vm.hideFieldSteeringDigit = true;
          vm.model.site.steeringDigit = undefined;
        }
        if (response.supportSiteSteeringDigit !== 'true') {
          vm.model.site.siteSteeringDigit = undefined;
        }
        if (response.supportSiteCode !== 'true') {
          vm.model.site.siteCode = undefined;
        }
      }).catch(function (response) {
        vm.hideFieldInternalNumberRange = false;
        vm.hideFieldSteeringDigit = false;
        Notification.errorResponse(response, 'serviceSetupModal.customerDialPlanDetailsGetError');
      });
    }

    function displayDisableVoicemailWarning() {
      if (_.get(vm, 'model.site.voicemailPilotNumber') && !_.get(vm, 'model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled')) {
        return ModalService.open({
            title: $translate.instant('huronSettings.disableCompanyVoicemailTitle'),
            message: $translate.instant('huronSettings.disableCompanyVoicemailMessage'),
            close: $translate.instant('common.disable'),
            dismiss: $translate.instant('common.cancel'),
            type: 'negative'
          })
          .result
          .catch(function () {
            vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled = true;
            vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber.pattern = TelephoneNumberService.getDIDLabel(vm.model.site.voicemailPilotNumber);
            return $q.reject();
          });
      }
    }

    function initNext() {
      if (vm.form.$invalid) {
        Notification.notify([$translate.instant('serviceSetupModal.fieldValidationFailed')], 'error');
        return $q.reject('Field validation failed.');
      }

      var errors = [];
      var voicemailToggleEnabled = false;
      if (_.get(vm, 'model.ftswCompanyVoicemail.ftswCompanyVoicemailEnabled') && _.get(vm, 'model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber')) {
        voicemailToggleEnabled = true;
      }

      function updateCustomer(companyVoicemailNumber) {
        var customer = {};
        if (companyVoicemailNumber && _.get(vm, 'model.site.voicemailPilotNumber') !== companyVoicemailNumber) {
          if (!vm.hasVoicemailService) {
            customer.servicePackage = DEMO_STANDARD;
          }

          customer.voicemail = {
            pilotNumber: companyVoicemailNumber
          };
        } else {
          // Assume VOICE_ONLY when no pilot number is set
          customer.servicePackage = VOICE_ONLY;
        }

        return ServiceSetup.updateCustomer(customer)
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailUpdateError'));
            return $q.reject(response);
          });
      }

      function saveCustomer() {
        if (voicemailToggleEnabled) {
          // When the toggle is ON, update the customer if the site voicemail pilot number changed or wasn't set,
          // otherwise, don't update customer since nothing changed.
          if (_.get(vm, 'model.site.voicemailPilotNumber') !== _.get(vm, 'model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber.pattern')) {
            return updateCustomer(vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber.pattern);
          }
        } else {
          // When the toggle is OFF, update the customer if the customer has the voicemail service package
          // to disable voicemail, otherwise they are already voice only and don't
          // require an update.
          if (vm.hasVoicemailService) {
            return updateCustomer();
          }
        }
      }

      function createSite(site) {
        if (voicemailToggleEnabled) {
          // Set the site voicemail pilot number when the
          // toggle is ON, otherwise remove it from the site payload.
          vm.model.site.voicemailPilotNumber = _.get(vm, 'model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber.pattern');
        } else {
          delete vm.model.site.voicemailPilotNumber;
        }

        var currentSite = angular.copy(site);
        currentSite.timeZone = currentSite.timeZone.value;

        return ServiceSetup.createSite(currentSite)
          .catch(function (response) {
            vm.hasSites = false;
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.siteError'));
            return $q.reject(response);
          });
      }

      function updateSite(siteData) {
        if (!_.isEmpty(siteData)) {
          return ServiceSetup.updateSite(ServiceSetup.sites[0].uuid, siteData)
            .catch(function (response) {
              // unset the site voicemail pilot number
              vm.model.site.voicemailPilotNumber = undefined;
              errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.siteUpdateError'));
              return $q.reject(response);
            });
        } else {
          return $q.when();
        }
      }

      function saveSite() {
        if (!vm.hasSites) {
          // Always create the site if one doesn't exist.
          return createSite(vm.model.site);
        } else {
          var siteData = {};
          //this value is not gonna change when timezone select combo is disabled
          // so no need to check for timeZoneToggle here
          if (_.get(vm, 'model.site.timeZone.value') !== _.get(vm, 'previousTimeZone.value')) {
            siteData.timeZone = vm.model.site.timeZone.value;
          }
          if (vm.model.site.steeringDigit !== vm.model.ftswSteeringDigit) {
            siteData.steeringDigit = vm.model.site.steeringDigit;
          }
          if (voicemailToggleEnabled) {
            // When the toggle is ON, update the site if the pilot number changed or wasn't set,
            // otherwise, don't update site since nothing changed.
            if (_.get(vm, 'model.site.voicemailPilotNumber') !== _.get(vm, 'model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber.pattern')) {
              siteData.voicemailPilotNumber = vm.model.ftswCompanyVoicemail.ftswCompanyVoicemailNumber.pattern;
            }
          } else {
            // When the toggle is OFF, update the site if the customer has voicemail service package
            // to disable voicemail, otherwise they are already voice only and don't
            // require an update.
            if (vm.hasVoicemailService) {
              siteData.disableVoicemail = true;
            }
          }
          return updateSite(siteData);
        }
      }

      function updateTimezone(timeZoneId) {
        if (!timeZoneId) {
          errors.push(Notification.error('serviceSetupModal.timezoneUpdateError'));
          return $q.reject('No timezoneid set');
        }

        return ServiceSetup.updateVoicemailTimezone(timeZoneId, vm.objectId)
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.timezoneUpdateError'));
            return $q.reject(response);
          });
      }

      function saveTimezone() {
        if ((_.get(vm, 'model.site.timeZone.value') !== _.get(vm, 'previousTimeZone.value')) && voicemailToggleEnabled && vm.hasVoicemailService) {

          return updateTimezone(_.get(vm, 'model.site.timeZone.timezoneid'));
        }
      }

      function createInternalNumbers(internalNumberRange) {
        return ServiceSetup.createInternalNumberRange(internalNumberRange)
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.extensionAddError', {
              extension: this.name
            }));
          }.bind(internalNumberRange));
      }

      function saveInternalNumbers() {
        return $q.when(true).then(function () {
          if (vm.hideFieldInternalNumberRange === false && (angular.isArray(_.get(vm, 'model.displayNumberRanges')))) {
            angular.forEach(vm.model.displayNumberRanges, function (internalNumberRange) {
              if (angular.isUndefined(internalNumberRange.uuid)) {
                return createInternalNumbers(internalNumberRange);
              }
            });
          }
        });
      }

      function createExternalNumber(externalNumber) {
        //TODO: Update the external number pool with the number that got added
        return ExternalNumberPool.create(Authinfo.getOrgId(), externalNumber)
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response));
          });
      }

      function setupVoiceService() {
        if (!vm.hasVoiceService) {
          return HuronCustomer.put(vm.customer.name)
            .catch(function (response) {
              vm.hasVoiceService = false;
              errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.customerPutError'));
              return $q.reject(response);
            }).then(function () {
              vm.hasVoiceService = true;
              if (_.get(vm, 'model.site.voicemailPilotNumber')) {
                return createExternalNumber(vm.model.site.voicemailPilotNumber);
              }
            });
        }
      }

      // Saving the company site has to be in done in a particular order
      // and if one step fails we should prevent other steps from executing,
      // hence the noop catch in the end to allow previous re-thrown rejections
      // to be ignored after processing this promise chain.
      function saveCompanySite() {
        return $q.when(true)
          .then(displayDisableVoicemailWarning)
          .then(saveCustomer)
          .then(saveSite)
          .then(saveTimezone)
          .catch(_.noop);
      }

      // Here the form can be processed in parallel,
      // most new save actions should be added in this function.
      function saveForm() {
        var promises = [];
        promises.push(saveInternalNumbers());
        promises.push(saveCompanySite());

        return $q.all(promises);
      }

      function processErrors() {
        if (errors.length > 0) {
          Notification.notify(errors, 'error');
          return $q.reject('Site/extension create failed.');
        }
      }

      // This is the main promise chain, the flow is to the ensure
      // voice service is setup, then process the form.
      // Errors are collected in an array and processed in the end.
      return $q.when(true)
        .then(setupVoiceService)
        .then(saveForm)
        .catch(_.noop)
        .then(processErrors);
    }

    $q.all(initServiceSetup()).finally(function () {
      vm.processing = false;
      if (vm.firstTimeSetup) {
        _.remove(vm.steeringDigits, function (digit) {
          return digit === DEFAULT_SITE_SD;
        });
      }
    });
  }
})();
