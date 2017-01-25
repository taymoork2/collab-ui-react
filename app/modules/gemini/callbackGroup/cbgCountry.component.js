(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgCountry', {
      bindings: {
        selected: '='
      },
      controller: cbgCountryCtrl,
      templateUrl: 'modules/gemini/callbackGroup/cbgCountry.tpl.html'
    });

  /* @ngInject */
  function cbgCountryCtrl($scope, $timeout, $translate, Notification, cbgService) {
    var vm = this;
    vm.model = {
      file: null,
      fullFileName: '',
      uploadProgress: 0,
      processProgress: 0,
      isProcessing: false
    };

    vm.options = [];
    vm.allCountries = []; // for compare when import
    vm.selectPlaceholder = $translate.instant('gemini.cbgs.request.selectPlaceholder');

    vm.$onInit = $onInit;
    vm.onResetFile = onResetFile;
    vm.validateCsv = validateCsv;
    vm.onDelSelected = onDelSelected;
    vm.onFileSizeError = onFileSizeError;
    vm.onFileTypeError = onFileTypeError;

    function $onInit() {
      vm.selected = vm.selected ? vm.selected : [];

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
        _.forEach(res.content.data, function (item) {
          vm.allCountries[item.countryName] = item;
          vm.options.push({ value: item.countryId, label: item.countryName });
          if (vm.selected.length) {
            updateOptions();
          }
        });
      });
    }

    function getDownloadUrl() {
      cbgService.getDownloadCountryUrl().then(function (res) {
        vm.downloadUrl = _.get(res.content, 'data.body');
      });
    }

    function updateOptions() {
      var selected = {};
      _.forEach(vm.selected, function (item) {
        selected[item.label] = item;
      });

      _.forEach(vm.options, function (item) {
        item.isSelected = !!selected[item.label];
      });

      vm.selectPlaceholder = vm.selected.length + $translate.instant('gemini.cbgs.request.syncPlaceholder');
      if (!vm.selected.length) {
        vm.selectPlaceholder = $translate.instant('gemini.cbgs.request.selectPlaceholder');
      }
    }

    function onResetFile() {
      vm.selected = [];
      vm.model.file = null;
      updateOptions();
    }

    function onDelSelected(label) {
      _.remove(vm.selected, function (obj) {
        return obj.label === label;
      });

      if (!vm.selected.length) {
        onResetFile();
      } else {
        updateOptions();
      }
    }

    function validateCsv() {
      var csvArray = [];
      vm.isCsvValid = false;
      setUploadProgress(0);
      if (vm.model.file) {
        setUploadProgress(0);
        csvArray = $.csv.toArrays(vm.model.file);
        if (_.isArray(csvArray) && csvArray.length > 1 && _.isArray(csvArray[0])) {
          csvArray.shift(); // remove first line

          formateCountries(csvArray);
          if (vm.inValidCountry) {
            Notification.error('Invalid countryName: ' + vm.inValidCountry); // TODO wording in l10n
          } else {
            updateOptions();
            substrFileName();
            vm.isCsvValid = true;
          }
        }
        setUploadProgress(100);
      }
    }

    function formateCountries(data) {
      var countries = [];
      vm.inValidCountry = '';
      _.forEach(data, function (item) {
        var key = _.trim(item[0]);
        if (!vm.allCountries[key]) {
          vm.inValidCountry = key;
          return false;
        }
        countries.push({ value: vm.allCountries[key].countryId, label: key });
      });

      vm.selected = countries;
    }

    function setUploadProgress(percent) {
      vm.model.uploadProgress = percent;
      $scope.$digest();
    }

    function substrFileName() {
      vm.model.fullFileName = vm.model.fileName;

      if (vm.model.fileName.length > 30) {
        vm.model.fileName = vm.model.fileName.substr(0, 30) + '...';
      }
    }

    function onFileSizeError() {
      Notification.error('firstTimeWizard.csvMaxSizeError');
    }

    function onFileTypeError() {
      Notification.error('firstTimeWizard.csvFileTypeError');
    }
  }
})();
