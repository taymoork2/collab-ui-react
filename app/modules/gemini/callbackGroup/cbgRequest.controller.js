(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgRequestCtrl', CbgRequestCtrl);

  /* @ngInject */
  function CbgRequestCtrl($state, $timeout, $scope, $rootScope, $stateParams, $translate, cbgService, Notification, gemService) {
    var vm = this;
    vm.allCountries = [];
    vm.isCsvValid = false;
    vm.downloadCountryUrl = cbgService.downloadCountryUrl;
    vm.onSubmit = onSubmit;
    vm.validateCsv = validateCsv;
    vm.removeCountry = removeCountry;
    vm.onFileSizeError = onFileSizeError;
    vm.onFileTypeError = onFileTypeError;
    vm.onSelectChange = onSelectChange;
    vm.onResetFile = onResetFile;

    vm.$onInit = $onInit;
    vm.options = [];
    vm.selected = [];
    vm.selectPlaceholder = $translate.instant('gemini.cbgs.request.selectPlaceholder');

    vm.model = {
      file: null,
      uploadProgress: 0,
      processProgress: 0,
      isProcessing: false,
    };
    vm.model.info = {};
    vm.model.info.countries = [];

    function $onInit() {
      $scope.$watchCollection(function () {
        return vm.model.file;
      }, function () {
        $timeout(vm.validateCsv);
      });
      getCountries();
      getDownloadUrl();
    }

    function getCountries() {
      cbgService.getCountries().then(function (res) {
        _.forEach(res.content.data, function (country) {
          vm.allCountries[country.countryName] = country;
          vm.options.push({ value: country.countryId, label: country.countryName, isSelected: false });
        });
      });
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
      if (vm.model.info.countries.length > 0) {
        vm.hideCountries = JSON.stringify(vm.model.info.countries);
      } else {
        vm.hideCountries = null;
      }
      vm.selectPlaceholder = vm.selected.length + $translate.instant('gemini.cbgs.request.syncPlaceholder');
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
          formateCountries(csvArray);
        }
        setUploadProgress(100);
      }
    }

    function setUploadProgress(percent) {
      vm.model.uploadProgress = percent;
      $scope.$digest();
    }

    function removeCountry(countryName) {
      _.remove(vm.model.info.countries, function (obj) {
        return obj.countryName === countryName;
      });
      if (!vm.model.info.countries.length) {
        vm.model.file = null;
        vm.hideCountries = null;
      }
      syncSelectCountries();
    }

    function onSubmit() {
      vm.loading = true;
      var customerId = _.get($stateParams, 'customerId', '');
      if (!customerId) {
        return;
      }

      cbgService.postRequest(customerId, vm.model.info).then(function (res) {
        var resJson = _.get(res.content, 'data');
        if (resJson.returnCode) {
          Notification.notify(gemService.showError(resJson.returnCode));
          return;
        }
        $rootScope.$emit('cbgsUpdate', true);
        $state.modal.close();
      });
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
    }

    function onResetFile() {
      vm.model.file = null;
      vm.model.info.countries = [];
      syncSelectCountries();
    }

    function getDownloadUrl() {
      cbgService.getDownloadCountryUrl().then(function (res) {
        vm.downloadUrl = _.get(res.content, 'data.body');
      });
    }

    function onFileSizeError() {
      Notification.error('firstTimeWizard.csvMaxSizeError');
    }

    function onFileTypeError() {
      Notification.error('firstTimeWizard.csvFileTypeError');
    }
  }
})();
