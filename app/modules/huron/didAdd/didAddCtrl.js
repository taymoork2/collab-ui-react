'use strict';

angular.module('Huron')
  .controller('DidAddCtrl', ['$q', '$scope', '$modalInstance', '$filter', 'ExternalNumberPool', 'StorefrontEmailService', 'Notification',
    function ($q, $scope, $modalInstance, $filter, ExternalNumberPool, StorefrontEmailService, Notification) {
      $scope.invalidcount = 0;
      $scope.submitBtnStatus = false;
      $scope.successCount;
      $scope.failCount;
      $scope.tokens = [];
      $scope.tokenfieldid = 'didAddField';
      $scope.tokenplacehoder = $filter('translate')('didAddModal.inputPlacehoder');
      $scope.tokenoptions = {
        delimiter: [',', ';'],
        createTokensOnBlur: true,
        limit: 50,
        tokens: [],
        minLength: 10,
        beautify: false
      };
      $scope.tokenmethods = {
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
            $scope.invalidcount++;
          }
          $scope.submitBtnStatus = $scope.checkForInvalidTokens();
        },
        removedtoken: function (e) {
          if (!validateDID(e.attrs.value)) {
            $scope.invalidcount--;
          }
          var tokenCount = getDIDList();
          if (tokenCount.length > 1) {
            $scope.submitBtnStatus = $scope.checkForInvalidTokens();
          } else {
            $scope.submitBtnStatus = false;
          }
        },
        editedtoken: function (e) {
          if (!validateDID(e.attrs.value)) {
            $scope.invalidcount--;
          }
        }
      };

      var validateDID = function (input) {
        var didregex = /^\+([0-9]){10,12}$/;
        var valid = false;
        if (didregex.test(input)) {
          valid = true;
        }
        return valid;
      };

      $scope.checkForInvalidTokens = function () {
        return $scope.invalidcount > 0 ? false : true;
      };

      var getDIDList = function () {
        var tokens = $scope.tokens;
        var didList = tokens.split(',');

        return didList;
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');

      };

      $scope.addNumbers = true;
      $scope.addingNumbers = false;
      $scope.addSuccess = false;

      $scope.submit = function () {
        var didList = getDIDList();
        var addNumbersPromise = ExternalNumberPool.create(didList);
        addNumbersPromise.then(
          function (results) {
            $scope.successCount = results.successes.length;
            $scope.failCount = results.failures.length;

            $scope.addingNumbers = false;
            $scope.addSuccess = true;
          });
        $scope.addNumbers = false;
        $scope.addingNumbers = true;
      };

      $scope.sendEmail = function () {
        var recipient = {
          recipient: 'customer'
        };
        var custInfo = {
          'customerName': 'Inigo Montoya',
          'customerEmail': 'pajeter@cisco.com',
          'orderNumber': '123abc789xyz',
          'orderPackageInfo': 'Standard Package',
          'numberOfDids': $scope.successCount,
          'pstnCompany': 'Verizon'
        };
        StorefrontEmailService.save(recipient, custInfo, function (data) {
          var successMsg = [$filter('translate')('didAddModal.emailSuccessText')];
          Notification.notify(successMsg, 'success');
        }, function (err) {
          var errorMsg = [$filter('translate')('didAddModal.emailFailText')];
          Notification.notify(errorMsg, 'error');
        });
        $modalInstance.close();
      }

    }
  ])

;
