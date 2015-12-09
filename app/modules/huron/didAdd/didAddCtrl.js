(function () {
  'use strict';

  angular
    .module('uc.didadd', ['Squared'])
    .controller('DidAddCtrl', DidAddCtrl);

  /* @ngInject */
  function DidAddCtrl($rootScope, $scope, $state, $stateParams, $q, $translate, $window, ExternalNumberPool, EmailService, DidAddEmailService, Notification, Authinfo, $timeout, Log, LogMetricsService, Config, DidService, TelephoneNumberService, DialPlanService, PstnSetupService) {
    var vm = this;
    var firstValidDid = false;
    var editMode = false;

    vm.invalidcount = 0;
    vm.submitBtnStatus = false;
    vm.deleteCount = 0;
    vm.unchangedCount = 0;

    vm.deletedCount = 0;
    vm.addedCount = 0;
    vm.processing = false;
    vm.retrievingNumbers = false;
    vm.errors = [];

    vm.didObjectsFromCmi = [];
    vm.unchangedDids = [];
    vm.deletedDids = [];
    vm.newDids = [];

    vm.addNumbers = true;
    vm.deleteNumbers = false;

    vm.addSuccess = false;
    vm.unsavedTokens = [];

    vm.deletedNumbers = '';
    vm.tokenfieldid = 'didAddField';
    vm.tokenplaceholder = $translate.instant('didManageModal.inputPlacehoder');
    vm.fromEditTrial = $stateParams.fromEditTrial;
    vm.currentTrial = angular.copy($stateParams.currentTrial);
    vm.getExampleNumbers = TelephoneNumberService.getExampleNumbers;

    vm.tokenoptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: 50,
      tokens: [],
      minLength: 9,
      beautify: false
    };
    vm.tokenmethods = {
      createtoken: function (e) {
        var tokenNumber = e.attrs.label;
        e.attrs.value = TelephoneNumberService.getDIDValue(tokenNumber);
        e.attrs.label = TelephoneNumberService.getDIDLabel(tokenNumber);
      },
      createdtoken: function (e) {
        if (!validateDID(e.attrs.value)) {
          angular.element(e.relatedTarget).addClass('invalid');
          vm.invalidcount++;
        } else {
          if (isDidAlreadyPresent(e.attrs.value)) {
            angular.element(e.relatedTarget).addClass('invalid');
          }
          if (!editMode && !firstValidDid) {
            firstValidDid = true;
            LogMetricsService.logMetrics('First valid DID number entered', LogMetricsService.getEventType('trialDidEntered'), LogMetricsService.getEventAction('keyInputs'), 200, moment(), 1, null);
          }
        }
        // add to service after validation/duplicate checks
        DidService.addDid(e.attrs.value);
        setPlaceholderText("");
        vm.submitBtnStatus = vm.checkForInvalidTokens() && vm.checkForDuplicates();
      },
      removedtoken: function (e) {
        DidService.removeDid(e.attrs.value);
        if (!validateDID(e.attrs.value)) {
          vm.invalidcount--;
        }
        vm.submitBtnStatus = vm.checkForInvalidTokens() && vm.checkForDuplicates();

        $timeout(function () {
          var tmpDids = DidService.getDidList().slice();
          // reset invalid and list before setTokens
          vm.invalidcount = 0;
          DidService.clearDidList();
          $('#didAddField').tokenfield('setTokens', tmpDids.toString());
        });

        //If this is the last token, put back placeholder text.
        var tokenElement = $("div", ".did-input").children(".token");
        if (tokenElement.length === 0) {
          setPlaceholderText(vm.tokenplacehoder);
        }
      },
      editedtoken: function (e) {
        DidService.removeDid(e.attrs.value);
        if (!validateDID(e.attrs.value)) {
          vm.invalidcount--;
        }
      }
    };
    vm.checkForInvalidTokens = checkForInvalidTokens;
    vm.checkForDuplicates = checkForDuplicates;
    vm.submit = submit;
    vm.confirmSubmit = confirmSubmit;
    vm.goBackToAddNumber = goBackToAddNumber;
    vm.startTrial = startTrial;
    vm.editTrial = editTrial;
    vm.sendEmail = sendEmail;
    vm.backtoStartTrial = backtoStartTrial;
    vm.backtoEditTrial = backtoEditTrial;
    vm.currentOrg = $stateParams.currentOrg;
    vm.emailNotifyTrialCustomer = emailNotifyTrialCustomer;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.setupPstnService = setupPstnService;

    if ($stateParams.editMode === undefined || $stateParams.editMode === null) {
      editMode = false;
    } else {
      editMode = $stateParams.editMode;
    }

    function setDidValidationCountry(carrierOrDialPlanInfo) {
      var country = _.get(carrierOrDialPlanInfo, 'country');
      var countryCode = _.get(carrierOrDialPlanInfo, 'countryCode');
      if (country) {
        // check if two-digit alphabetical country identifier is available, i.e. "us"
        TelephoneNumberService.setRegionCode(country.toLowerCase());
      } else if (countryCode) {
        TelephoneNumberService.setCountryCode(countryCode);
      } else {
        // if country and countryCode are not available, assume "us"
        TelephoneNumberService.setRegionCode("us");
      }
    }

    function getCarrierInfoFromTerminus() {
      return PstnSetupService.listResellerCarriers()
        .then(function (resellerCarriers) {
          // this may need revisiting once multiple carriers are supported by a partner/reseller
          if (resellerCarriers.length > 0) {
            return resellerCarriers[0];
          }
        });
    }

    function activate() {
      var customerOrgId = _.get($stateParams, 'currentOrg.customerOrgId');
      if (customerOrgId) {
        DialPlanService.getCustomerDialPlanCountryCode(customerOrgId)
          .then(TelephoneNumberService.setCountryCode)
          .catch(function (response) {
            // if customer carrier info could not be obtained from CMI, try getting partner carrier info from Terminus
            return getCarrierInfoFromTerminus(Authinfo.getOrgId()).then(setDidValidationCountry)
              .catch(function (response) {
                setDidValidationCountry({
                  country: "us"
                });
                Notification.errorResponse(response, 'serviceSetupModal.carrierCountryGetError');
              });
          }).then(function () {
            return ExternalNumberPool.getAll(customerOrgId);
          }).then(function (results) {
            if (angular.isArray(results)) {
              $timeout(function () {
                angular.forEach(results, function (did) {
                  addToTokenField(did.pattern);
                });
                vm.didObjectsFromCmi = results;
              });
            }
          });
      } else {
        // if customerId is not defined, get country info from partner/reseller carrier(s)
        getCarrierInfoFromTerminus(Authinfo.getOrgId()).then(setDidValidationCountry)
          .catch(function (response) {
            if (response.status !== 404) {
              // Terminus didn't have corresponding reseller records for existing partners.
              // A 404 error was expected for many partners while looking up their carriers.
              Notification.errorResponse(response, 'serviceSetupModal.carrierCountryGetError');
            }
            setDidValidationCountry({
              country: "us"
            });
          }).then(function () {
            var dids = DidService.getDidList();
            $timeout(function () {
              angular.forEach(dids, function (did) {
                addToTokenField(did);
              });
            }, 100);
          });
      }
    }

    activate();
    ////////////

    function isDidAlreadyPresent(input) {
      var dids = DidService.getDidList();
      return dids.indexOf(input) >= 0;
    }

    function checkForDuplicates() {
      var dids = DidService.getDidList();
      var tmpDids = dids.slice();
      var i = 0;
      while (tmpDids.length > 0) {
        var did = tmpDids.splice(0, 1);
        if (tmpDids.indexOf(String(did)) >= 0) {
          return false;
        }
        i++;
      }
      return true;
    }

    function setPlaceholderText(text) {
      $('#didAddField-tokenfield').attr('placeholder', text);
    }

    function addToTokenField(pattern) {
      $('#didAddField').tokenfield('createToken', pattern);
    }

    function getInputTokens() {
      return $('#didAddField').tokenfield('getTokens');
    }

    function validateDID(input) {
      return TelephoneNumberService.validateDID(input);
    }

    function checkForInvalidTokens() {
      return vm.invalidcount > 0 ? false : true;
    }

    function getDIDList() {
      var didList = [];
      var tokens = vm.unsavedTokens;

      if (angular.isString(tokens) && tokens.length > 0) {
        didList = tokens.split(',');
      }

      return didList;
    }

    function populateDidArrays() {
      var didList = getDIDList();

      vm.tokenObjs = getInputTokens();
      if (angular.isDefined(vm.tokenObjs) && angular.isArray(vm.tokenObjs) && vm.tokenObjs.length != didList.length) {
        didList = [];
        angular.forEach(vm.tokenObjs, function (input, index) {
          didList.push(input.value);
        });
      }

      if (vm.didObjectsFromCmi.length > 0) {
        //look for DIDs that need to be removed
        var dids = vm.didObjectsFromCmi.slice();
        angular.forEach(vm.didObjectsFromCmi, function (didObj, index) {
          if (!_.contains(didList, didObj.pattern)) {
            dids.splice(index);
            vm.deletedDids.push(didObj);
          } else {
            didList.splice(didList.indexOf(didObj.pattern), 1);
          }
        });

        //Add new dids
        if (didList.length > 0) {
          vm.newDids = didList.slice();
        }

        //Adding already existing dids
        vm.unchangedDids = dids.slice();

      } else if (didList.length > 0) {
        vm.newDids = didList.slice();
      }
    }

    function restoreDeletedDids() {
      _.forEach(vm.deletedDids, function (deletedDid) {
        addToTokenField(deletedDid.pattern);
      });
      vm.deletedDids = [];
      vm.deletedNumbers = [];
    }

    function confirmSubmit(customerId) {
      populateDidArrays();

      vm.unchangedCount = vm.unchangedDids.length;
      vm.addNumbers = false;

      if (vm.deletedDids.length > 0) {
        vm.deleteCount = vm.deletedDids.length;
        vm.deletedNumbers = formatDidList(vm.deletedDids);
        vm.deleteNumbers = true;
      } else {
        submit(customerId);
      }
    }

    function submit(customerId) {
      vm.deleteNumbers = false;
      vm.processing = true;

      var promises = [];
      if (vm.deletedDids.length > 0) {
        _.forEach(vm.deletedDids, function (delDid) {
          var deletePromise = ExternalNumberPool.deletePool(customerId ? customerId : vm.currentOrg.customerOrgId, delDid.uuid).then(function (response) {
            vm.deletedCount++;
          }).catch(function (response) {
            vm.errors.push({
              pattern: this.pattern,
              message: Notification.processErrorResponse(response)
            });
          }.bind(delDid));
          promises.push(deletePromise);
        });
      }

      if (vm.newDids.length > 0) {
        _.forEach(vm.newDids, function (newDid) {
          var addPromise = ExternalNumberPool.create(customerId ? customerId : vm.currentOrg.customerOrgId, newDid).then(function (response) {
            vm.addedCount++;
          }).catch(function (response) {
            vm.errors.push({
              pattern: this,
              message: response.status === 409 ? $translate.instant('didManageModal.didAlreadyExist') : Notification.processErrorResponse(response)
            });
          }.bind(newDid));
          promises.push(addPromise);
        });
      }

      return $q.all(promises).finally(function () {
        $rootScope.$broadcast('DIDS_UPDATED');
        vm.processing = false;
        vm.addSuccess = true;

        if (vm.errors.length > 0) {
          var errorMsgs = [];
          _.forEach(vm.errors, function (error) {
            errorMsgs.push("Number: " + error.pattern + " " + error.message);
          });
          Notification.notify(errorMsgs, 'error');
        }
      });
    }

    function goBackToAddNumber() {
      vm.addNumbers = true;
      vm.deleteNumbers = false;
      restoreDeletedDids();
    }

    function backtoEditTrial() {
      $state.go('trialEdit.info', {
        currentTrial: vm.currentTrial,
        showPartnerEdit: true
      });
    }

    function backtoStartTrial() {
      $state.go('trialAdd.info');
    }

    function setupPstnService() {
      if (angular.isDefined($scope.trial)) {
        $state.go('pstnSetup', {
          customerId: $scope.trial.model.customerOrgId,
          customerName: $scope.trial.model.customerName
        });
      }
    }

    function formatDidList(didList) {
      var formattedDids = [];
      if (angular.isDefined(didList) && angular.isDefined(didList.length) && didList.length > 0) {
        _.forEach(didList, function (number) {
          formattedDids.push(TelephoneNumberService.getDIDLabel(number.pattern));
        });
      }
      return formattedDids;
    }

    function startTrial() {
      if ($scope.trial && angular.isFunction($scope.trial.startTrial)) {
        vm.startTrialLoad = true;
        $q.when($scope.trial.startTrial(true)).then(function (customerId) {
          populateDidArrays();
          return submit(customerId);
        }).then(function () {
          return $state.go('trialAdd.nextSteps');
        }).catch(function () {
          vm.startTrialLoad = false;
        });
      }
    }

    function editTrial() {
      if ($scope.trial && angular.isFunction($scope.trial.editTrial)) {
        vm.startTrialLoad = true;
        $q.when($scope.trial.editTrial(true)).then(function (customerId) {
          populateDidArrays();
          return submit(customerId);
        }).then(function () {
          $state.modal.close();
        }).catch(function () {
          vm.startTrialLoad = false;
        });
      }
    }

    function sendEmail() {
      var emailInfo = {
        'email': vm.currentOrg.customerEmail,
        'customerName': vm.currentOrg.customerName,
        'partnerName': Authinfo.getOrgName()
      };
      DidAddEmailService.save({}, emailInfo, function () {
        var successMsg = [$translate.instant('didManageModal.emailSuccessText')];
        Notification.notify(successMsg, 'success');
      }, function () {
        var errorMsg = [$translate.instant('didManageModal.emailFailText')];
        Notification.notify(errorMsg, 'error');
      });
      $state.modal.close();
    }

    function emailNotifyTrialCustomer() {
      if (angular.isDefined($scope.trial)) {
        EmailService.emailNotifyTrialCustomer(
            $scope.trial.model.customerEmail,
            $scope.trial.model.licenseDuration,
            $scope.trial.model.customerOrgId)
          .then(function (response) {
            Notification.notify([$translate.instant('didManageModal.emailSuccessText')], 'success');
          })
          .catch(function (response) {
            Notification.notify([$translate.instant('didManageModal.emailFailText')], 'error');
          })
          .finally(function () {
            angular.element('#trialNotifyCustomer').prop('disabled', true);
          });
      } else {
        Notification.notify([$translate.instant('didManageModal.emailFailText')], 'error');
      }
    }

    function launchCustomerPortal() {
      if (angular.isDefined($scope.trial)) {
        $window.open($state.href('login_swap', {
          customerOrgId: $scope.trial.model.customerOrgId,
          customerOrgName: $scope.trial.model.customerName
        }));
      }
    }

    // We want to capture the modal close event and clear didList from service.
    if ($state.modal) {
      $state.modal.result.finally(function () {
        DidService.clearDidList();
      });
    }

  }
})();
