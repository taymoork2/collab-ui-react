require('./_cdr-logs.scss');

(function () {
  'use strict';

  angular
    .module('uc.cdrlogsupport')
    .controller('CdrLogsCtrl', CdrLogsCtrl);

  /* @ngInject */
  function CdrLogsCtrl($scope, $state, $translate, CdrService, Notification) {
    var vm = this;
    var ABORT = 'ABORT';
    vm.SEARCH = 1;
    vm.UPLOAD = 2;
    var SPARKTRUNK = 'COMMON_TO_SQUARED_TRUNK';
    var SPARKINTTRUNK = 'COMMON_TO_SQUARED_INT_TRUNK';
    var MAX_LIMIT = 28;
    var LOGSTASH_WILDCARD = 'logstash*';
    var INVALID_DATE = 'Invalid date';

    var timeFormat = 'hh:mm:ss A';
    var dateFormat = 'YYYY-MM-DD';
    var dateLogstashFormat = 'YYYY.MM.DD';
    var dateLogstashNodaysFormat = 'YYYY.MM.*';


    var errorStatus = [16, 19, 393216, 0, 17, 1, 21];
    var today = moment().format(dateFormat);
    vm.logstashPath = '';
    vm.filetype = 'text/json, application/json';
    vm.gridData = [];
    vm.dataState = null;
    vm.selectedCDR = null;
    vm.model = {
      callingPartyNumber: '',
      calledPartyNumber: '',
      searchUpload: vm.SEARCH,
      startTime: moment().format(timeFormat),
      endTime: moment().format(timeFormat),
      startDate: moment().subtract(1, 'days').format(dateFormat),
      endDate: moment().format(dateFormat),
      hitSize: 50,
    };
    vm.updateLogstashPath = updateLogstashPath;
    vm.fileTypeError = fileTypeError;
    vm.maxSizeError = maxSizeError;
    vm.hideUpload = hideUpload;
    vm.uploadDisabled = uploadDisabled;
    vm.uploadFile = uploadFile;

    //TODO: remove this once the ng-change is availabe with cs-datepicker directive!!
    $scope.cdr = {
      model: {},
    };
    $scope.$watch('cdr.model.endDate', function () {
      vm.validations.endDate();
    });
    $scope.$watch('cdr.model.startDate', function () {
      vm.validations.startDate();
    });

    vm.radioOptions = [{
      label: $translate.instant('cdrLogs.searchForm'),
      value: vm.SEARCH,
      name: 'radioSearchUpload',
      id: 'cdrSearch',
    }, {
      label: $translate.instant('cdrLogs.uploadFile'),
      value: vm.UPLOAD,
      name: 'radioSearchUpload',
      id: 'cdrUpload',
    }];
    vm.radioSelected = vm.SEARCH;

    vm.messages = {
      number: {
        pattern: $translate.instant('cdrLogs.phoneNumberError'),
        invalid: $translate.instant('cdrLogs.phoneNumberErrorTwo'),
      },
      time: {
        required: $translate.instant('cdrLogs.required'),
        pattern: $translate.instant('cdrLogs.invalidTime'),
      },
      date: {
        invalidStartDate: $translate.instant('cdrLogs.invalidStartDate'),
        invalidEndDate: $translate.instant('cdrLogs.invalidEndDate'),
        invalidFutureDate: $translate.instant('cdrLogs.invalidFutureDate'),
      },
      hitSize: {
        required: $translate.instant('cdrLogs.required'),
        number: $translate.instant('cdrLogs.invalidNumber'),
        min: $translate.instant('cdrLogs.hitSizeError'),
        max: $translate.instant('cdrLogs.hitSizeError'),
      },
    };

    vm.patterns = {
      number: /^(\+[1-9])?([0-9]+)$/,
      time: /^([0-2][0-9][:])([0-5][0-9][:])([0-5][0-9])([ ][apAP][mM])?$/,
    };

    vm.search = function () {
      vm.searchDisabled = true;
      vm.gridData = null;
      vm.dataState = 1;
      vm.selectedCDR = null;
      CdrService.query(vm.model, vm.logstashPath).then(function (response) {
        if (response !== ABORT) {
          vm.gridData = response;
          if (_.isUndefined(vm.gridData) || (vm.gridData.length === 0)) {
            vm.dataState = 0;
          }
        }
      }).finally(function () {
        vm.searchDisabled = false;
      });
    };

    vm.reset = function () {
      vm.selectedCDR = null;
      vm.model.callingUser = '';
      vm.model.calledUser = '';
      vm.model.callingPartyNumber = '';
      vm.model.calledPartyNumber = '';
      vm.model.callingPartyDevice = '';
      vm.model.calledPartyDevice = '';
      vm.model.startTime = moment().format(timeFormat);
      vm.model.endTime = moment().format(timeFormat);
      vm.model.startDate = moment().subtract(1, 'days').format(dateFormat);
      vm.model.endDate = moment().format(dateFormat);
      vm.model.hitSize = 50;
      vm.searchAndUploadForm.$setPristine();
    };

    function updateLogstashPath() {
      vm.logstashPath = '';
      var startDate = moment(vm.model.startDate);
      var diffDays = moment(vm.model.endDate).diff(moment(vm.model.startDate), 'days');
      var diffMonths = moment(vm.model.endDate).diff(moment(vm.model.startDate), 'months');

      if (diffDays < MAX_LIMIT) {
        for (var i = 0; i <= diffDays; i++) {
          vm.logstashPath += ((i > 0) ? ',' : '') + 'logstash-' + startDate.format(dateLogstashFormat);
          startDate.add(1, 'days');
        }
      } else {
        if (diffMonths < MAX_LIMIT) {
          for (i = 0; i <= diffMonths; i++) {
            vm.logstashPath += ((i > 0) ? ',' : '') + 'logstash-' + startDate.format(dateLogstashNodaysFormat);
            startDate.add(1, 'months');
          }
        } else {
          vm.logstashPath = LOGSTASH_WILDCARD;
        }
      }

      if (vm.logstashPath.indexOf(INVALID_DATE) > 0) {
        vm.logstashPath = LOGSTASH_WILDCARD;
      }
    }

    vm.validations = {
      callingNumber: function () {
        var isValid = true;
        if (vm.model.calledPartyNumber !== '') {
          isValid = !(vm.model.callingPartyNumber === vm.model.calledPartyNumber);
        }
        vm.searchAndUploadForm.callingPartyNumber.$setValidity('invalid', isValid);
        if (isValid) {
          vm.searchAndUploadForm.calledPartyNumber.$setValidity('invalid', isValid);
        }
      },
      calledNumber: function () {
        var isValid = true;
        if (vm.model.callingPartyNumber !== '') {
          isValid = !(vm.model.callingPartyNumber === vm.model.calledPartyNumber);
        }
        vm.searchAndUploadForm.calledPartyNumber.$setValidity('invalid', isValid);
        if (isValid) {
          vm.searchAndUploadForm.callingPartyNumber.$setValidity('invalid', isValid);
        }
      },
      startDate: function () {
        var isValid = !!(moment(vm.model.endDate).format() >= moment(vm.model.startDate).format());
        vm.searchAndUploadForm.startDate.$setValidity('invalidRange', isValid);
        isValid = !!(moment(today).format() >= moment(vm.model.startDate).format());
        vm.searchAndUploadForm.startDate.$setValidity('invalidDate', isValid);
        if (isValid) {
          updateLogstashPath();
        }
      },
      endDate: function () {
        var isValid = !!(moment(vm.model.endDate).format() >= moment(vm.model.startDate).format());
        vm.searchAndUploadForm.endDate.$setValidity('invalidRange', isValid);
        isValid = !!(moment(today).format() >= moment(vm.model.endDate).format());
        vm.searchAndUploadForm.endDate.$setValidity('invalidDate', isValid);
        if (isValid) {
          updateLogstashPath();
        }
      },
    };

    vm.statusAvalibility = statusAvalibility;
    vm.getAccordionHeader = getAccordionHeader;
    vm.selectCDR = selectCDR;

    function addNames(cdrArray) {
      var x = 0;
      _.forEach(cdrArray, function (cdr) {
        _.forEach(cdr, function (item) {
          item.name = 'call0CDR' + x;
          x++;
        });
      });

      return cdrArray;
    }

    function statusAvalibility(cdrArray) {
      // returns danger if both the calling and called cause codes for each cdr in the array is in the errorStatus array
      for (var callSeg = 0; callSeg < cdrArray.length; callSeg++) {
        for (var i = 0; i < cdrArray[callSeg].length; ++i) {
          if ((errorStatus.indexOf(cdrArray[callSeg][i].dataParam.calling_cause_Value) > -1) && (errorStatus.indexOf(cdrArray[callSeg][i].dataParam.called_cause_Value) > -1)) {
            return 'danger';
          }
        }
      }
      return 'primary';
    }

    function isSparkCall(cdrDataParam) {
      if (cdrDataParam.called_deviceName === SPARKTRUNK || cdrDataParam.called_deviceName === SPARKINTTRUNK) {
        return true;
      } else if (cdrDataParam.calling_deviceName === SPARKTRUNK || cdrDataParam.calling_deviceName === SPARKINTTRUNK) {
        return true;
      }
      return false;
    }

    function getAccordionHeader(cdrArray) {
      var firstTimestamp = cdrArray[0][0]['@timestamp'];
      var numberOfCdrs = 0;
      var totalDuration = 0;
      var sparkCall = false;
      var header = '';
      for (var callSeg = 0; callSeg < cdrArray.length; callSeg++) {
        for (var i = 0; i < cdrArray[callSeg].length; i++) {
          totalDuration += cdrArray[callSeg][i].dataParam.duration;
          if (cdrArray[callSeg][i]['@timestamp'] < firstTimestamp) {
            firstTimestamp = cdrArray[callSeg][i]['@timestamp'];
          }
          if (!sparkCall) {
            sparkCall = isSparkCall(cdrArray[callSeg][i]['dataParam']);
          }
          numberOfCdrs++;
        }
      }
      header = $translate.instant('cdrLogs.cdrAccordionHeader', {
        firstTimestamp: firstTimestamp,
        numberOfCdrs: numberOfCdrs,
        totalDuration: totalDuration,
      });
      if (sparkCall) {
        header += ' ' + $translate.instant('cdrLogs.sparkCall');
      }
      return header;
    }

    function uploadFile() {
      vm.selectedCDR = null;
      vm.dataState = 1;
      try {
        var jsonData = JSON.parse(vm.model.uploadFile);
        vm.gridData = [];
        if (_.isArray(jsonData.cdrs) && _.isArray(jsonData.cdrs[0])) {
          vm.gridData.push(addNames(jsonData.cdrs));
        } else if (_.isArray(jsonData.cdrs)) {
          vm.gridData.push(addNames([jsonData.cdrs]));
        } else {
          vm.dataState = 0;
          Notification.error('cdrLogs.jsonAllowedFormatError');
        }
      } catch (SyntaxError) {
        vm.dataState = 0;
        Notification.error('cdrLogs.jsonSyntaxError');
      }
    }

    function hideUpload() {
      return vm.model.searchUpload !== vm.UPLOAD;
    }

    function uploadDisabled() {
      return _.isUndefined(vm.model.uploadFile);
    }

    function fileTypeError() {
      $scope.$apply(function () {
        Notification.error('cdrLogs.jsonTypeError');
      });
    }

    function maxSizeError() {
      $scope.$apply(function () {
        Notification.error('cdrLogs.jsonSizeError');
      });
    }

    function selectCDR(selectedCDR, call) {
      vm.selectedCDR = selectedCDR;
      var callCopy = _.cloneDeep(call);

      _.forEach(callCopy, function (item) {
        _.forEach(item, function (cdr) {
          delete cdr['name'];
        });
      });

      $state.go('cdr-overview', {
        cdrData: vm.selectedCDR,
        call: callCopy,
        uniqueIds: CdrService.extractUniqueIds(call),
        events: vm.events,
        imported: vm.imported,
        logstashPath: vm.logstashPath,
      });
    }
  }
})();
