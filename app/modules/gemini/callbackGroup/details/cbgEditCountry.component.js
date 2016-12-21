(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgEditCountry', {
      templateUrl: 'modules/gemini/callbackGroup/details/cbgEditCountry.tpl.html',
      controller: cbgEditCountry
    });

  /* @ngInject */
  function cbgEditCountry($scope, $state, $rootScope, $stateParams, $timeout, $translate, PreviousState, Notification, cbgService, gemService) {
    var vm = this;
    vm.$onInit = $onInit;
    vm.allCountries = [];
    vm.btnLoading = false;
    vm.btnDisable = true;
    vm.customerId = _.get($stateParams, 'obj.customerId', '');
    vm.downloadCountryUrl = cbgService.downloadCountryUrl;
    vm.flags = {
      groupNameFlag: true,
      customerNameFlag: true,
      countryFlag: true
    };
    vm.isCsvValid = false;
    vm.isReadonly = false;
    vm.model = {
      file: null,
      uploadProgress: 0,
      processProgress: 0,
      isProcessing: false,
      fullFileName: '',
      info: _.get($stateParams, 'obj.info', {})
    };
    vm.options = [];
    vm.selected = [];
    vm.selectPlaceholder = $translate.instant('gemini.cbgs.request.selectPlaceholder');
    vm.onCancel = onCancel;
    vm.onCustomerNameChange = setBtnIsDisable;
    vm.onFileSizeError = onFileSizeError;
    vm.onFileTypeError = onFileTypeError;
    vm.onGroupNameChange = onGroupNameChange;
    vm.onRemoveCountry = onRemoveCountry;
    vm.onResetFile = onResetFile;
    vm.onSave = onSave;
    vm.onSelectChange = onSelectChange;
    vm.validateCsv = validateCsv;

    function $onInit() {
      $scope.$watchCollection(function () {
        return vm.model.file;
      }, function () {
        $timeout(vm.validateCsv);
      });
      if (vm.model.info.groupId) {
        vm.isReadonly = true;
      }
      $state.current.data.displayName = $translate.instant('gemini.cbgs.editCountry');
      getCountries();
    }

    function getCountries() {
      cbgService.getCountries().then(function (res) {
        _.forEach(res.content.data, function (country) {
          vm.allCountries[country.countryName] = country;
          vm.options.push({ value: country.countryId, label: country.countryName, isSelected: false });
        });
        syncSelectCountries();
      });
    }

    function onCancel() {
      PreviousState.go();
    }

    function onGroupNameChange() {
      vm.flags.groupNameFlag = !!vm.model.info.groupName;
      setBtnIsDisable();
    }

    function onResetFile() {
      vm.model.file = null;
      vm.model.info.countries = [];
      syncSelectCountries();
      vm.btnDisable = true;
    }

    function onRemoveCountry(countryName) {
      _.remove(vm.model.info.countries, function (obj) {
        return obj.countryName === countryName;
      });
      syncSelectCountries();
      setBtnIsDisable();
    }

    function onSelectChange() {
      vm.model.info.countries = [];
      _.forEach(vm.selected, function (obj) {
        var arr = { countryId: obj.value, countryName: obj.label };
        if (obj.isSelected) {
          vm.model.info.countries.push(arr);
        } else {
          _.remove(vm.model.info.countries, function (objc) {
            return objc.countryName === obj.label;
          });
        }
      });
      syncSelectCountries();
      setBtnIsDisable();
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
            Notification.notify(gemService.showError(resJson.returnCode));
            return;
          }
          $rootScope.$emit('cbgsUpdate', true);
          $state.go(PreviousState.get(), PreviousState.getParams(), { reload: true });
        })
        .catch(function (err) {
          Notification.errorResponse(err, 'errors.statusError', { status: err.status });
        });
    }

    function onFileSizeError() {
      Notification.error('firstTimeWizard.csvMaxSizeError');
    }

    function onFileTypeError() {
      Notification.error('firstTimeWizard.csvFileTypeError');
    }

    function validateCsv() {
      var csvArray = [];
      var csvHeaders = null;
      vm.isCsvValid = false;
      setUploadProgress(0);
      if (vm.model.file) {
        setUploadProgress(0);
        csvArray = $.csv.toArrays(vm.model.file);
        if (_.isArray(csvArray) && csvArray.length > 1 && _.isArray(csvArray[0])) {
          csvHeaders = csvArray.shift(); // First line is not empty -- need internationalization
          if (csvArray.length > 247) {
            return;
          }
          if (csvHeaders.length !== 1) {
            return;
          }
          vm.isCsvValid = true;
          substrFileName();
          formateCountries(csvArray);
        }
        setUploadProgress(100);
      }
    }

    function substrFileName() {
      if (vm.model.fileName.length > 30) {
        vm.model.fullFileName = vm.model.fileName;
        vm.model.fileName = vm.model.fileName.substr(0, 30) + '...';
      } else {
        vm.model.fullFileName = vm.model.fileName;
      }
    }

    function setUploadProgress(percent) {
      vm.model.uploadProgress = percent;
      $scope.$digest();
    }

    function formateCountries(data) {
      var countries = [];
      var importCountries = [];
      _.forEach(data, function (row) {
        importCountries.push({ countryName: row[0] });
      });

      _.forEach(importCountries, function (country) {
        if (vm.allCountries[country.countryName.trim()]) {
          countries.push(vm.allCountries[country.countryName.trim()]);
        }
      });

      _.forEach(vm.model.info.countries, function (existCountry) {
        _.remove(countries, function (country) {
          return country.countryName === existCountry.countryName;
        });
      });

      _.forEach(countries, function (country) {
        vm.model.info.countries.push(country);
      });
      syncSelectCountries();
      setBtnIsDisable();
    }

    function syncSelectCountries() {
      vm.selected = [];
      var selected_ = {};

      _.forEach(vm.model.info.countries, function (country) {
        if (vm.allCountries[country.countryName.trim()]) {
          var newObj = { value: country.countryId, label: country.countryName, isSelected: true };
          selected_[country.countryName] = newObj;
          vm.selected.push(newObj);
        }
      });

      _.forEach(vm.options, function (option) {
        option.isSelected = !!selected_[option.label];
      });
      vm.flags.countryFlag = !(vm.model.info.countries.length === 0);
      vm.selectPlaceholder = vm.selected.length + $translate.instant('gemini.cbgs.request.syncPlaceholder');
    }

    function setBtnIsDisable() {
      vm.btnDisable = !(vm.flags.groupNameFlag && vm.flags.customerNameFlag && vm.flags.countryFlag);
    }

  }
})();
