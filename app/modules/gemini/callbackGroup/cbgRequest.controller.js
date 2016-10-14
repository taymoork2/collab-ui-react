(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('CbgRequestCtrl', CbgRequestCtrl);

  /* @ngInject */
  function CbgRequestCtrl($state, $timeout, $scope, $rootScope, $stateParams, cbgService, Notification) {
    var vm = this;
    vm.isCsvValid = false;
    vm.onSubmit = onSubmit;
    vm.resetFile = resetFile;
    vm.validateCsv = validateCsv;
    vm.removeCountry = removeCountry;
    vm.onFileSizeError = onFileSizeError;
    vm.onFileTypeError = onFileTypeError;

    vm.model = {
      file: null,
      uploadProgress: 0,
      processProgress: 0,
      isProcessing: false,
    };
    vm.model.postData = {};

    $scope.$watchCollection(function () {
      return vm.model.file;
    }, function () {
      $timeout(vm.validateCsv);
    });

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
          if (csvArray.length > 247) return;
          if (csvHeaders.length !== 1) return;
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
      _.remove(vm.model.postData.countries, function (obj) {
        return obj.countryName === countryName;
      });
      if (!vm.model.postData.countries.length) {
        vm.model.file = null;
        vm.hideCountries = null;
      }
    }

    function onSubmit() {
      vm.loading = true;
      var customerId = _.get($stateParams, 'customerId', '');
      if (!customerId) return;
      cbgService.postRequest(customerId, vm.model.postData).then(function (res) {
        var resJson = _.get(res.content, 'data');
        if (resJson.returnCode) {
          Notification.error(resJson.message);
          return;
        }
        $rootScope.$emit('cbgsUpdate', true);
        $state.modal.close();
      });
    }

    function formateCountries(data) {
      var countries = [];
      _.forEach(data, function (row) {
        countries.push({ countryName: row[0] });
      });
      vm.model.postData.countries = countries;
      vm.hideCountries = JSON.stringify(vm.model.postData.countries);
    }

    function resetFile() {
      vm.model.file = null;
      vm.model.postData.countries = null;
      vm.hideCountries = null;
    }

    function onFileSizeError() {
      Notification.error('firstTimeWizard.csvMaxSizeError');
    }

    function onFileTypeError() {
      Notification.error('firstTimeWizard.csvFileTypeError');
    }
  }
})();
