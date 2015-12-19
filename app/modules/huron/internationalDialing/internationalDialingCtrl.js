(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('InternationalDialingInfoCtrl', InternationalDialingInfoCtrl);

  /* @ngInject */
  function InternationalDialingInfoCtrl($scope, $stateParams, $translate, $modal, $q, UserServiceCommon, Notification, HttpUtils, InternationalDialing) {
    var vm = this;

    var INTERNATIONAL_DIALING = 'DIALINGCOSTAG_INTERNATIONAL';
    var cbUseGlobal = {
      opt: $translate.instant('internationalDialingPanel.useGlobal'),
      val: '-1'
    };
    var cbAlwaysAllow = {
      opt: $translate.instant('internationalDialingPanel.alwaysAllow'),
      val: '1'
    };
    var cbNeverAllow = {
      opt: $translate.instant('internationalDialingPanel.neverAllow'),
      val: '0'
    };

    vm.currentUser = $stateParams.currentUser;
    vm.saveInternationalDialing = saveInternationalDialing;
    vm.reset = reset;
    vm.saveInProcess = false;
    vm.validInternationalDialingOptions = [];

    vm.fields = [{
      key: 'internationalDialingEnabled',
      type: 'select',
      templateOptions: {
        labelfield: "opt",
        valuefield: "val",
        options: vm.validInternationalDialingOptions,
        required: true,
        maxlength: 50
      }
    }];

    vm.model = {
      internationalDialingEnabled: cbUseGlobal,
      internationalDialingUuid: null
    };

    init();

    function init() {
      vm.validInternationalDialingOptions.push(cbUseGlobal);
      vm.validInternationalDialingOptions.push(cbAlwaysAllow);
      vm.validInternationalDialingOptions.push(cbNeverAllow);
      initInternationalDialing();
    }

    function initInternationalDialing() {
      return InternationalDialing.listCosRestrictions(vm.currentUser.id).then(function (cosRestrictions) {
        var overRide = null;
        var custRestriction = null;
        var cosRestriction = null;

        for (var i = 0; i < cosRestrictions.length; i++) {
          cosRestriction = cosRestrictions[i];
          if (cosRestriction.user.length > 0) {
            for (var j = 0; j < cosRestriction.user.length; j++) {
              if (cosRestriction.user[j].restriction === INTERNATIONAL_DIALING) {
                overRide = true;
                break;
              }
            }
          }
          if (cosRestriction.customer.length > 0) {
            for (var k = 0; k < cosRestriction.customer.length; k++) {
              if (cosRestriction.customer[k].restriction === INTERNATIONAL_DIALING) {
                custRestriction = true;
                break;
              }
            }
          }

        }
        if (overRide) {
          if (cosRestriction.user[0].blocked) {
            vm.model.internationalDialingEnabled = cbNeverAllow;
          } else {
            vm.model.internationalDialingEnabled = cbAlwaysAllow;
          }
          vm.model.internationalDialingUuid = cosRestriction.user[0].uuid;
        }
        var globalText;
        if (custRestriction) {
          cbUseGlobal.opt = $translate.instant('internationalDialingPanel.useGlobal') + "(" + $translate.instant('internationalDialingPanel.off') + ")";
        } else {
          cbUseGlobal.opt = $translate.instant('internationalDialingPanel.useGlobal') + "(" + $translate.instant('internationalDialingPanel.on') + ")";
        }
        if (!overRide) {
          vm.model.internationalDialingEnabled = cbUseGlobal;
          vm.model.internationalDialingUuid = null;
        }
      });
    }

    function resetForm() {
      if (vm.form) {
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function reset() {
      resetForm();
      init();
    }

    function saveInternationalDialing() {
      var cosType = {
        restriction: INTERNATIONAL_DIALING,
        blocked: false
      };
      var result = {
        msg: null,
        type: 'null'
      };

      if (vm.model.internationalDialingEnabled.val === "0") {
        cosType.blocked = true;
      } else {
        cosType.blocked = false;
      }
      return InternationalDialing.updateCosRestriction(vm.currentUser.id, vm.model.internationalDialingEnabled,
          vm.model.internationalDialingUuid, cosType).then(function () {
          initInternationalDialing();

          result.msg = $translate.instant('internationalDialingPanel.success');
          result.type = 'success';
          Notification.notify([result.msg], result.type);
        })
        .catch(function (response) {
          Notification.errorResponse(response, $translate.instant('internationalDialingPanel.error'));
        });
    }
  }
})();
