(function () {
  "use strict";

  angular
    .module("DigitalRiver")
    .controller("submitOrderController", submitOrderController);

  /* @ngInject */
  function submitOrderController($timeout, $location, $state, $translate, $stateParams, Log, Userservice, Utils, OnlineTrialConfig, DigitalRiverService) {

    var vm = this;

    vm.drReferrer = ($stateParams.referrer === DigitalRiverService.getDrReferrer());
    if (!vm.drReferrer) {
      vm.error = $translate.instant('digitalRiver.restrictedPage');
    } else if (!angular.isDefined($stateParams.params.sku)) {
      vm.error = $translate.instant('digitalRiver.validation.missingSKU');
    } else {
      vm.isSubmitting = true;

      vm.email = $stateParams.email;
      vm.existingUser = false;
      vm.sku = $stateParams.params.sku;
      vm.campaignId = $stateParams.params.campaignId;
      vm.uuid = $stateParams.params.uuid;

      // if we're not given a UUID we need to look up the user
      if (!angular.isDefined(vm.uuid)) {
        Userservice.getUser('me', function (data, status) {
          if (data.success) {
            if (data.id) {
              vm.uuid = data.id;
              vm.existingUser = true;
            } else {
              Log.debug('Get current user failed. Status: ' + status);
              vm.error = $translate.instant('digitalRiver.submitOrder.userError');
              return;
            }
          }
        });
      }

      var params = {};
      params.params = {};
      params.params.orderUuid = vm.orderUuid;

      var generateUUID = {
        requestId: 'AR-' + Utils.getUUID(),
        externalOrderId: 'AO-' + vm.orderId
      };

      submitOrder();
    }

    function submitOrder() {

      var request = {
        "requestId": generateUUID.requestId,
        "orderDetails": {
          "externalOrderId": generateUUID.externalOrderId,
          "campaignId": vm.campaignId,
          "orderDate": new Date(),
          "orderSubmitDate": new Date(),
          "totalCost": {
            "amount": OnlineTrialConfig.amount,
            "currencyCode": "USD"
          },
          "country": "US",
          "language": "EN",
          "orderingTool": "DIGITAL_RIVER"
        },
        "buyer": {
          "email": vm.email,
          "entityIdentifier": {
            "internalUUID": vm.uuid
          }
        },
        "partner": {
          "partnerIdentifier": {
            "internalUUID": OnlineTrialConfig.getPartnerInternalUUID()
          }
        },
        "orderItems": [{
          "primaryProduct": {
            "offerCode": vm.sku,
            "quantity": 1,
            "itemCost": {
              "amount": OnlineTrialConfig.amount,
              "currencyCode": "USD"
            },
            "productIdentifier": {
              "internalUUID": "78cfae82-40f4-4451-91d5-10df7f9cdfd5"
            }
          }
        }]
      };

      vm.loading = true;

      return DigitalRiverService.submitOrderOnline(request)
        .then(function (result) {
          vm.loading = false;
          vm.isSubmitting = false;
        })
        .catch(function (error) {
          vm.loading = false;
          vm.isSubmitting = false;
          vm.error = $translate.instant('digitalRiver.submitOrder.submitError');
        });
    }

    vm.handleActivate = function () {
      $state.go('drOnboard', $stateParams);
      /*TODO move to controller that redirects to first-time wizard
      DigitalRiverService.activateProduct(vm.subscriptionUuid)
      .then(function (result) {
      if (_.get(result, 'status') === 200) {
      $state.go('drOnboard', $stateParams);
      } else {
      vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
      }
      }, function (result) {
      vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
      });
      */
    };

    vm.handleDone = function () {
      vm.error = "TODO What happens after clicking Done?";
    };

    vm.handleMissingEmail = function () {
      vm.error = "TODO What happens after clicking the link?";
    };

  }
})

();
