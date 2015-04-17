(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('serviceSetupCtrl', serviceSetupCtrl);

  /* @ngInject */
  function serviceSetupCtrl($scope, $q, Log, ServiceSetup, HttpUtils, Notification, $translate) {
    var DEFAULT_SITE_INDEX = '000001';
    var DEFAULT_TZ = 'America/Los_Angeles';
    var DEFAULT_SD = '9';
    var DEFAULT_SITE_SD = '8';
    var DEFAULT_SITE_CODE = '100';
    var DEFAULT_MOH = 'ciscoDefault';
    var DEFAULT_FROM = '5000';
    var DEFAULT_TO = '5999';

    $scope.timeZones = [
      "Pacific/Honolulu",
      "America/Anchorage",
      "America/Los_Angeles",
      "America/Phoenix",
      "America/Denver",
      "America/Chicago",
      "America/Mexico_City",
      "America/Regina",
      "America/Lima",
      "Africa/Abidjan",
      "America/Halifax",
      "America/La_Paz",
      "America/St_Johns",
      "America/Sao_Paulo",
      "America/Araguaina",
      "America/Noronha",
      "Atlantic/Azores",
      "Etc/GMT"
    ];
    $scope.steeringDigits = [
      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ];
    $scope.site = {
      siteIndex: DEFAULT_SITE_INDEX,
      timeZone: DEFAULT_TZ,
      steeringDigit: DEFAULT_SD,
      siteSteeringDigit: DEFAULT_SITE_SD,
      siteCode: DEFAULT_SITE_CODE
    };
    $scope.globalMOH = DEFAULT_MOH;
    $scope.internalNumberRanges = [];
    $scope.firstTimeSetup = true;

    var setSteeringDigit = function () {
      // sets firstTimeSetup to false if a site exists
      ServiceSetup.listSites().then(function () {
        if (ServiceSetup.sites.length !== 0) {
          ServiceSetup.getSite(ServiceSetup.sites[0].uuid).then(function (site) {
            $scope.site.steeringDigit = site.steeringDigit;
            $scope.site.siteSteeringDigit = site.siteSteeringDigit;
            $scope.site.siteCode = site.siteCode;
            $scope.firstTimeSetup = false;
          });
        } else {
          $scope.firstTimeSetup = true;
        }
      });
    };

    var listInternalExtentionRanges = function () {
      ServiceSetup.listInternalNumberRanges().then(function () {
        $scope.internalNumberRanges = ServiceSetup.internalNumberRanges;
        // sort - order by beginNumber ascending
        $scope.internalNumberRanges.sort(function (a, b) {
          return a.beginNumber - b.beginNumber;
        });

        if ($scope.internalNumberRanges.length === 0) {
          $scope.internalNumberRanges.push({
            beginNumber: DEFAULT_FROM,
            endNumber: DEFAULT_TO
          });
        }
      });
    };

    $scope.addNewInternalNumberRange = function () {
      $scope.internalNumberRanges.push({
        beginNumber: '',
        endNumber: ''
      });
    };

    $scope.deleteInternalNumberRange = function (index, internalNumberRange) {
      if (internalNumberRange.uuid) {
        ServiceSetup.deleteInternalNumberRange(internalNumberRange)
          .then(function () {
            $scope.internalNumberRanges.splice(index, 1);
            if ($scope.internalNumberRanges.length === 0) {
              $scope.internalNumberRanges.push({
                beginNumber: DEFAULT_FROM,
                endNumber: DEFAULT_TO
              });
            }
            Log.debug('Delete InternalNumberRange Success! -- ' + JSON.stringify(internalNumberRange));
          })
          .catch(function () {
            Log.debug('Delete InternalNumberRange Failure! -- ' + JSON.stringify(internalNumberRange));
          });
      } else {
        $scope.internalNumberRanges.splice(index, 1);
      }
    };

    function validate() {
      // Validate DNs
      var isDnValid = true;
      var invalidDn = '';
      angular.forEach($scope.internalNumberRanges, function (dn) {
        if (dn.beginNumber.length !== 4) {
          isDnValid = false;
          invalidDn += (', ' + dn.beginNumber);
        }
        if (dn.endNumber.length !== 4) {
          isDnValid = false;
          invalidDn += (', ' + dn.endNumber);
        }
      });
      if (!isDnValid) {
        Notification.notify([$translate.instant('serviceSetupModal.extensionError') + invalidDn.slice(2)], 'error');
      }
      return isDnValid;
    }

    $scope.initNext = function () {
      if (!validate()) {
        return $q.reject('Field validation failed.');
      } else {
        var deferreds = [];
        if ($scope.firstTimeSetup) {
          deferreds.push(ServiceSetup.createSite($scope.site).then(function () {
            $scope.firstTimeSetup = false;
          }));
        }
        if ($scope.internalNumberRanges && $scope.internalNumberRanges.length > 0) {
          deferreds.push(ServiceSetup.createInternalNumberRanges($scope.internalNumberRanges));
        }
        return $q.all(deferreds).then(function () {
          listInternalExtentionRanges();
        });
      }
    };

    HttpUtils.setTrackingID().then(function () {
      setSteeringDigit();
      listInternalExtentionRanges();
    });
  }
})();
