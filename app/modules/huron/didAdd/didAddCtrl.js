(function () {
  'use strict';

  angular
    .module('uc.didadd', ['Squared'])
    .controller('DidAddCtrl', DidAddCtrl);

  /* @ngInject */
  function DidAddCtrl($rootScope, $scope, $state, $stateParams, $q, $translate, ExternalNumberPool, EmailService, DidAddEmailService, Notification, Authinfo, $timeout, LogMetricsService, DidService, TelephoneNumberService, DialPlanService, PstnSetupService) {
    var vm = this;
    var firstValidDid = false;
    var editMode = !!$stateParams.editMode;

    vm.invalidcount = 0;
    vm.unchangedCount = 0;
    vm.addedCount = 0;
    vm.processing = false;

    var errors = [];
    var didPatternsFromCmi = [];
    var unchangedDids = [];
    var newDids = [];

    vm.addNumbers = true;
    vm.addSuccess = false;
    vm.unsavedTokens = [];

    vm.tokenfieldid = 'didAddField';
    vm.tokenplaceholder = $translate.instant('didManageModal.inputPlacehoder');
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
      createtoken: createToken,
      createdtoken: createdToken,
      removedtoken: removedToken,
      edittoken: editToken
    };

    vm.checkForInvalidTokens = checkForInvalidTokens;
    vm.checkForDuplicates = checkForDuplicates;
    vm.submit = submit;
    vm.goBackToAddNumber = goBackToAddNumber;
    vm.sendEmail = sendEmail;
    vm.backtoStartTrial = backtoStartTrial;
    vm.backtoEditTrial = backtoEditTrial;
    vm.currentOrg = $stateParams.currentOrg;
    vm.emailNotifyTrialCustomer = emailNotifyTrialCustomer;

    activate();
    initSubmitButtonStatus();

    function initSubmitButtonStatus() {
      // submit should init enabled for trial add/edit
      // submit should init disabled for add numbers dialog
      vm.submitBtnStatus = !editMode;
    }

    function createToken(e) {
      var tokenNumber = e.attrs.label;
      e.attrs.value = TelephoneNumberService.getDIDValue(tokenNumber);
      e.attrs.label = TelephoneNumberService.getDIDLabel(tokenNumber);
    }

    function createdToken(e) {
      if (!validateDID(e.attrs.value) || isDidAlreadyPresent(e.attrs.value)) {
        angular.element(e.relatedTarget).addClass('invalid');
        vm.invalidcount++;
      } else {
        if (!editMode && !firstValidDid) {
          firstValidDid = true;
          LogMetricsService.logMetrics('First valid DID number entered', LogMetricsService.getEventType('trialDidEntered'), LogMetricsService.getEventAction('keyInputs'), 200, moment(), 1, null);
        }
      }
      // add to service after validation/duplicate checks
      DidService.addDid(e.attrs.value);
      setPlaceholderText("");
      vm.submitBtnStatus = vm.checkForInvalidTokens() && vm.checkForDuplicates();
    }

    function removedToken(e) {
      DidService.removeDid(e.attrs.value);

      $timeout(reinitTokens);

      //If this is the last token, put back placeholder text.
      var tokenElement = $("div", ".did-input").children(".token");
      if (tokenElement.length === 0) {
        setPlaceholderText(vm.tokenplacehoder);
      }
    }

    function editToken(e) {
      DidService.removeDid(e.attrs.value);
      if (angular.element(e.relatedTarget).hasClass('invalid')) {
        vm.invalidcount--;
      }
    }

    function reinitTokens() {
      var tmpDids = DidService.getDidList();
      // reset invalid and list before setTokens
      vm.invalidcount = 0;
      DidService.clearDidList();
      initSubmitButtonStatus();
      $('#didAddField').tokenfield('setTokens', tmpDids.toString());
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
                if (response.status !== 404) {
                  // Terminus didn't have corresponding reseller records for existing partners.
                  // A 404 error was expected for many partners while looking up their carriers.
                  Notification.errorResponse(response, 'serviceSetupModal.carrierCountryGetError');
                }
                setDidValidationCountry({
                  country: "us"
                });
              });
          })
          .then(reinitTokens)
          .then(function () {
            return ExternalNumberPool.getAll(customerOrgId);
          }).then(function (results) {
            didPatternsFromCmi = _.map(results, 'pattern');
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
          }).then(reinitTokens);
      }
    }

    function isDidAlreadyPresent(input) {
      return _.includes(DidService.getDidList(), input);
    }

    function checkForDuplicates() {
      var dids = DidService.getDidList();
      return _.uniq(dids).length === dids.length;
    }

    function setPlaceholderText(text) {
      $('#didAddField-tokenfield').attr('placeholder', text);
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

      var tokenObjs = getInputTokens();
      if (_.isArray(tokenObjs) && tokenObjs.length != didList.length) {
        didList = _.map(tokenObjs, 'value');
      }

      if (didPatternsFromCmi.length > 0) {
        // remove patterns that already exist in CMI
        unchangedDids = _.remove(didList, function (didPattern) {
          return _.includes(didPatternsFromCmi, didPattern);
        });
      }

      // Add new dids
      newDids = didList;
    }

    function submit(customerId) {
      populateDidArrays();
      vm.unchangedCount = _.size(unchangedDids);
      vm.addNumbers = false;
      vm.processing = true;

      var promises = [];

      if (newDids.length > 0) {
        _.forEach(newDids, function (newDid) {
          var addPromise = ExternalNumberPool.create(customerId ? customerId : vm.currentOrg.customerOrgId, newDid).then(function (response) {
            vm.addedCount++;
          }).catch(function (response) {
            errors.push({
              pattern: newDid,
              message: response.status === 409 ? $translate.instant('didManageModal.didAlreadyExist') : Notification.processErrorResponse(response)
            });
          });
          promises.push(addPromise);
        });
      }

      return $q.all(promises).finally(function () {
        $rootScope.$broadcast('DIDS_UPDATED');
        vm.processing = false;
        vm.addSuccess = true;

        if (errors.length > 0) {
          var errorMsgs = [];
          _.forEach(errors, function (error) {
            errorMsgs.push("Number: " + error.pattern + " " + error.message);
          });
          Notification.notify(errorMsgs, 'error');
        }
      });
    }

    function goBackToAddNumber() {
      vm.addNumbers = true;
    }

    function backtoEditTrial() {
      $state.go('trialEdit.info', {
        currentTrial: vm.currentTrial
      });
    }

    function backtoStartTrial() {
      $state.go('trialAdd.info');
    }

    function sendEmail() {
      var emailInfo = {
        'email': vm.currentOrg.customerEmail,
        'customerName': vm.currentOrg.customerName,
        'partnerName': Authinfo.getOrgName()
      };
      DidAddEmailService.save({}, emailInfo, function () {
        Notification.success('didManageModal.emailSuccessText');
      }, function () {
        Notification.error('didManageModal.emailFailText');
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
            Notification.success('didManageModal.emailSuccessText');
          })
          .catch(function (response) {
            Notification.error('didManageModal.emailFailText');
          })
          .finally(function () {
            angular.element('#trialNotifyCustomer').prop('disabled', true);
          });
      } else {
        Notification.error('didManageModal.emailFailText');
      }
    }

    // We want to capture the modal close event and clear didList from service.
    if ($state.modal) {
      $state.modal.result.finally(DidService.clearDidList);
    }

  }
})();
