 (function () {
   "use strict";

   angular
     .module("DigitalRiver")
     .controller("submitOrderController", submitOrderController);

   /* @ngInject */
   function submitOrderController($location, $state, $translate, $stateParams, Log, Userservice, Utils, OnlineTrialConfig, DigitalRiverService) {

     var vm = this;

     vm.drReferrer = ($location.search().referrer === DigitalRiverService.getDrReferrer());
     if (!vm.drReferrer) {
       vm.error = $translate.instant('digitalRiver.restrictedPage');
     }

     vm.handleActivate = handleActivate;
     vm.handleDone = handleDone;
     vm.handleMissingEmail = handleMissingEmail;
     vm.isSubmitting = true;

     vm.email = $stateParams.email;
     vm.existingUser = false;
     vm.sku = $stateParams.params.sku;
     vm.campaignId = $stateParams.params.campaignId;
     vm.uuid = $stateParams.params.uuid;

     if (!angular.isDefined(vm.uuid)) {
       vm.existingUser = true;
       Userservice.getUser('me', function (data, status) {
         if (data.success) {
           if (data.id) {
             vm.uuid = data.id;
           } else {
             Log.debug('Get current user failed. Status: ' + status);
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

       DigitalRiverService.submitOrderOnline(request)
         .then(function (result) {
           vm.isSubmitting = false;
         })
         .catch(function (error) {
           vm.error = 'An error ocurred submitting the Order.';
         });
     }

     function handleActivate() {
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
     }

     function handleDone() {
       vm.error = "TODO What happens after clicking Done?";
     }

     function handleMissingEmail() {
       vm.error = "TODO What happens after clicking the link?";
     }

   }
 })

 ();
