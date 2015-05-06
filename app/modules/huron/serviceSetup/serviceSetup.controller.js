(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('ServiceSetupCtrl', ServiceSetupCtrl);

  /* @ngInject */
  function ServiceSetupCtrl($scope, $q, ServiceSetup, HttpUtils, Notification, $translate) {
    var DEFAULT_SITE_INDEX = '000001';
    var DEFAULT_TZ = 'America/Los_Angeles';
    var DEFAULT_SD = '9';
    var DEFAULT_SITE_SD = '8';
    var DEFAULT_SITE_CODE = '100';
    var DEFAULT_MOH = 'ciscoDefault';
    var DEFAULT_FROM = '5000';
    var DEFAULT_TO = '5999';

    $scope.steeringDigits = [
      "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ];
    $scope.site = {
      siteIndex: DEFAULT_SITE_INDEX,
      steeringDigit: DEFAULT_SD,
      siteSteeringDigit: DEFAULT_SITE_SD,
      siteCode: DEFAULT_SITE_CODE
    };
    $scope.globalMOH = DEFAULT_MOH;
    $scope.internalNumberRanges = [];
    $scope.firstTimeSetup = true;

    var getTimezones = function () {
      ServiceSetup.getTimeZones().then(function (timezones) {
        $scope.timeZones = timezones;
        $scope.site.timeZone = DEFAULT_TZ;
      });
    };

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
            Notification.notify([$translate.instant('serviceSetupModal.extensionDeleteSuccess', {
              extension: internalNumberRange.name
            })], 'success');
          })
          .catch(function (response) {
            Notification.errorResponse(response, $translate.instant('serviceSetupModal.extensionDeleteError', {
              extension: internalNumberRange.name
            }));
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
        var errors = [];
        if ($scope.firstTimeSetup) {
          var promise = ServiceSetup.createSite($scope.site)
            .then(function () {
              $scope.firstTimeSetup = false;
            }).catch(function (response) {
              errors.push(Notification.processErrorResponse(response, 'serviceSetupModal.siteError'));
            });
          deferreds.push(promise);
        }

        if (angular.isArray($scope.internalNumberRanges)) {
          angular.forEach($scope.internalNumberRanges, function (internalNumberRange) {
            var promise = ServiceSetup.createInternalNumberRange(internalNumberRange)
              .catch(function (response) {
                var error = Notification.processErrorResponse(response, 'serviceSetupModal.extensionAddError', {
                  extension: this.name
                });
                errors.push(error);
              }.bind(internalNumberRange));
            deferreds.push(promise);
          });
        }
        return $q.all(deferreds).then(function () {
          if (errors.length > 0) {
            Notification.notify(errors, 'error');
            return $q.reject('Site/extension create failed.');
          } else {
            Notification.notify([$translate.instant('serviceSetupModal.saveSuccess')], 'success');
          }
        });
      }
    };

    HttpUtils.setTrackingID().then(function () {
      getTimezones();
      setSteeringDigit();
      listInternalExtentionRanges();
    });
  }
})();
