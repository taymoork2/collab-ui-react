(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('cbgCountry', {
      bindings: {
        selected: '=',
      },
      controller: cbgCountryCtrl,
      template: require('modules/gemini/callbackGroup/cbgCountry.tpl.html'),
    });

  /* @ngInject */
  function cbgCountryCtrl($scope, $modal, $timeout, $translate, Notification, cbgService, WindowLocation) {
    var vm = this;
    vm.model = {
      file: null,
      fullFileName: '',
      uploadProgress: 0,
      processProgress: 0,
      isProcessing: false,
    };

    vm.options = [];
    vm.allCountries = {}; // for compare when import
    vm.selectPlaceholder = $translate.instant('gemini.cbgs.request.selectPlaceholder');

    vm.$onInit = $onInit;
    vm.onResetFile = onResetFile;
    vm.validateCsv = validateCsv;
    vm.onDelSelected = onDelSelected;
    vm.onFileSizeError = onFileSizeError;
    vm.onFileTypeError = onFileTypeError;
    vm.onDownloadTemplate = onDownloadTemplate;

    function $onInit() {
      vm.selected = vm.selected ? vm.selected : [];

      $scope.$watchCollection(function () {
        return vm.model.file;
      }, function () {
        $timeout(vm.validateCsv);
      });

      getCountries();
    }

    function getCountries() {
      cbgService.getCountries()
        .then(function (res) {
          _.forEach(res, function (item) {
            var key = item.name.replace(/[()".\-+,\s]/g, '');
            vm.allCountries[key] = item;
            vm.options.push({ value: item.id, label: item.name });
            if (vm.selected.length) {
              updateOptions();
            }
          });
          vm.enableBtn = true;
        })
        .catch(function () {
          vm.enableBtn = false;
        });
    }

    function onDownloadTemplate() {
      $modal.open({
        type: 'dialog',
        template: require('modules/gemini/telephonyDomain/details/downloadConfirm.html'),
      }).result.then(function () {
        WindowLocation.set(cbgService.getDownloadCountryUrl());
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
        csvArray = _.split(vm.model.file, '\r\n');
        if (_.size(csvArray) > 1) {
          formateCountries(csvArray);
          updateOptions();
          substrFileName();
          vm.isCsvValid = true;
          if (vm.inValidCountry) {
            Notification.error('gemini.cbgs.invalidCountry', { country: vm.inValidCountry });
          }
        }
        setUploadProgress(100);
      }
    }

    function formateCountries(data) {
      var countries = [];
      var inValidCountry = [];
      _.forEach(data, function (item) {
        var key = _.replace(item, /[()".\-+/,\s]/g, '');
        if (_.includes(key, 'Countries') || _.includes(key, 'Regions')) {
          return true;
        }
        if (!vm.allCountries[key]) {
          inValidCountry.push(item);
          return true;
        }
        countries.push({ value: vm.allCountries[key].id, label: vm.allCountries[key].name });
      });
      vm.inValidCountry = _.join(inValidCountry, ',');
      vm.selected = _.unionBy(vm.selected, countries, 'value');
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
