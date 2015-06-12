'use strict';

angular.module('Squared').service('CsdmConverter',

  /* @ngInject  */
  function ($translate) {

    var convert = function (arr) {
      return _.map(arr, function (obj) {
        return {
          url: obj.url,
          mac: obj.mac,
          serial: obj.serial,
          software: getSoftware(obj),
          ip: getIp(obj),
          product: getProduct(obj),
          displayName: obj.displayName,
          cssColorClass: getCssColorClass(obj),
          readableState: getReadableState(obj),
          needsActivation: getNeedsActivation(obj),
          readableActivationCode: getReadableActivationCode(obj), // pyramidsort ftw!
          diagnosticsEvents: getDiagnosticsEvents(obj)
        };
      });
    };

    var getProduct = function (obj) {
      return obj.product == 'UNKNOWN' ? '' : obj.product;
    };

    var getSoftware = function (obj) {
      return _.chain(getEvents(obj))
        .where({
          type: 'software',
          level: 'INFO'
        })
        .pluck('description')
        .first()
        .value();
    };

    var getIp = function (obj) {
      return _.chain(getEvents(obj))
        .where({
          type: 'ip',
          level: 'INFO'
        })
        .pluck('description')
        .first()
        .value();
    };

    var getDiagnosticsEvents = function (obj) {
      return _.map(getNotOkEvents(obj), function (e) {
        // todo lookup in translate based on type when we have that!
        return {
          type: ($translate.instant('CsdmStatus.errorCodes.' + e.type + '.type') 
            != 'CsdmStatus.errorCodes.' + e.type + '.type') 
            ? $translate.instant('CsdmStatus.errorCodes.' + e.type + '.type')
            : e.type,
          message: ($translate.instant('CsdmStatus.errorCodes.' + e.type + '.message') 
            != 'CsdmStatus.errorCodes.' + e.type + '.message') 
            ? $translate.instant('CsdmStatus.errorCodes.' + e.type + '.message')
            : e.description
        };
      });
    };

    var getNotOkEvents = function (obj) {
      return _.reject(getEvents(obj), function (e) {
        return (e.level == 'OK' || e.type == 'ip' || e.type == 'software');
      });
    };

    var getEvents = function (obj) {
      return (obj.status && obj.status.events) || [];
    };

    var getNeedsActivation = function (obj) {
      return obj.state == 'UNCLAIMED';
    };

    var getReadableActivationCode = function (obj) {
      if (obj.activationCode) {
        return obj.activationCode.match(/.{4}/g).join(' ');
      }
    };

    var getReadableState = function (obj) {
      switch (obj.state) {
      case 'UNCLAIMED':
        return t('CsdmStatus.NeedsActivation');
      case 'CLAIMED':
        switch ((obj.status || {}).connectionStatus) {
        case 'CONNECTED':
          return t('CsdmStatus.Online');
        default:
          return t('CsdmStatus.Offline');
        }
      }
      return t('CsdmStatus.Unknown');
    };

    var getCssColorClass = function (obj) {
      switch (obj.state) {
      case 'UNCLAIMED':
        return 'device-status-yellow';
      case 'CLAIMED':
        switch ((obj.status || {}).connectionStatus) {
        case 'CONNECTED':
          return 'device-status-green';
        default:
          return 'device-status-gray';
        }
      }
      return 'device-status-yellow';
    };

    var t = function (key) {
      return $translate.instant(key);
    };

    return {
      convert: convert
    };

  }
);
