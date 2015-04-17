(function () {
  'use strict';

  angular
    .module('uc.didadd', ['Squared'])
    .controller('DidAddCtrl', DidAddCtrl);

  /* @ngInject */

  function DidAddCtrl($rootScope, $scope, $state, $stateParams, $q, $translate, ExternalNumberPool, DidAddEmailService, Notification, Authinfo, $timeout, Log, LogMetricsService, Config) {
    var vm = this;
    var firstValidDid = false;
    var editMode = false;
    vm.invalidcount = 0;
    vm.submitBtnStatus = false;
    vm.existCount = 0;
    vm.newCount = 0;
    vm.deleteCount = 0;
    vm.addNumbers = true;
    vm.deleteNumbers = false;
    vm.addingNumbers = false;
    vm.addSuccess = false;
    vm.unsavedTokens = [];
    vm.tokens = [];
    vm.deletedNumbers = '';
    vm.tokenfieldid = 'didAddField';
    vm.tokenplacehoder = $translate.instant('didAddModal.inputPlacehoder');
    vm.fromEditTrial = $stateParams.fromEditTrial;
    vm.currentTrial = angular.copy($stateParams.currentTrial);

    vm.init = function (customerId) {
      if (angular.isUndefined(customerId) && angular.isDefined($stateParams.currentOrg) && angular.isDefined($stateParams.currentOrg.customerOrgId)) {
        customerId = $stateParams.currentOrg.customerOrgId;
      }
      if (angular.isDefined(customerId)) {
        ExternalNumberPool.getAll(customerId).then(function (results) {
          if (angular.isDefined(results) && angular.isDefined(results.length)) {
            $timeout(function () {
              for (var i = 0; i < results.length; i++) {
                $('#didAddField').tokenfield('createToken', results[i].pattern);
              }
              vm.tokens = results;
            });
          }
        });
      }
    };

    vm.tokenoptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true,
      limit: 50,
      tokens: [],
      minLength: 10,
      beautify: false
    };
    vm.tokenmethods = {
      createtoken: function (e) {
        var value = e.attrs.value.replace(/[^0-9]/g, '');
        var vLength = value.length;
        if (vLength === 10) {
          e.attrs.value = '+1' + value;
          e.attrs.label = value.replace(/(\d{3})(\d{3})(\d{4})/, "1 ($1) $2-$3");
        } else if (vLength === 11) {
          e.attrs.value = '+' + value;
          e.attrs.label = value.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
        }
      },
      createdtoken: function (e) {
        if (!validateDID(e.attrs.value)) {
          angular.element(e.relatedTarget).addClass('invalid');
          vm.invalidcount++;
        } else {
          if (!editMode && !firstValidDid) {
            firstValidDid = true;
            LogMetricsService.logMetrics('First valid DID number entered', LogMetricsService.getEventType('trialDidEntered'), LogMetricsService.getEventAction('keyInputs'), 200, moment(), 1);
          }
        }
        vm.submitBtnStatus = vm.checkForInvalidTokens();
      },
      removedtoken: function (e) {
        if (!validateDID(e.attrs.value)) {
          vm.invalidcount--;
        }
        var tokenCount = getDIDList();
        if (tokenCount.length > 1) {
          vm.submitBtnStatus = vm.checkForInvalidTokens();
        } else {
          vm.submitBtnStatus = false;
        }
      },
      editedtoken: function (e) {
        if (!validateDID(e.attrs.value)) {
          vm.invalidcount--;
        }
      }
    };
    vm.checkForInvalidTokens = checkForInvalidTokens;
    vm.submit = submit;
    vm.confirmSubmit = confirmSubmit;
    vm.goBackToAddNumber = goBackToAddNumber;
    vm.startTrial = startTrial;
    vm.editTrial = editTrial;
    vm.sendEmail = sendEmail;
    vm.backtoStartTrial = backtoStartTrial;
    vm.backtoEditTrial = backtoEditTrial;
    vm.currentOrg = $stateParams.currentOrg;
    if ($stateParams.editMode === undefined || $stateParams.editMode === null) {
      editMode = false;
    } else {
      editMode = $stateParams.editMode;
    }
    ////////////

    function validateDID(input) {
      var didregex = /^\+([0-9]){10,12}$/;
      var valid = false;
      if (didregex.test(input)) {
        valid = true;
      }
      return valid;
    }

    function checkForInvalidTokens() {
      return vm.invalidcount > 0 ? false : true;
    }

    function getDIDList() {
      var tokens = vm.unsavedTokens;
      var didList = tokens.split(',');

      return didList;
    }

    function getDidBucket() {
      var didBucket = {
        'deletedDid': [],
        'newlyAddedDid': [],
        'alreadyExistingDid': []
      };
      var didList = getDIDList();
      if (angular.isDefined(vm.tokens) && angular.isDefined(vm.tokens.length) && vm.tokens.length > 0) {

        if (angular.isUndefined(didList) || angular.isUndefined(didList.length) || didList.length === 0) {
          didBucket.alreadyExistingDid = vm.tokens.slice();
          return didBucket;
        }

        var tokens = vm.tokens.slice();
        // Adding all deleted dids in bucket
        for (var i = 0; i < vm.tokens.length; i++) {
          if (didList.indexOf(vm.tokens[i].pattern) == -1) {
            tokens.splice(i);
            didBucket.deletedDid.push(vm.tokens[i]);
          } else {
            didList.splice(didList.indexOf(vm.tokens[i].pattern), 1);
          }
        }

        //Adding the newly added dids
        if (didList.length > 0) {
          didBucket.newlyAddedDid = didList.slice();
        }

        //Adding already existing dids
        didBucket.alreadyExistingDid = tokens.slice();

      } else if (angular.isDefined(didList) && angular.isDefined(didList.length) && didList.length > 0) {
        didBucket.newlyAddedDid = didList.slice();
      }

      return didBucket;
    }

    function confirmSubmit(customerId) {
      var didBucket = getDidBucket();
      vm.addNumbers = false;

      if (didBucket.deletedDid.length > 0) {
        vm.deleteCount = didBucket.deletedDid.length;
        vm.deletedNumbers = formatDidList(didBucket.deletedDid).toString();
        vm.deleteNumbers = true;
      } else {
        submit(customerId);
      }

    }

    function submit(customerId) {
      var didBucket = getDidBucket();

      vm.deleteNumbers = false;
      vm.addingNumbers = true;

      vm.existCount = didBucket.alreadyExistingDid.length;
      vm.newCount = didBucket.newlyAddedDid.length;
      vm.deleteCount = didBucket.deletedDid.length;

      var promises = [];
      if (angular.isDefined(didBucket)) {

        if (didBucket.deletedDid.length > 0) {

          promises[0] = ExternalNumberPool.deleteExtNums(customerId ? customerId : vm.currentOrg.customerOrgId, didBucket.deletedDid).then(function (results) {
            vm.deleteCount = results.successes;
          });
        }

        if (didBucket.newlyAddedDid.length > 0) {
          promises[1] = ExternalNumberPool.create(customerId ? customerId : vm.currentOrg.customerOrgId, didBucket.newlyAddedDid).then(function (results) {
            vm.newCount = results.successes.length;
            vm.failedAdd = results.failures;
          });
        }
      }

      return $q.all(promises).finally(function () {
        $rootScope.$broadcast('DIDS_UPDATED');
        vm.addingNumbers = false;
        vm.addSuccess = true;

        if (vm.failedAdd.length > 0) {
          var errorMsg = [$translate.instant('didAddModal.failText', {
            count: vm.failedAdd.length
          })];
          Notification.notify(errorMsg, 'error');
        }
      });
    }

    function goBackToAddNumber() {
      vm.addNumbers = true;
      vm.deleteNumbers = false;
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

    function formatDidList(didList) {
      var result = [];
      if (angular.isDefined(didList) && angular.isDefined(didList.length) && didList.length > 0) {
        for (var i = 0; i < didList.length; i++) {
          result.push(formatPhoneNumbers(didList[i].pattern));
        }
      }
      return result;
    }

    function formatPhoneNumbers(value) {
      value = value.replace(/[^0-9]/g, '');
      var vLength = value.length;
      if (vLength === 10) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, "1 ($1) $2-$3");
      } else if (vLength === 11) {
        value = value.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
      }
      return value;
    }

    function startTrial() {
      if ($scope.trial && angular.isFunction($scope.trial.startTrial)) {
        angular.element('#startTrial').button('loading');
        $q.when($scope.trial.startTrial(true)).then(function (customerId) {
          return submit(customerId);
        }).then(function () {
          return $state.go('trialAdd.nextSteps');
        }).catch(function () {
          angular.element('#startTrial').button('reset');
        });
      }
    }

    function editTrial() {
      if ($scope.trial && angular.isFunction($scope.trial.editTrial)) {
        angular.element('#startTrial').button('loading');
        $q.when($scope.trial.editTrial(true)).then(function (customerId) {
          return submit(customerId);
        }).then(function () {
          $state.modal.close();
        }).catch(function () {
          angular.element('#startTrial').button('reset');
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
        var successMsg = [$translate.instant('didAddModal.emailSuccessText')];
        Notification.notify(successMsg, 'success');
      }, function () {
        var errorMsg = [$translate.instant('didAddModal.emailFailText')];
        Notification.notify(errorMsg, 'error');
      });
      $state.modal.close();
    }

    vm.init();

  }
})();
