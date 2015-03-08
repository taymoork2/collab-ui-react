(function () {
  'use strict';

  angular
    .module('uc.didadd')
    .controller('DidAddCtrl', DidAddCtrl);

  /* @ngInject */
  function DidAddCtrl($scope, $state, $stateParams, $q, $translate, ExternalNumberPool, DidAddEmailService, Notification, Authinfo) {
    var vm = this;
    vm.invalidcount = 0;
    vm.submitBtnStatus = false;
    // vm.successCount;
    // vm.failCount;
    vm.addNumbers = true;
    vm.addingNumbers = false;
    vm.addSuccess = false;
    vm.tokens = [];
    vm.tokenfieldid = 'didAddField';
    vm.tokenplacehoder = $translate.instant('didAddModal.inputPlacehoder');
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
    vm.startTrial = startTrial;
    vm.sendEmail = sendEmail;
    vm.currentOrg = $stateParams.currentOrg;

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
      var tokens = vm.tokens;
      var didList = tokens.split(',');

      return didList;
    }

    function submit(customerId) {
      var didList = getDIDList();
      vm.addNumbers = false;
      vm.addingNumbers = true;

      return ExternalNumberPool.create(customerId ? customerId : vm.currentOrg.customerOrgId, didList).then(function (results) {
        vm.successCount = results.successes.length;
        vm.failCount = results.failures.length;

        vm.addingNumbers = false;
        vm.addSuccess = true;
      });
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

    function sendEmail() {
      var emailInfo = {
        'email': vm.currentOrg.customerEmail,
        'customerName': vm.currentOrg.customerName,
        'partnerName': Authinfo.getOrgName()
      };
      DidAddEmailService.save({}, emailInfo, function (data) {
        var successMsg = [$translate.instant('didAddModal.emailSuccessText')];
        Notification.notify(successMsg, 'success');
      }, function (err) {
        var errorMsg = [$translate.instant('didAddModal.emailFailText')];
        Notification.notify(errorMsg, 'error');
      });
      $state.modal.close();
    }

  }
})();
