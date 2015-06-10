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
          product: getProduct(obj),
          displayName: obj.displayName,
          cssColorClass: getCssColorClass(obj),
          readableState: getReadableState(obj),
          needsActivation: getNeedsActivation(obj),
          readableActivationCode: getReadableActivationCode(obj) // pyramidsort ftw!
        };
      });
    };

    var getProduct = function (obj) {
      return obj.product == 'UNKNOWN' ? '' : obj.product;
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
