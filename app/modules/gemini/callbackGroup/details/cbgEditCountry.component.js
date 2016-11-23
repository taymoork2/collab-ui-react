(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgEditCountry', {
      templateUrl: 'modules/gemini/callbackGroup/details/cbgEditCountry.tpl.html',
      controller: cbgEditCountry
    });

  /* @ngInject */
  function cbgEditCountry($scope, $state, $stateParams, $translate, PreviousState, Notification, cbgService) {
    var vm = this;
    vm.model = {};
    vm.combo = true;
    vm.options = [];
    vm.selected = [];
    vm.$onInit = $onInit;
    vm.btnLoading = false;
    vm.btnDisable = true;
    vm.onSave = onSave;
    vm.onCancel = onCancel;
    vm.onRemoveCountry = onRemoveCountry;
    vm.onSelectChange = onSelectChange;
    vm.selectPlaceholder = 'Select your country';
    vm.model.info = _.get($stateParams, 'obj.info', {});
    vm.downloadCountryUrl = cbgService.downloadCountryUrl;
    vm.customerId = _.get($stateParams, 'obj.customerId', '');

    function $onInit() {
      $state.current.data.displayName = $translate.instant('gemini.cbgs.editCountry');
      cbgService.getCountries().then(function (res) {
        var arr = res.content.data;
        _.forEach(arr, function (oneObj) {
          vm.options.push({ value: oneObj.countryId, label: oneObj.countryName, isSelected: false });
        });
      });
    }

    function onRemoveCountry(countryName) {
      _.remove(vm.model.info.countries, function (obj) {
        return obj.countryName === countryName;
      });
      if (vm.selected.length) {
        _.remove(vm.selected, function (obj) {
          return obj.label == countryName;
        });
      }
      vm.btnDisable = false;
    }

    function onSelectChange() {
      _.forEach(vm.selected, function (obj) {
        var arr = { countryId: obj.value, countryName: obj.label };
        _.remove(vm.model.info.countries, function (objc) {
          return objc.countryName === obj.label;
        });
        vm.model.info.countries.push(arr);
      });
      vm.btnDisable = false;
    }

    function onSave() {
      vm.btnLoading = true;
      var countries = [];
      _.forEach(vm.model.info.countries, function (obj) {
        countries.push({ countryId: obj.countryId, countryName: obj.countryName });
      });
      var data = {
        customerId: vm.customerId,
        groupId: vm.model.info.groupId,
        groupName: vm.model.info.groupName,
        ccaGroupId: vm.model.info.ccaGroupId,
        countries: countries,
        customerAttribute: vm.model.info.customerAttribute,
        customerName: vm.model.info.customerAttribute,
        callbackGroupSites: vm.model.info.callbackGroupSites
      };

      cbgService.updateCallbackGroup(data)
        .then(function (res) {
          var resJson = _.get(res.content, 'data');
          if (resJson.returnCode) {
            Notification.error('Failed to update callback Group');
            return;
          }
          PreviousState.go();
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status }); // TODO will defined the wording
        });
    }

    function onCancel() {
      PreviousState.go();
    }
  }
})();
