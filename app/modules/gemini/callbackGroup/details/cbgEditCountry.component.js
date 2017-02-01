(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgEditCountry', {
      controller: cbgEditCountry,
      templateUrl: 'modules/gemini/callbackGroup/details/cbgEditCountry.tpl.html'
    });

  /* @ngInject */
  function cbgEditCountry($scope, $state, $rootScope, $stateParams, $translate, PreviousState, Notification, cbgService, gemService) {
    var vm = this;
    var info = _.get($stateParams, 'obj.info', {});

    vm.countries = [];
    vm.btnDisable = true;
    vm.model = {
      groupName: _.get(info, 'groupName'),
      customerAttribute: _.get(info, 'customerAttribute')
    };
    vm.customerId = _.get($stateParams, 'obj.customerId', '');

    vm.onSave = onSave;
    vm.$onInit = $onInit;
    vm.onCancel = onCancel;
    vm.onSetBtnDisable = setBtnDisable;

    function $onInit() {
      vm.isReadonly = !!info.groupId;

      $scope.$watchCollection(function () {
        return vm.countries;
      }, function () {
        setBtnDisable('country');
      });

      _.forEach(info.countries, function (item) {
        vm.countries.push({ value: item.countryId, label: item.countryName });
      });

      $state.current.data.displayName = $translate.instant('gemini.cbgs.editCountry');
    }

    function onSave() {
      vm.btnLoading = true;
      var countries = formateCountry();
      var data = {
        countries: countries,
        groupId: info.groupId,
        customerId: vm.customerId,
        ccaGroupId: info.ccaGroupId,
        groupName: vm.model.groupName,
        customerName: vm.model.customerAttribute,
        callbackGroupSites: info.callbackGroupSites,
        customerAttribute: vm.model.customerAttribute
      };

      cbgService.updateCallbackGroup(data)
        .then(function (res) {
          var returnCode = _.get(res.content, 'data.returnCode');
          if (returnCode) {
            Notification.notify(gemService.showError(returnCode));
            return;
          }
          $rootScope.$emit('cbgsUpdate', true);
          $state.go(PreviousState.get(), PreviousState.getParams(), { reload: true });
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        });
    }

    function onCancel() {
      PreviousState.go();
    }

    function formateCountry() {
      var countries = [];
      _.forEach(vm.countries, function (item) {
        countries.push({ countryId: item.value, countryName: item.label });
      });
      return countries;
    }

    function setBtnDisable(flag) {
      if (!vm.countries.length || (!vm.isReadonly && !vm.model.groupName)) {
        vm.btnDisable = true;
        return;
      }

      switch (flag) {
        case 'groupName':
          var groupName = info.groupName === undefined ? '' : info.groupName;
          vm.btnDisable = (vm.model.groupName === groupName);
          return;
        case 'customerAttribute':
          var customerAttribute = info.customerAttribute === undefined ? '' : info.customerAttribute;
          vm.btnDisable = (vm.model.customerAttribute === customerAttribute);
          return;
        case 'country':
          var countries = formateCountry();
          vm.btnDisable = (JSON.stringify(countries) == JSON.stringify(info.countries));
          return;
      }
    }

  }
})();
