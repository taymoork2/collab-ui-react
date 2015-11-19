(function () {
  'use strict';
  angular
    .module('uc.hurondetails')
    .controller('HuronSettingsCtrl', HuronSettingsCtrl);

  /* @ngInject */
  function HuronSettingsCtrl($scope, Authinfo, $q, $translate, HttpUtils, Notification, ServiceSetup,
    CallerId, ExternalNumberService, HuronCustomer, ValidationService, TelephoneNumberService, DialPlanService) {

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
    var companyCallerIdType = 'Company Caller ID';
    vm.processing = false;
    vm.hideFieldSteeringDigit = undefined;
    vm.loading = true;
    vm.init = init;
    vm.save = save;
    vm.resetSettings = resetSettings;
    vm.timeZoneOptions = [];
    vm.pilotNumberSelected = undefined;
    vm.externalNumberPool = [];
    vm.externalNumberPoolBeautified = [];
    vm.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');
    vm.hasVoicemailService = false;
    vm.hasVoiceService = false;
    vm.customer = undefined;
    vm.model = {
      site: {
        siteIndex: DEFAULT_SITE_INDEX,
        steeringDigit: DEFAULT_SD,
        siteSteeringDigit: DEFAULT_SITE_SD,
        siteCode: DEFAULT_SITE_CODE,
        timeZone: DEFAULT_TZ,
        voicemailPilotNumber: undefined
      },
      //var to hold ranges in sync with DB
      numberRanges: [],
      //var to hold ranges in view display
      displayNumberRanges: [],
      callerId: {
        callerIdEnabled: null,
        uuid: '',
        callerIdName: '',
        callerIdNumber: ''
      }
    };
    var savedModel = null;
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

    vm.leftPanelFields = [{
      model: vm.model.site,
      className: 'service-setup',
      fieldGroup: [{
        key: 'timeZone',
        type: 'select',
        className: 'service-setup-timezone-column',
        templateOptions: {
          label: $translate.instant('serviceSetupModal.timeZone'),
          description: $translate.instant('serviceSetupModal.tzDescription'),
          options: [],
          labelfield: 'label',
          valuefield: 'value',
          inputPlaceholder: $translate.instant('serviceSetupModal.searchTimeZone'),
          filter: true
        },
        controller: /* @ngInject */ function ($scope) {
          $scope.to.options = vm.timeZoneOptions;
        },
        expressionProperties: {
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return true;
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
          'hide': function () {
            return vm.hideFieldSteeringDigit;
          },
          'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
            return true;
          }
        }
      }]
    }, {
      key: 'displayNumberRanges',
      type: 'repeater',
      className: 'service-setup service-setup-extension',
      hideExpression: function () {
        return vm.hideFieldInternalNumberRange;
      },
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
              maxlength: 4,
              minlength: 4
            },
            expressionProperties: {
              'templateOptions.disabled': function ($viewValue, $modelValue, scope) {
                return angular.isDefined(scope.model.uuid);
              },
              'data.validate': function (viewValue, modelValue, scope) {
                return scope.fc && scope.fc.$validate();
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
        onClick: function (options, scope) {
          addInternalNumberRange();
        }
      },
      expressionProperties: {
        'hide': function () {
          if (vm.model.displayNumberRanges.length > 9) {
            return true;
          } else {
            return vm.hideFieldInternalNumberRange;
          }
        }
      }
    }];

    vm.rightPanelFields = [{
      key: 'callerId',
      type: 'nested',
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
          className: 'caller-id-name nested',
          templateOptions: {
            label: $translate.instant('companyCallerId.callerIdName'),
            type: 'text'
          },
          expressionProperties: {
            'templateOptions.required': function () {
              if (vm.model.callerId.callerIdEnabled) {
                return true;
              }
            },
            'hide': function () {
              return !vm.model.callerId.callerIdEnabled;
            }
          }
        }, {
          key: 'callerIdNumber',
          type: 'custom-combobox',
          className: 'caller-id-number nested',
          validators: {
            phoneNumber: {
              expression: vm.validations.phoneNumber,
              message: function () {
                return $translate.instant('callerIdPanel.customNumberValidation');
              }
            }
          },
          templateOptions: {
            label: $translate.instant('companyCallerId.callerIdNumber'),
            combo: true,
            searchableCombo: true
          },
          expressionProperties: {
            'templateOptions.required': function (newValue, oldValue) {
              if (vm.model.callerId.callerIdEnabled) {
                return true;
              }
            },
            'hide': function () {
              return !vm.model.callerId.callerIdEnabled;
            }
          },
          controller: function ($scope) {
            ExternalNumberService.refreshNumbers(Authinfo.getOrgId()).then(function () {
              vm.externalNumberPool = ExternalNumberService.getAllNumbers();
              vm.externalNumberPoolBeautified = _.map(vm.externalNumberPool, function (en) {
                var externalNumber = angular.copy(en);
                externalNumber.pattern = TelephoneNumberService.getDIDLabel(externalNumber.pattern);
                return externalNumber;
              });
              $scope.to.list = _.map(vm.externalNumberPool, function (en) {
                return TelephoneNumberService.getDIDLabel(en.pattern);
              });
            });
          }
        }]
      }
    }];

    function init() {
      var promises = [];
      vm.loading = true;
      var errors = [];
      promises.push(HuronCustomer.get().then(function (customer) {
        vm.customer = customer;
        angular.forEach(customer.links, function (service) {
          if (service.rel === 'voicemail') {
            vm.hasVoicemailService = true;
          } else if (service.rel === 'voice') {
            vm.hasVoiceService = true;
          }
        });
      }).then(function () {
        return initTimeZone();
      }).then(function () {
        return listInternalExtensionRanges();
      }).then(function () {
        return setServiceValues();
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
            });
          }
        });
      }).then(function () {
        // get voicemail pilot number
        if (vm.hasVoicemailService) {
          return ServiceSetup.getVoicemailPilotNumber().then(function (voicemail) {
            // if the pilotNumber == customer org uuid, then voicemail is not set
            if (voicemail.pilotNumber === Authinfo.getOrgId()) {
              vm.model.site.voicemailPilotNumber = '';
              vm.pilotNumberSelected = undefined;
            } else {
              vm.model.site.voicemailPilotNumber = TelephoneNumberService.getDIDLabel(voicemail.pilotNumber);
              vm.pilotNumberSelected = {
                uuid: voicemail.name,
                pattern: TelephoneNumberService.getDIDLabel(voicemail.pilotNumber)
              };
            }
          }).catch(function (response) {
            vm.externalNumberPool = [];
            vm.pilotNumberSelected = undefined;
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailGetError'));
          });
        }
      }));

      // Caller ID
      clearCallerIdFields();
      promises.push(getCompanyCallerId());

      $q.all(promises).finally(function () {
        if (errors.length > 0) {
          Notification.notify(errors, 'error');
        }
        savedModel = angular.copy(vm.model);
        vm.loading = false;
      });
    }

    function save() {
      vm.processing = true;
      var promises = [];
      var errors = [];
      var hasNewInternalNumberRange = false;

      // Internal Extension Range
      if (angular.isArray(vm.model.displayNumberRanges)) {
        _.filter(vm.model.displayNumberRanges, function (internalNumberRange) {
          return angular.isUndefined(internalNumberRange.uuid);
        }).forEach(function (internalNumberRange) {
          hasNewInternalNumberRange = true;
          promises.push(ServiceSetup.createInternalNumberRange(internalNumberRange).catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.extensionAddError', {
              extension: this.name
            }));
          }.bind(internalNumberRange)));
        });
      }

      // Company Caller ID
      promises.push(saveCompanyCallerId().catch(function (response) {
        errors.push(Notification.processErrorResponse(response, 'huronSettings.companyCallerIdsaveError'));
      }));

      // Voicemail Pilot Number
      if (vm.hasVoicemailService && vm.pilotNumberSelected && vm.pilotNumberSelected.pattern !== vm.model.site.voicemailPilotNumber) {
        var patternExternalNumber = _.result(_.find(vm.externalNumberPool, function (externalNumber) {
          return externalNumber.uuid === vm.pilotNumberSelected.uuid;
        }), 'pattern');
        if (patternExternalNumber) {
          promises.push(ServiceSetup.updateCustomerVoicemailPilotNumber({
            voicemail: {
              pilotNumber: patternExternalNumber
            }
          }).then(function () {
            vm.model.site.voicemailPilotNumber = vm.pilotNumberSelected.pattern;
          }).catch(function (response) {
            errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.voicemailUpdateError'));
          }));
        }
      }

      $q.all(promises).then(function () {
        if (errors.length > 0) {
          Notification.notify(errors, 'error');
        } else {
          Notification.notify([$translate.instant('huronSettings.saveSuccess')], 'success');
          resetForm();
        }
      }).finally(function () {
        if (hasNewInternalNumberRange) {
          listInternalExtensionRanges().then(function () {
            vm.processing = false;
            savedModel = angular.copy(vm.model);
          });
        } else {
          vm.processing = false;
          savedModel = angular.copy(vm.model);
        }
      });
    }

    function initTimeZone() {
      return ServiceSetup.getTimeZones().then(function (timezones) {
        vm.timeZoneOptions = timezones;
        if (vm.hasVoicemailService) {
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
        ServiceSetup.deleteInternalNumberRange(internalNumberRange).then(function () {
          // delete the range from DB list
          var index = _.findIndex(vm.model.numberRanges, function (chr) {
            return (chr.uuid == internalNumberRange.uuid);
          });
          if (index !== -1) {
            vm.model.numberRanges.splice(index, 1);
            savedModel.numberRanges.splice(index, 1);
          }
          //delete the range from display list
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
          Notification.notify([$translate.instant('serviceSetupModal.extensionDeleteSuccess', {
            extension: internalNumberRange.name
          })], 'success');
        }).catch(function (response) {
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

    function getCompanyCallerId() {
      return CallerId.listCompanyNumbers().then(function (companyNumbers) {
        var companyCallerId = _.find(companyNumbers, function (companyNumber) {
          return companyNumber.externalCallerIdType === companyCallerIdType;
        });
        if (companyCallerId) {
          vm.model.callerId.callerIdEnabled = true;
          vm.model.callerId.uuid = companyCallerId.uuid;
          vm.model.callerId.callerIdName = companyCallerId.name;
          vm.model.callerId.callerIdNumber = TelephoneNumberService.getDIDLabel(companyCallerId.pattern);
        } else {
          vm.model.callerId.callerIdEnabled = false;
        }
      });
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
        }
      }).catch(function (response) {
        vm.hideFieldInternalNumberRange = false;
        vm.hideFieldSteeringDigit = false;
        Notification.errorResponse(response, 'serviceSetupModal.customerDialPlanDetailsGetError');
      });
    }

    function saveCompanyCallerId() {
      var rawPattern = '';
      var uuidExternalNumber = '';
      var data;
      var deferred = $q.defer();

      if (!vm.model.callerId.callerIdEnabled) {
        if (vm.model.callerId.uuid) {
          CallerId.deleteCompanyNumber(vm.model.callerId.uuid).then(function () {
            clearCallerIdFields();
            deferred.resolve();
          }).catch(function (response) {
            deferred.reject(response);
          });
        } else {
          clearCallerIdFields();
          deferred.resolve();
        }
      } else {
        vm.model.callerId.callerIdNumber = TelephoneNumberService.getDIDLabel(vm.model.callerId.callerIdNumber);
        rawPattern = TelephoneNumberService.getDIDValue(vm.model.callerId.callerIdNumber);
        data = {
          name: vm.model.callerId.callerIdName,
          externalCallerIdType: companyCallerIdType,
          pattern: rawPattern,
          externalNumber: {
            uuid: null,
            pattern: null
          }
        };
        uuidExternalNumber = _.result(_.find(vm.externalNumberPool, function (externalNumber) {
          return externalNumber.pattern === rawPattern;
        }), 'uuid');
        if (uuidExternalNumber) {
          data.externalNumber.uuid = uuidExternalNumber;
          data.externalNumber.pattern = rawPattern;
        }

        if (vm.model.callerId.callerIdEnabled && !vm.model.callerId.uuid) {
          if (vm.model.callerId.callerIdName && vm.model.callerId.callerIdNumber) {
            CallerId.saveCompanyNumber(data).then(function () {
              getCompanyCallerId();
              deferred.resolve();
            }).catch(function (response) {
              deferred.reject(response);
            });
          }
        } else if (vm.model.callerId.callerIdEnabled && vm.model.callerId.uuid) {
          if (vm.model.callerId.callerIdName && vm.model.callerId.callerIdNumber) {
            CallerId.updateCompanyNumber(vm.model.callerId.uuid, data).then(function () {
              deferred.resolve();
            }).catch(function (response) {
              deferred.reject(response);
            });
          }
        } else {
          deferred.resolve();
        }
      }
      return deferred.promise;
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

    function clearCallerIdFields() {
      vm.model.callerId.uuid = '';
      vm.model.callerId.callerIdName = '';
      vm.model.callerId.callerIdNumber = '';
    }

    function setModel(data) {
      vm.model = angular.copy(data);
    }

    $scope.$watch(function () {
      return vm.model.callerId.callerIdEnabled;
    }, function (newValue, oldValue, scope) {
      if (newValue && !vm.model.callerId.uuid && !vm.model.callerId.callerIdName) {
        vm.model.callerId.callerIdName = Authinfo.getOrgName();
      }
    });

    HttpUtils.setTrackingID().then(function () {
      init();
    });

  }
})();
