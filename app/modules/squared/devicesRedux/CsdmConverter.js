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
          product: obj.product,
          displayName: obj.displayName,
          cssColorClass: getCssColorClass(obj),
          readableState: getReadableState(obj),
          needsActivation: getNeedsActivation(obj),
          readableActivationCode: getReadableActivationCode(obj) // pyramidsort ftw!
        };
      });
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
        case 'UNKNOWN':
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
        case 'UNKNOWN':
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
