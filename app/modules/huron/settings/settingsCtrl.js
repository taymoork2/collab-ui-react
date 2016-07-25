(function () {
  'use strict';
  angular
    .module('uc.hurondetails')
    .controller('HuronSettingsCtrl', HuronSettingsCtrl);

  /* @ngInject */
  function HuronSettingsCtrl($scope, Authinfo, $q, $translate, Notification, ServiceSetup, PstnSetupService,
    CallerId, ExternalNumberService, HuronCustomer, ValidationService, TelephoneNumberService, DialPlanService,
    ModalService, CeService, HuntGroupServiceV2, DirectoryNumberService, InternationalDialing, VoicemailMessageAction) {

    var vm = this;
    vm.loading = true;

    var DEFAULT_SITE_INDEX = '000001';
    var DEFAULT_TZ = {
      id: 'America/Los_Angeles',
      label: $translate.instant('timeZones.America/Los_Angeles')
    };
    var DEFAULT_SD = '9';
    var DEFAULT_SITE_SD = '8';
    var DEFAULT_EXT_LEN = '4';
    var DEFAULT_SITE_CODE = '100';
    var DEFAULT_FROM = '5000';
    var DEFAULT_TO = '5999';
    var VOICE_ONLY = 'VOICE_ONLY';
    var DEMO_STANDARD = 'DEMO_STANDARD';
    var INTERNATIONAL_DIALING = 'DIALINGCOSTAG_INTERNATIONAL';
    var COMPANY_CALLER_ID_TYPE = 'Company Caller ID';
    var COMPANY_NUMBER_TYPE = 'Company Number';

    var savedModel = null;
    var errors = [];

    vm.init = init;
    vm.save = save;
    vm.resetSettings = resetSettings;

    vm._voicemailNumberWatcher = _voicemailNumberWatcher;
    vm._voicemailEnabledWatcher = _voicemailEnabledWatcher;
    vm._buildTimeZoneOptions = _buildTimeZoneOptions;
    vm._buildServiceNumberOptions = _buildServiceNumberOptions;
    vm._buildVoicemailNumberOptions = _buildVoicemailNumberOptions;
    vm._buildCallerIdOptions = _buildCallerIdOptions;
    vm._callerIdEnabledWatcher = _callerIdEnabledWatcher;
    vm._callerIdNumberWatcher = _callerIdNumberWatcher;

    vm.processing = false;
    vm.hasVoicemailService = false;
    vm.hasVoiceService = false;
    vm.assignedNumbers = [];
    vm.timeZoneOptions = [];
    vm.unassignedExternalNumbers = [];
    vm.allExternalNumbers = [];
    vm.extensionLengthChanged = false;
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
        siteCode: DEFAULT_SITE_CODE,
        timeZone: DEFAULT_TZ,
        voicemailPilotNumber: undefined,
        vmCluster: undefined,
        emergencyCallBackNumber: undefined,
        uuid: undefined
      },
      numberRanges: [],
      previousLength: DEFAULT_EXT_LEN,
      displayNumberRanges: [],
      callerId: {
        callerIdEnabled: null,
        uuid: '',
        callerIdName: '',
        callerIdNumber: ''
      },
      companyVoicemail: {
        companyVoicemailEnabled: false,
        companyVoicemailNumber: undefined,
        voicemailToEmail: false
      },
      internationalDialingEnabled: false,
      internationalDialingUuid: null,
      showServiceAddress: false,
      serviceNumber: undefined,
      serviceNumberWarning: false,
      voicemailTimeZone: undefined,
      disableExtensions: false
    };

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
      },
      phoneNumber: function (viewValue, modelValue, scope) {
        var value = null;
        if (modelValue || viewValue) {
          value = (modelValue || viewValue);
        }
        if (value) {
          return TelephoneNumberService.validateDID(value);
        } else {
          return true;
        }
      }
    };

    vm.steeringDigitChangeValidation = function ($viewValue, $modelValue, scope) {
      if (vm.model.site.steeringDigit !== savedModel.site.steeringDigit) {
        return true;
      }
      return false;
    };

    vm.steerDigitOverLapValidation = function ($viewValue, $modelValue, scope) {
      if (_.get(vm, 'model.site.steeringDigit.length') > 0 &&
        ((_.startsWith(_.get(scope, 'model.beginNumber'), _.get(vm, 'model.site.steeringDigit'))) ||
          (_.startsWith(_.get(scope, 'model.endNumber'), _.get(vm, 'model.site.steeringDigit'))))) {
        return true;
      }
      return false;
    };

    vm.leftPanelFields = [{
      model: vm.model.site,
      key: 'timeZone',
      type: 'select',
      templateOptions: {
        inputClass: 'large-10',
        label: $translate.instant('serviceSetupModal.timeZone'),
        description: $translate.instant('serviceSetupModal.tzDescription'),
        options: [],
        labelfield: 'label',
        valuefield: 'id',
        inputPlaceholder: $translate.instant('serviceSetupModal.searchTimeZone'),
        filter: true
      },
      controller: /* @ngInject */ function ($scope) {
        _buildTimeZoneOptions($scope);
      }

    }, {
      model: vm.model.site,
      key: 'steeringDigit',
      type: 'select',
      templateOptions: {
        inputClass: 'large-10',
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
      model: vm.model.site,
      key: 'extensionLength',
      type: 'select',
      className: 'service-setup service-setup-extension-length',
      templateOptions: {
        label: $translate.instant('serviceSetupModal.extensionLength'),
        description: $translate.instant('serviceSetupModal.extensionLengthDescription'),
        helpText: $translate.instant('serviceSetupModal.extensionLengthServicesHelpText'),
        warnMsg: $translate.instant('serviceSetupModal.extensionLengthChangeWarning'),
        isWarn: false,
        options: vm.availableExtensions,
        onChange: function (options, scope) {
          if (vm.model.site.extensionLength !== vm.model.previousLength) {
            vm.model.previousLength = vm.model.site.extensionLength;
            for (var i = 0; i < vm.model.displayNumberRanges.length; i++) {
              vm.model.displayNumberRanges[i].beginNumber = adjustExtensionRanges(vm.form['formly_formly_ng_repeat' + i]['formly_formly_ng_repeat' + i + '_input_beginNumber_0'].$viewValue, '0');
              vm.model.displayNumberRanges[i].endNumber = adjustExtensionRanges(vm.form['formly_formly_ng_repeat' + i]['formly_formly_ng_repeat' + i + '_input_endNumber_2'].$viewValue, '9');
            }
            scope.resetModel();
            scope.formControl.$setDirty();
          }
          vm.model.site.extensionLength = vm.model.previousLength;
          vm.extensionLengthChanged = true;
        }
      },
      expressionProperties: {
        'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
          return vm.model.disableExtensions;
        }
      }
    }, {
      className: 'service-setup service-setup-extension',
      fieldGroup: [{
        className: 'extension-list',
        key: 'displayNumberRanges',
        type: 'repeater',
        hideExpression: function () {
          return vm.hideFieldInternalNumberRange;
        },
        expressionProperties: {
          'templateOptions.description': function () {
            return $translate.instant('serviceSetupModal.internalNumberRangeDescription', {
              'length': vm.model.site.extensionLength
            });
          }
        },
        templateOptions: {
          label: $translate.instant('serviceSetupModal.internalExtensionRange'),
          fields: [{
            className: 'formly-field-inline',
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
                warnMsg: $translate.instant('directoryNumberPanel.steeringDigitOverlapWarning'),
                isWarn: false
              },
              expressionProperties: {
                'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
                  return vm.model.disableExtensions && angular.isDefined(scope.model.uuid);
                },
                'templateOptions.isWarn': vm.steerDigitOverLapValidation,
                'templateOptions.minlength': function ($viewValue, $modelValue, scope) {
                  return vm.model.site.extensionLength;
                },
                'templateOptions.maxlength': function () {
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
                required: true,
                warnMsg: $translate.instant('directoryNumberPanel.steeringDigitOverlapWarning'),
                isWarn: false
              },
              expressionProperties: {
                'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
                  return vm.model.disableExtensions && angular.isDefined(scope.model.uuid);
                },
                'data.validate': function (viewValue, modelValue, scope) {
                  return scope.fc && scope.fc.$validate();
                },
                'templateOptions.isWarn': vm.steerDigitOverLapValidation,
                'templateOptions.minlength': function ($viewValue, $modelValue, scope) {
                  return vm.model.site.extensionLength;
                },
                'templateOptions.maxlength': function () {
                  return vm.model.site.extensionLength;
                }
              }
            }, {
              type: 'icon-button',
              key: 'deleteBtn',
              className: 'icon-button-delete',
              templateOptions: {
                btnClass: 'icon trash-icon',
                onClick: function (options, scope) {
                  deleteInternalNumberRange(scope.model);
                }
              },
              controller: /* @ngInject */ function ($scope) {
                $scope.$watchCollection(function () {
                  return vm.model.displayNumberRanges;
                }, function (displayNumberRanges) {
                  if (displayNumberRanges.length === 1) {
                    $scope.to.btnClass = 'trash-icon hide-delete';
                  } else if (displayNumberRanges.length > 1 && !vm.firstTimeSetup && angular.isUndefined($scope.model.uuid)) {
                    $scope.to.btnClass = 'trash-icon';
                  } else if (displayNumberRanges.length > 1 && vm.firstTimeSetup && angular.isUndefined($scope.model.uuid)) {
                    $scope.to.btnClass = 'trash-icon';
                  } else if (vm.model.numberRanges.length === 1 && displayNumberRanges.length !== 1) {
                    if (angular.isDefined(vm.model.numberRanges[0].uuid)) {
                      $scope.to.btnClass = 'trash-icon hide-delete';
                    }
                  }
                });
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
          onClick: function () {
            addInternalNumberRange();
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
            $scope.options.templateOptions.disabled = vm.form.$invalid;
          });
        }
      }]
    }, {
      type: 'switch',
      key: 'internationalDialingEnabled',
      className: 'international-dialing',
      templateOptions: {
        label: $translate.instant('internationalDialing.internationalDialing'),
        description: $translate.instant('internationalDialing.internationalDialingDesc')
      },
      expressionProperties: {
        'templateOptions.isDisabled': function () {
          // if the customer is in trial and doesn't have the feature toggle
          // huronInternationalDialingTrialOverride then show toggle as disabled
          return InternationalDialing.isDisableInternationalDialing();
        }
      }
    }];

    vm.rightPanelFields = [{
      key: 'showServiceAddress',
      type: 'nested',
      className: 'max-width-form',
      templateOptions: {
        label: $translate.instant('settingsServiceAddress.label'),
        description: $translate.instant('settingsServiceAddress.description')
      },
      hideExpression: '!model.showServiceAddress',
      data: {
        fields: [{
          noFormControl: true,
          template: '<hr-settings-service-address></hr-settings-service-address>'
        }]
      }
    }, {
      model: vm.model,
      key: 'serviceNumber',
      type: 'select',
      templateOptions: {
        type: 'csSelect',
        inputClass: 'large-5',
        label: $translate.instant('settingsServiceNumber.label'),
        description: $translate.instant('settingsServiceNumber.description'),
        inputPlaceholder: $translate.instant('directoryNumberPanel.searchNumber'),
        options: [],
        labelfield: 'label',
        valuefield: 'pattern',
        filter: true,
        warnMsg: $translate.instant('settingsServiceNumber.warning')
      },
      controller: function ($scope) {
        _buildServiceNumberOptions($scope);
      },
      hideExpression: '!model.showServiceAddress',
      expressionProperties: {
        'templateOptions.isWarn': function () {
          return vm.model.serviceNumberWarning;
        }
      }
    }, {
      key: 'callerId',
      type: 'nested',
      className: 'max-width-form',
      templateOptions: {
        label: $translate.instant('companyCallerId.companyCallerId'),
        description: $translate.instant('companyCallerId.companyCallerIdDesc')
      },
      data: {
        fields: [{
          key: 'callerIdEnabled',
          type: 'switch'
        }, {
          key: 'callerIdName',
          type: 'input',
          templateOptions: {
            inputClass: 'large-7',
            label: $translate.instant('companyCallerId.callerIdName'),
            type: 'text'
          },
          hideExpression: function () {
            return !vm.model.callerId.callerIdEnabled;
          },
          expressionProperties: {
            'templateOptions.required': function () {
              return vm.model.callerId.callerIdEnabled;
            }
          }
        }, {
          key: 'callerIdNumber',
          type: 'select',
          validators: {
            phoneNumber: {
              expression: vm.validations.phoneNumber,
              message: function () {
                return $translate.instant('callerIdPanel.customNumberValidation');
              }
            }
          },
          templateOptions: {
            inputClass: 'large-5',
            label: $translate.instant('companyCallerId.callerIdNumber'),
            combo: true,
            searchableCombo: true
          },
          hideExpression: function () {
            return !vm.model.callerId.callerIdEnabled;
          },
          expressionProperties: {
            'templateOptions.required': function (newValue, oldValue) {
              if (vm.model.callerId.callerIdEnabled) {
                return true;
              }
            }
          },
          controller: function ($scope) {
            _buildCallerIdOptions($scope);
            _callerIdEnabledWatcher($scope);
            _voicemailNumberWatcher($scope);
          }
        }]
      }
    }, {
      key: 'companyVoicemail',
      type: 'nested',
      className: 'max-width-form',
      templateOptions: {
        label: $translate.instant('serviceSetupModal.companyVoicemail'),
        description: $translate.instant('serviceSetupModal.companyVoicemailDescription')
      },
      data: {
        fields: [{
          key: 'companyVoicemailEnabled',
          type: 'switch'
        }, {
          key: 'companyVoicemailNumber',
          type: 'select',
          templateOptions: {
            inputClass: 'large-5',
            options: [],
            inputPlaceholder: $translate.instant('directoryNumberPanel.searchNumber'),
            filter: true,
            labelfield: 'label',
            valuefield: 'pattern',
            warnMsg: $translate.instant('serviceSetupModal.voicemailNoExternalNumbersError'),
            isWarn: false
          },
          hideExpression: function () {
            return !vm.model.companyVoicemail.companyVoicemailEnabled;
          },
          expressionProperties: {
            'templateOptions.required': function () {
              return vm.model.companyVoicemail.companyVoicemailEnabled;
            }
          },
          controller: function ($scope) {
            _buildVoicemailNumberOptions($scope);
            _voicemailEnabledWatcher($scope);
            _callerIdNumberWatcher($scope);
          }
        }, {
          key: 'voicemailToEmail',
          type: 'cs-input',
          templateOptions: {
            label: $translate.instant('serviceSetupModal.voicemailToEmailLabel'),
            type: 'checkbox',
            helpText: $translate.instant('serviceSetupModal.voicemailToEmailHelpText')
          },
          hideExpression: function () {
            return !vm.model.companyVoicemail.companyVoicemailEnabled;
          }
        }]
      }
    }];

    init();

    function clearCallerIdFields() {
      vm.model.callerId.uuid = '';
      vm.model.callerId.callerIdName = '';
      vm.model.callerId.callerIdNumber = '';
    }

    function addInternalNumberRange() {
      vm.model.displayNumberRanges.push({
        beginNumber: '',
        endNumber: ''
      });
    }

    function deleteInternalNumberRange(internalNumberRange) {
      if (angular.isDefined(internalNumberRange.uuid)) {
        ServiceSetup.deleteInternalNumberRange(internalNumberRange).then(function () {
          // delete the range from DB list
          var index = _.findIndex(vm.model.numberRanges, function (chr) {
            return (chr.uuid == internalNumberRange.uuid);
          });
          if (index !== -1) {
            vm.model.numberRanges.splice(index, 1);
            savedModel.numberRanges.splice(index, 1);
          }
          // delete the range from display list
          var index1 = _.findIndex(vm.model.displayNumberRanges, {
            'beginNumber': internalNumberRange.beginNumber,
            'endNumber': internalNumberRange.endNumber
          });
          if (index1 !== -1) {
            vm.model.displayNumberRanges.splice(index1, 1);
            savedModel.displayNumberRanges.splice(index1, 1);
          }

          if (vm.model.displayNumberRanges.length === 0) {
            vm.model.displayNumberRanges.push({
              beginNumber: DEFAULT_FROM,
              endNumber: DEFAULT_TO
            });
          }
          Notification.success('serviceSetupModal.extensionDeleteSuccess', {
            extension: internalNumberRange.name
          });
        }).catch(function (response) {
          Notification.errorResponse(response, 'serviceSetupModal.extensionDeleteError', {
            extension: internalNumberRange.name
          });
        });
      } else {
        // delete the range from display list
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

    function showServiceAddress() {
      vm.model.showServiceAddress = true;
      if (_.isObject(savedModel)) {
        savedModel.showServiceAddress = true;
      }
    }

    function showDisableVoicemailWarning() {
      if (_.get(vm, 'model.site.voicemailPilotNumber') && !vm.model.companyVoicemail.companyVoicemailEnabled) {
        return ModalService.open({
            title: $translate.instant('huronSettings.disableCompanyVoicemailTitle'),
            message: $translate.instant('huronSettings.disableCompanyVoicemailMessage'),
            close: $translate.instant('common.disable'),
            dismiss: $translate.instant('common.cancel'),
            btnType: 'negative'
          })
          .result
          .catch(function () {
            vm.model.companyVoicemail.companyVoicemailEnabled = true;
            vm.model.companyVoicemail.companyVoicemailNumber = {
              pattern: vm.model.site.voicemailPilotNumber,
              label: TelephoneNumberService.getDIDLabel(vm.model.site.voicemailPilotNumber)
            };
            return $q.reject();
          });
      }
    }

    function releaseCallerIdNumber() {
      var existingCallerIdNumber = _.find(vm.allExternalNumbers, function (externalNumber) {
        return externalNumber.uuid === _.get(vm, 'model.callerId.externalNumber.uuid');
      });
      if (_.get(vm, 'model.companyVoicemail.companyVoicemailNumber.pattern') && existingCallerIdNumber &&
        (existingCallerIdNumber.pattern === vm.model.companyVoicemail.companyVoicemailNumber.pattern)) {
        return deleteCallerId();
      }
    }

    function updateVoicemailTimeZone() {
      if (vm.hasVoicemailService && vm.model.companyVoicemail.companyVoicemailEnabled &&
        (_.get(vm, 'model.site.timeZone.id') !== _.get(vm, 'model.voicemailTimeZone.id'))) {
        return $q.when(true)
          .then(function () {
            return updateVoicemailUserTemplate();
          });
      }
    }

    function updateSiteVoicemailNumber(siteData) {
      if (!_.isEmpty(siteData)) {
        return ServiceSetup.updateSite(ServiceSetup.sites[0].uuid, siteData)
          .then(function () {
            // Set the new site voicemail pilot number
            if (siteData.voicemailPilotNumber) {
              vm.model.site.voicemailPilotNumber = siteData.voicemailPilotNumber;
            } else if (siteData.disableVoicemail) {
              vm.model.site.voicemailPilotNumber = undefined;
            }
          })
          // in the case when voicemail is getting enabled, reload voicemail info such as (timezone and vm2email settings)
          // needs to be done in order, usertemplates > messageactions
          .then(loadVoicemailTimeZone)
          .then(loadVoicemailToEmail)
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

    function saveEmergencyCallBack() {
      if (vm.model.serviceNumber && (_.get(vm, 'model.serviceNumber.pattern') !== _.get(vm, 'model.site.emergencyCallBackNumber.pattern'))) {
        var site = {};
        site.emergencyCallBackNumber = {
          pattern: vm.model.serviceNumber.pattern
        };

        return ServiceSetup.updateSite(vm.model.uuid, site)
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'settingsServiceNumber.saveError'));
            return $q.reject(response);
          });
      }
    }

    function updateSite() {
      var siteData = {};
      if (vm.model.site.steeringDigit !== savedModel.site.steeringDigit) {
        siteData.steeringDigit = vm.model.site.steeringDigit;
      }

      if (vm.model.site.timeZone.id !== savedModel.site.timeZone.id) {
        siteData.timeZone = vm.model.site.timeZone.id;
      }

      if (vm.model.site.extensionLength !== savedModel.site.extensionLength) {
        siteData.extensionLength = vm.model.site.extensionLength;
      }

      // Save the existing site voicemail pilot number, before overwritting with the new value
      if (vm.model.companyVoicemail.companyVoicemailEnabled) {
        // When the toggle is ON, update the site if the pilot number changed or wasn't set,
        // otherwise, don't update site since nothing changed.
        if (_.get(vm, 'model.site.voicemailPilotNumber') !== _.get(vm, 'model.companyVoicemail.companyVoicemailNumber.pattern')) {
          siteData.voicemailPilotNumber = vm.model.companyVoicemail.companyVoicemailNumber.pattern;
        }
      } else {
        // When the toggle is OFF, update the site if the customer has voicemail
        // to disable voicemail, otherwise they already have voice only and don't
        // require an update.
        if (vm.hasVoicemailService) {
          siteData.disableVoicemail = true;
        }
      }
      return updateSiteVoicemailNumber(siteData);
    }

    function updateVoicemailUserTemplate() {
      if (_.get(vm, 'model.site.timeZone.id') && _.get(vm, 'voicemailUserTemplate.objectId')) {
        return ServiceSetup.updateVoicemailTimezone(vm.model.site.timeZone.id, vm.voicemailUserTemplate.objectId)
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.timezoneUpdateError'));
            return $q.reject(response);
          });
      }
    }

    function updateCustomerServicePackage(companyVoicemailNumber) {
      var customer = {};
      if (companyVoicemailNumber && _.get(vm, 'model.site.voicemailPilotNumber') !== companyVoicemailNumber) {
        customer.servicePackage = DEMO_STANDARD;
        customer.voicemail = {
          pilotNumber: companyVoicemailNumber
        };
      } else {
        // Assume VOICE_ONLY when no pilot number is set
        customer.servicePackage = VOICE_ONLY;
      }

      return ServiceSetup.updateCustomer(customer)
        .then(loadCustomerServices)
        .catch(function (response) {
          errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailUpdateError'));
          return $q.reject(response);
        });
    }

    function updateCustomerVoicemail() {
      if (vm.model.companyVoicemail.companyVoicemailEnabled) {
        // When the toggle is ON, update the customer if the pilot number changed or wasn't set,
        // otherwise, don't update customer since nothing changed.
        if (_.get(vm, 'model.companyVoicemail.companyVoicemailNumber.pattern') && (_.get(vm, 'model.site.voicemailPilotNumber') !== vm.model.companyVoicemail.companyVoicemailNumber.pattern)) {
          return updateCustomerServicePackage(vm.model.companyVoicemail.companyVoicemailNumber.pattern);
        }
      } else {
        // When the toggle is OFF, update the customer if the customer has voicemail
        // to disable voicemail, otherwise they already have voice only and don't
        // require an update.
        if (vm.hasVoicemailService) {
          return updateCustomerServicePackage();
        }
      }
    }

    function loadServiceAddress() {
      return PstnSetupService.listCustomerCarriers(Authinfo.getOrgId())
        .then(function (carriers) {
          if (_.get(carriers, '[0].apiExists') === true) {
            showServiceAddress();
          }
        })
        .catch(_.noop);
    }

    function loadCustomerServices() {
      return HuronCustomer.get()
        .then(function (customer) {
          vm.customer = customer;
          _.forEach(customer.links, function (service) {
            if (service.rel === 'voicemail') {
              vm.hasVoicemailService = true;
            } else if (service.rel === 'voice') {
              vm.hasVoiceService = true;
            }
          });
        })
        .catch(function (response) {
          errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.customerGetError'));
          return $q.reject(response);
        });
    }

    function loadSite() {
      return ServiceSetup.listSites().then(function () {
        if (ServiceSetup.sites.length !== 0) {
          return ServiceSetup.getSite(ServiceSetup.sites[0].uuid)
            .then(function (site) {
              vm.firstTimeSetup = false;
              vm.model.site.steeringDigit = site.steeringDigit;
              vm.model.site.siteSteeringDigit = site.siteSteeringDigit;
              vm.model.site.extensionLength = vm.model.previousLength = site.extensionLength;
              _.remove(vm.steeringDigits, function (digit) {
                return digit === site.siteSteeringDigit;
              });
              vm.model.site.timeZone = _.find(vm.timeZoneOptions, function (timezone) {
                return timezone.id === site.timeZone;
              });
              vm.model.site.siteCode = site.siteCode;
              vm.model.site.vmCluster = site.vmCluster;
              vm.model.site.emergencyCallBackNumber = site.emergencyCallBackNumber;
              vm.model.uuid = site.uuid;

              if (_.get(site, 'emergencyCallBackNumber.pattern')) {
                vm.model.serviceNumber = {
                  pattern: site.emergencyCallBackNumber.pattern,
                  label: TelephoneNumberService.getDIDLabel(site.emergencyCallBackNumber.pattern)
                };
              } else {
                vm.model.serviceNumberWarning = true;
              }
            });
        }
      });
    }

    function loadVoicemailNumber() {
      return ServiceSetup.getVoicemailPilotNumber().then(function (voicemail) {
        if (voicemail.pilotNumber === Authinfo.getOrgId()) {
          // There may be existing customers who have yet to set the company voicemail number;
          // likely they have it set to orgId.
          vm.model.site.voicemailPilotNumber = undefined;
        } else if (voicemail.pilotNumber) {
          vm.model.site.voicemailPilotNumber = voicemail.pilotNumber;
          vm.model.companyVoicemail.companyVoicemailEnabled = true;

          vm.model.companyVoicemail.companyVoicemailNumber = {
            pattern: voicemail.pilotNumber,
            label: TelephoneNumberService.getDIDLabel(voicemail.pilotNumber)
          };
        }
      }).catch(function (response) {
        errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailGetError'));
        return $q.reject(response);
      });
    }

    function loadTimeZoneOptions() {
      return ServiceSetup.getTimeZones()
        .then(function (timeZones) {
          vm.timeZoneOptions = ServiceSetup.getTranslatedTimeZones(timeZones);
        });
    }

    function loadVoicemailTimeZone() {
      if (vm.hasVoicemailService && vm.model.companyVoicemail.companyVoicemailEnabled) {
        return ServiceSetup.listVoicemailTimezone()
          .then(function (userTemplates) {
            if (_.isArray(userTemplates) && userTemplates.length > 0) {
              vm.voicemailUserTemplate = {
                objectId: userTemplates[0].objectId,
                timeZone: _.toString(userTemplates[0].timeZone),
                timeZoneName: userTemplates[0].timeZoneName
              };

              vm.model.voicemailTimeZone = _.find(vm.timeZoneOptions, function (timezone) {
                return timezone.id === _.get(vm, 'voicemailUserTemplate.timeZoneName');
              });

            }
          })
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailTimeZoneGetError'));
            return $q.reject(response);
          });
      }
    }

    function loadVoicemailToEmail() {
      if (vm.hasVoicemailService && vm.model.companyVoicemail.companyVoicemailEnabled &&
        _.get(vm, 'voicemailUserTemplate.objectId')) {
        return VoicemailMessageAction.get(vm.voicemailUserTemplate.objectId)
          .then(function (messageAction) {
            // set to the value of existing vm2email settings
            if (_.isUndefined(vm.voicemailMessageAction)) {
              vm.model.companyVoicemail.voicemailToEmail = VoicemailMessageAction.isVoicemailToEmailEnabled(messageAction.voicemailAction);
            }
            vm.voicemailMessageAction = messageAction;
          })
          .catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailToEmailGetError'));
            return $q.reject(response);
          });
      } else {
        vm.model.companyVoicemail.voicemailToEmail = false;
        vm.voicemailMessageAction = {};
      }
    }

    function loadInternalNumbers() {
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

    function loadCallerId() {
      return CallerId.listCompanyNumbers().then(function (companyNumbers) {
        var companyCallerId = _.find(companyNumbers, function (companyNumber) {
          return companyNumber.externalCallerIdType === COMPANY_CALLER_ID_TYPE || (companyNumber.externalCallerIdType === COMPANY_NUMBER_TYPE);
        });
        if (companyCallerId) {
          vm.model.callerId.callerIdEnabled = true;

          // uuid is only set if an existing callerIdNumber is found during this loading
          vm.model.callerId.uuid = companyCallerId.uuid;
          vm.model.callerId.callerIdName = companyCallerId.name;
          vm.model.callerId.callerIdNumber = TelephoneNumberService.getDIDLabel(companyCallerId.pattern);
          vm.existingCallerIdName = companyCallerId.name;

          // set only if there is an existing callerIdNumber
          vm.model.callerId.externalNumber = companyCallerId.externalNumber;
        } else {
          vm.model.callerId.callerIdEnabled = false;
        }
      });
    }

    function adjustExtensionRanges(range, char) {
      var length = parseInt(vm.model.site.extensionLength);

      return (length < range.length) ? range.slice(0, length) : _.padRight(range, length, char);
    }

    function loadExternalNumbers(pattern) {
      return ExternalNumberService.refreshNumbers(Authinfo.getOrgId()).then(function () {
        vm.unassignedExternalNumbers = ExternalNumberService.getUnassignedNumbers();
        vm.allExternalNumbers = ExternalNumberService.getAllNumbers();
        vm.assignedExternalNumbers = ExternalNumberService.getAssignedNumbers();
      }).catch(function (response) {
        vm.unassignedExternalNumbers = [];
        vm.allExternalNumbers = [];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
    }

    function loadDialPlan() {
      return DialPlanService.getCustomerDialPlanDetails(Authinfo.getOrgId()).then(function (response) {
        if (response.extensionGenerated === 'true') {
          vm.hideFieldInternalNumberRange = true;
        } else {
          vm.hideFieldInternalNumberRange = false;
        }
        if (response.steeringDigitRequired === 'true') {
          vm.hideFieldSteeringDigit = false;
        } else {
          vm.hideFieldSteeringDigit = true;
        }
      }).catch(function (response) {
        vm.hideFieldInternalNumberRange = false;
        vm.hideFieldSteeringDigit = false;
        Notification.errorResponse(response, 'serviceSetupModal.customerDialPlanDetailsGetError');
      });
    }

    function loadInternationalDialing() {
      return ServiceSetup.listCosRestrictions().then(function (cosRestriction) {

        if (_.get(cosRestriction, 'restrictions[0].restriction') === INTERNATIONAL_DIALING) {
          vm.model.internationalDialingEnabled = false;
          vm.model.internationalDialingUuid = cosRestriction.restrictions[0].uuid;
        } else {
          vm.model.internationalDialingEnabled = true;
          vm.model.internationalDialingUuid = null;
        }
      });
    }

    function loadCompanyInfo() {
      return loadCustomerServices()
        .then(function () {
          var promises = [];
          clearCallerIdFields();

          if (vm.hasVoiceService) {
            promises.push(loadTimeZoneOptions()
              .then(loadSite)
              .then(loadVoicemailTimeZone)
              .then(loadVoicemailToEmail)
            );

            promises.push(loadInternalNumbers());
            promises.push(loadInternationalDialing());
            promises.push(loadDialPlan());
            promises.push(loadCallerId());
          }

          if (vm.hasVoicemailService) {
            promises.push(loadVoicemailNumber());
          }

          return $q.all(promises);
        });
    }

    function saveVoicemailNumber() {
      return $q.when(true)
        .then(showDisableVoicemailWarning)
        .then(updateCustomerVoicemail)
        .then(updateSite)
        .then(updateVoicemailTimeZone)
        .then(updateVoicemailToEmail)
        .catch(_.noop);
    }

    function saveExternalNumbers() {
      return $q.when(true)
        .then(releaseCallerIdNumber)
        .then(saveVoicemailNumber)
        .then(saveCallerId)
        .then(saveEmergencyCallBack);
    }

    function saveCompanyNumbers() {
      return saveExternalNumbers()
        .catch(_.noop)
        .then(loadExternalNumbers)
        .then(loadSite);
    }

    function saveInternalNumberRanges() {
      return $q.when(true)
        .then(function () {
          var promises = [];
          var hasNewInternalNumberRange = false;

          if (angular.isArray(vm.model.displayNumberRanges)) {
            _.forEach(vm.model.displayNumberRanges, function (internalNumberRange) {
              if (angular.isUndefined(internalNumberRange.uuid)) {
                hasNewInternalNumberRange = true;
                promises.push(ServiceSetup.createInternalNumberRange(internalNumberRange)
                  .catch(function (response) {
                    errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.extensionAddError', {
                      extension: this.name
                    }));
                  }));
              } else if (vm.extensionLengthChanged) {
                promises.push(ServiceSetup.deleteInternalNumberRange(internalNumberRange).then(function () {
                  internalNumberRange.uuid = undefined;
                  internalNumberRange.links = undefined;
                  internalNumberRange.url = undefined;
                  ServiceSetup.createInternalNumberRange(internalNumberRange)
                    .catch(function (response) {
                      errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.extensionUpdateError', {
                        extension: this.name
                      }));
                    });
                }).catch(function (response) {
                  errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.extensionUpdateError', {
                    extension: this.name
                  }));
                }));
              }
            });
          }

          return $q.all(promises)
            .finally(function () {
              if (hasNewInternalNumberRange) {
                loadInternalNumbers()
                  .then(function () {
                    savedModel = angular.copy(vm.model);
                  });
              }
            });
        });
    }

    function deleteCallerId() {
      // uuid is only set if there is an existing callerIdNumber
      if (vm.model.callerId.uuid) {
        return CallerId.deleteCompanyNumber(vm.model.callerId.uuid)
          .then(function () {
            vm.model.callerId.uuid = '';
          })
          .catch(function (response) {
            return $q.reject(response);
          });
      }
    }

    function saveCallerId() {
      var rawPattern = TelephoneNumberService.getDIDValue(vm.model.callerId.callerIdNumber);

      var existingCallerIdNumber = _.find(vm.allExternalNumbers, function (externalNumber) {
        return externalNumber.uuid === _.get(vm, 'model.callerId.externalNumber.uuid');
      });

      return $q.when(true)
        .then(function () {
          if (vm.model.callerId.callerIdEnabled && (vm.model.callerId.callerIdName && vm.model.callerId.callerIdNumber)) {
            // save if unable to find a matching existing number OR if the number is changing
            if (_.isUndefined(existingCallerIdNumber) || existingCallerIdNumber.pattern !== rawPattern) {
              var data = {
                name: vm.model.callerId.callerIdName,
                externalCallerIdType: COMPANY_CALLER_ID_TYPE,
                pattern: rawPattern
              };

              return $q.when(true)
                .then(deleteCallerId)
                .then(function () {
                  return CallerId.saveCompanyNumber(data);
                })
                .then(loadCallerId)
                .catch(function (response) {
                  return $q.reject(response);
                });
            } else {
              // update if the name is changing
              if (vm.model.callerId.uuid && (vm.existingCallerIdName !== vm.model.callerId.callerIdName)) {
                var data = {
                  name: vm.model.callerId.callerIdName
                };
                return CallerId.updateCompanyNumber(vm.model.callerId.uuid, data);
              }
            }
          } else if (!_.isEmpty(_.get(vm, 'model.callerId.externalNumber.uuid'))) {
            return $q.when(true)
              .then(deleteCallerId)
              .then(clearCallerIdFields);
          }
        })
        .catch(function (response) {
          errors.push(Notification.processErrorResponse(response, 'huronSettings.companyCallerIdsaveError'));
        });
    }

    function saveInternationalDialing() {
      var cosType = {
        restriction: INTERNATIONAL_DIALING
      };

      return $q.when(true)
        .then(InternationalDialing.isDisableInternationalDialing)
        .then(function (isSaveDisabled) {
          if (!isSaveDisabled) {
            return ServiceSetup.updateCosRestriction(vm.model.internationalDialingEnabled, vm.model.internationalDialingUuid, cosType)
              .then(loadInternationalDialing);
          }
        });
    }

    function updateVoicemailToEmail() {
      return $q.when(true)
        .then(function () {
          if (shouldUpdateVoicemailToEmail()) {
            return VoicemailMessageAction.update(vm.model.companyVoicemail.voicemailToEmail, vm.voicemailUserTemplate.objectId, vm.voicemailMessageAction.objectId)
              .then(function () {
                vm.voicemailMessageAction.voicemailAction = VoicemailMessageAction.getVoicemailActionEnum(vm.model.companyVoicemail.voicemailToEmail);
              })
              .catch(function (response) {
                errors.push(Notification.processErrorResponse(response, 'huronSettings.voicemailToEmailUpdateError'));
                return $q.reject(response);
              });
          }
        });
    }

    function shouldUpdateVoicemailToEmail() {
      // validate parameters exist and model value is changing
      return vm.hasVoicemailService && vm.model.companyVoicemail.companyVoicemailEnabled &&
        _.get(vm, 'voicemailMessageAction.voicemailAction') && _.get(vm, 'voicemailMessageAction.objectId') && _.get(vm, 'voicemailUserTemplate.objectId') &&
        (vm.model.companyVoicemail.voicemailToEmail !== VoicemailMessageAction.isVoicemailToEmailEnabled(vm.voicemailMessageAction.voicemailAction));
    }

    function init() {
      vm.loading = true;
      errors = [];

      var promises = [];
      promises.push(loadCompanyInfo());
      promises.push(loadServiceAddress());
      promises.push(loadExternalNumbers());
      promises.push(enableExtensionLengthModifiable());

      $q.all(promises)
        .finally(function () {
          if (errors.length > 0) {
            Notification.notify(errors, 'error');
          }
          vm.loading = false;
          savedModel = angular.copy(vm.model);
        });
    }

    function save() {
      vm.processing = true;
      errors = [];
      var promises = [];
      promises.push(saveCompanyNumbers());
      promises.push(saveInternalNumberRanges());
      promises.push(saveInternationalDialing());

      $q.all(promises)
        .then(function () {
          if (errors.length > 0) {
            Notification.notify(errors, 'error');
          } else {
            Notification.success('huronSettings.saveSuccess');
            resetForm();
          }
        })
        .finally(function () {
          vm.processing = false;
          savedModel = angular.copy(vm.model);
        });
    }

    function resetForm() {
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function resetSettings() {
      setModel(savedModel);
      resetForm();
    }

    function setModel(data) {
      vm.model.site.siteIndex = savedModel.site.siteIndex;
      vm.model.site.steeringDigit = savedModel.site.steeringDigit;
      vm.model.site.siteSteeringDigit = savedModel.site.siteSteeringDigit;
      vm.model.site.siteCode = savedModel.site.siteCode;
      vm.model.site.timeZone = savedModel.site.timeZone;
      vm.model.site.voicemailPilotNumber = savedModel.site.voicemailPilotNumber;
      vm.model.site.vmCluster = savedModel.site.vmCluster;
      vm.model.site.emergencyCallBackNumber = savedModel.site.emergencyCallBackNumber;
      vm.model.site.uuid = savedModel.site.uuid;
      vm.model.site.extensionLength = savedModel.site.extensionLength;

      angular.copy(savedModel.numberRanges, vm.model.numberRanges);
      angular.copy(savedModel.displayNumberRanges, vm.model.displayNumberRanges);

      vm.model.callerId.callerIdEnabled = savedModel.callerId.callerIdEnabled;
      vm.model.callerId.uuid = savedModel.callerId.uuid;
      vm.model.callerId.callerIdName = savedModel.callerId.callerIdName;
      vm.model.callerId.callerIdNumber = savedModel.callerId.callerIdNumber;

      vm.model.companyVoicemail.companyVoicemailEnabled = savedModel.companyVoicemail.companyVoicemailEnabled;
      vm.model.companyVoicemail.companyVoicemailNumber = savedModel.companyVoicemail.companyVoicemailNumber;
      vm.model.companyVoicemail.voicemailToEmail = savedModel.companyVoicemail.voicemailToEmail;

      vm.model.internationalDialingEnabled = savedModel.internationalDialingEnabled;
      vm.model.internationalDialingUuid = savedModel.internationalDialingUuid;
      vm.model.showServiceAddress = savedModel.showServiceAddress;
      vm.model.serviceNumber = savedModel.serviceNumber;
      vm.model.serviceNumberWarning = savedModel.serviceNumberWarning;
    }

    $scope.$watchCollection(function () {
      return [vm.model.serviceNumber, vm.unassignedExternalNumbers];
    }, function (serviceNumber) {

      // indication that the service number is set, but not assigned to any device
      var found = Boolean(_.find(vm.unassignedExternalNumbers, function (externalNumber) {
        return externalNumber.pattern === _.get(serviceNumber[0], 'pattern');
      }));

      vm.model.serviceNumberWarning = found ? true : _.isUndefined(vm.model.serviceNumber);
    });

    // The following functions are used to make unit testing easier and should not be used
    // outside of formly other than for unit testing.

    // used by callerId formly controller to remove the selected
    // voicemail number from the list of options
    function _voicemailNumberWatcher(localScope) {
      localScope.$watch(function () {
        return vm.model.companyVoicemail.companyVoicemailNumber;
      }, function (newValue, oldValue) {
        if (newValue && newValue.label) {
          // callerIdNumber options are stored as a label ONLY
          _.remove(localScope.to.options, function (externalNumberLabel) {
            return externalNumberLabel === newValue.label;
          });
        }
        // if the value isn't changing ignore it, otherwise add the old value
        // back into the list of available options
        if ((newValue !== oldValue) && (oldValue && oldValue.label)) {
          if (!_.find(localScope.to.options, function (externalNumberLabel) {
              return externalNumberLabel === oldValue.label;
            })) {
            localScope.to.options.push(oldValue.label);
          }
        }
      });
    }

    // used by voicemail formly controller to remove the selected
    // callerId from the list of options
    function _callerIdNumberWatcher(localScope) {
      localScope.$watch(function () {
        return vm.model.callerId.callerIdNumber;
      }, function (newValue, oldValue) {
        if (newValue) {
          _.remove(localScope.to.options, function (externalNumber) {
            return externalNumber.label === newValue;
          });
        }
        if ((newValue !== oldValue) && oldValue) {
          if (!_.find(localScope.to.options, function (externalNumber) {
              return externalNumber.label === oldValue;
            }) && _.find(vm.unassignedExternalNumbers, function (externalNumber) {
              return externalNumber.label === oldValue;
            })) {
            if (_.get(vm, 'model.serviceNumber.pattern') !== oldValue) {
              localScope.to.options.push({
                pattern: TelephoneNumberService.getDIDValue(oldValue),
                label: oldValue
              });
            }
          }
        }
      });
    }

    function _buildCallerIdOptions(localScope) {
      localScope.$watchCollection(function () {
        return vm.allExternalNumbers;
      }, function (externalNumberPool) {
        localScope.to.options = [];
        _.forEach(externalNumberPool, function (externalNumber) {
          // remove the voicemailPilotNumber from the list of available options
          if (externalNumber.pattern !== _.get(vm, 'model.site.voicemailPilotNumber')) {
            localScope.to.options.push(externalNumber.label);
          }
        });
      });
    }

    function _buildVoicemailNumberOptions(localScope) {
      localScope.$watchCollection(function () {
        return vm.unassignedExternalNumbers;
      }, function (externalNumberPool) {
        // remove the emergency callback number from the list of options
        localScope.to.options = _.reject(externalNumberPool, function (externalNumber) {
          return externalNumber.pattern === _.get(vm, 'model.serviceNumber.pattern') ||
            (externalNumber.label === vm.model.callerId.callerIdNumber);
        });
        // add the existing voicemailPilotNumber back into the list of options
        if (vm.model.site.voicemailPilotNumber && !_.find(localScope.to.options, function (externalNumber) {
            return externalNumber.pattern === vm.model.site.voicemailPilotNumber;
          })) {
          var tmpExternalNumber = {
            pattern: vm.model.site.voicemailPilotNumber,
            label: TelephoneNumberService.getDIDLabel(vm.model.site.voicemailPilotNumber)
          };
          localScope.to.options.push(tmpExternalNumber);
        }
        // if a warning existed, then numbers became available remove the warning
        if (localScope.to.options.length > 0) {
          localScope.options.templateOptions.isWarn = false;
        }
      });
    }

    function _buildTimeZoneOptions(localScope) {
      localScope.$watchCollection(function () {
        return vm.timeZoneOptions;
      }, function (timeZones) {
        localScope.to.options = timeZones;
      });
    }

    function _buildServiceNumberOptions(localScope) {
      localScope.$watchCollection(function () {
        return vm.assignedExternalNumbers;
      }, function (externalNumberPool) {
        localScope.to.options = _.chain(externalNumberPool)
          // remove the voicemail number if it exists
          .reject(function (externalNumber) {
            return externalNumber.pattern === _.get(vm, 'model.site.voicemailPilotNumber');
          })
          .value();
        // add the existing emergencyCallBackNumber back into the list of options
        if (_.get(vm, 'model.site.emergencyCallBackNumber.pattern') && !_.find(localScope.to.options, function (externalNumber) {
            return externalNumber.pattern === vm.model.site.emergencyCallBackNumber.pattern;
          })) {
          var tmpExternalNumber = {
            pattern: vm.model.site.emergencyCallBackNumber.pattern,
            label: TelephoneNumberService.getDIDLabel(vm.model.site.emergencyCallBackNumber.pattern)
          };
          localScope.to.options.push(tmpExternalNumber);
        }
      });
    }

    function _voicemailEnabledWatcher(localScope) {
      localScope.$watch(function () {
        return vm.model.companyVoicemail.companyVoicemailEnabled;
      }, function (toggleValue) {
        if (toggleValue) {
          var showWarning = false;
          if (localScope.to.options.length > 0) {
            if (_.isUndefined(vm.model.companyVoicemail.companyVoicemailNumber)) {
              // pre-select a number which isn't callerIdNumber or serviceNumber if those were just selected
              vm.model.companyVoicemail.companyVoicemailNumber = _.find(localScope.to.options, function (externalNumber) {
                return externalNumber.label !== vm.model.callerId.callerIdNumber ||
                  (externalNumber.pattern !== _.get(vm, 'model.serviceNumber.pattern'));
              });
            }
          } else {
            showWarning = true;
          }
          localScope.options.templateOptions.isWarn = showWarning;
        } else {
          vm.model.companyVoicemail.companyVoicemailNumber = undefined;
        }
      });
    }

    function _callerIdEnabledWatcher(localScope) {
      localScope.$watch(function () {
        return vm.model.callerId.callerIdEnabled;
      }, function (toggleValue) {
        if (toggleValue) {
          if (vm.model.callerId.uuid === '' && (vm.model.callerId.callerIdName === '')) {
            vm.model.callerId.callerIdName = Authinfo.getOrgName();
          }

          if (localScope.to.options.length > 0 && (vm.model.callerId.callerIdNumber === '')) {
            // pre-select a number which isn't companyVoicemailNumber
            var found = _.find(localScope.to.options, function (externalNumberLabel) {
              return externalNumberLabel !== _.get(vm, 'model.companyVoicemail.companyVoicemailNumber.label');
            });
            vm.model.callerId.callerIdNumber = _.isUndefined(found) ? '' : found;
          }
        } else {
          vm.model.callerId.callerIdNumber = '';
        }
      });
    }

    function testForExtensions() {
      return DirectoryNumberService.query({
          customerId: Authinfo.getOrgId()
        }).$promise
        .then(function (extensionList) {
          if (angular.isArray(extensionList) && extensionList.length > 0) {
            vm.model.disableExtensions = true;
          }
        });
    }

    function testForAutoAttendant() {
      return CeService.query({
          customerId: Authinfo.getOrgId()
        }).$promise
        .then(function (autoAttendant) {
          if (angular.isArray(autoAttendant) && autoAttendant.length > 0) {
            vm.model.disableExtensions = true;
          }
        }).catch(function (response) {
          // auto attendant does not exist
        });
    }

    function testForHuntGroup() {
      return HuntGroupServiceV2.query({
          customerId: Authinfo.getOrgId()
        }).$promise
        .then(function (huntGroup) {
          if (angular.isArray(huntGroup) && huntGroup.length > 0) {
            vm.model.disableExtensions = true;
          }
        }).catch(function (response) {
          // hunt group does not exist
        });
    }

    function enableExtensionLengthModifiable() {
      var promises = [];
      promises.push(testForExtensions());
      promises.push(testForAutoAttendant());
      promises.push(testForHuntGroup());

      return $q.all(promises);
    }

  }
})();
