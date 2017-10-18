(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgEditCountry', {
      controller: cbgEditCountry,
      template: require('modules/gemini/callbackGroup/details/cbgEditCountry.tpl.html'),
    });

  /* @ngInject */
  function cbgEditCountry($scope, $state, $element, $rootScope, $stateParams, $translate, PreviousState, Notification, cbgService) {
    var vm = this;
    var info = _.get($stateParams, 'obj.info', {});

    vm.countries = [];
    vm.btnDisable = true;
    vm.model = {
      groupId: _.get(info, 'groupId'),
      groupName: _.get(info, 'groupName') || _.get(info, 'customerName'),
      customerAttribute: _.get(info, 'customerAttribute'),
    };
    vm.groupNameLabel = vm.model.groupId ? $translate.instant('gemini.cbgs.field.cbgName') : $translate.instant('gemini.cbgs.request.labelCustomer');
    vm.customerId = _.get($stateParams, 'obj.customerId', '');

    vm.onSave = onSave;
    vm.$onInit = $onInit;
    vm.onCancel = onCancel;
    vm.onSetBtnDisable = setBtnDisable;
    vm.messages = {
      groupName: {
        required: $translate.instant('common.invalidRequired'),
        maxlength: $translate.instant('gemini.inputLengthError', { length: 64, field: vm.groupNameLabel }),
      },
      customerAttribute: {
        maxlength: $translate.instant('gemini.inputLengthError', { length: 200, field: $translate.instant('gemini.cbgs.field.alias') }),
      },
    };

    function $onInit() {
      $scope.$watchCollection(function () {
        return vm.countries;
      }, function () {
        setBtnDisable('country');
      });

      vm.countries = _.map(info.countries, function (item) {
        return { value: item.id, label: item.name };
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
        customerName: vm.model.groupName,
        callbackGroupSites: info.callbackGroupSites,
        customerAttribute: vm.model.customerAttribute,
      };

      $element.find('input').attr('readonly', true);
      $element.find('a.select-toggle').addClass('disabled');
      cbgService.updateCallbackGroup(data)
        .then(function () {
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
      return _.map(vm.countries, function (item) {
        return { id: item.value, name: item.label };
      });
    }

    function setBtnDisable(flag) {
      if (!vm.countries.length || !vm.model.groupName) {
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
      }
    }
  }
})();
