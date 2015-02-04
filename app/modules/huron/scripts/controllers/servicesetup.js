'use strict';

angular.module('Huron')
  .controller('serviceSetupCtrl', ['$scope', '$q', 'Log', 'ServiceSetup',
    function ($scope, $q, Log, ServiceSetup) {

      var DEFAULT_TZ = 'America/Los_Angeles';
      var DEFAULT_SD = '9';
      var DEFAULT_MOH = 'ciscoDefault';
      var DEFAULT_EXTENTION_LENGTH = '5';
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
        timeZone: DEFAULT_TZ,
        steeringDigit: null,
        siteIndex: '000001'
      };
      $scope.globalMOH = DEFAULT_MOH;
      $scope.maxExtLength = DEFAULT_EXTENTION_LENGTH;
      $scope.internalNumberRanges = [];
      $scope.firstTimeSetup = true;

      var setSteeringDigit = function () {
        // sets firstTimeSetup to false if a site exists
        ServiceSetup.listSites().then(function () {
          if (ServiceSetup.sites.length !== 0) {
            $scope.site.steeringDigit = ServiceSetup.sites[0].steeringDigit;
            $scope.firstTimeSetup = false;
          } else {
            $scope.site.steeringDigit = DEFAULT_SD;
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

          if ($scope.internalNumberRanges.length == 0) {
            // Add a default internalNumberRange
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
              if ($scope.internalNumberRanges.length == 0) {
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

      $scope.initNext = function () {
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
      };

      setSteeringDigit();
      listInternalExtentionRanges();
    }
  ]);
