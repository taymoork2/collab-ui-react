(function () {
  'use strict';

  angular
    .module('Squared')
    .service('CommonLineService', CommonLineService);

  /* @ngInject */
  function CommonLineService(TelephonyInfoService, NumberService, FeatureToggleService, Notification, $translate) {
    var entitylist = [];
    var internalNumberPool = [];
    var externalNumberPool = [];
    var telephonyInfo = {};
    var nameTemplate;
    var order = '';

    var service = {
      loadPrimarySiteInfo: loadPrimarySiteInfo,
      getTelephonyInfo: getTelephonyInfo,
      loadInternalNumberPool: loadInternalNumberPool,
      loadLocationInternalNumberPool: loadLocationInternalNumberPool,
      loadExternalNumberPool: loadExternalNumberPool,
      returnInternalNumberList: returnInternalNumberList,
      returnExternalNumberList: returnExternalNumberList,
      checkDnOverlapsSteeringDigit: checkDnOverlapsSteeringDigit,
      assignDNForUserList: assignDNForUserList,
      assignMapUserList: assignMapUserList,
      getEntitylist: getEntitylist,
      setEntitylist: setEntitylist,
      getInternalNumberPool: getInternalNumberPool,
      getExternalNumberPool: getExternalNumberPool,
      getNameTemplate: getNameTemplate,
      mapDidToDn: mapDidToDn,
      isDnNotAvailable: isDnNotAvailable,

    };

    //checkDidDnDupes = checkDidDnDupes

    return service;
    //////////////////

    function loadPrimarySiteInfo() {
      return TelephonyInfoService.getPrimarySiteInfo().then(function (info) {
        telephonyInfo = info;
      }).catch(function (response) {
        Notification.errorResponse(response, 'directoryNumberPanel.siteError');
      });
    }

    function getTelephonyInfo() {
      return telephonyInfo;
    }

    // Check to see if the currently selected directory number's first digit is
    // the same as the company steering digit.
    function checkDnOverlapsSteeringDigit(entity) {
      return _.startsWith(_.get(entity, 'assignedDn.pattern'), _.get(telephonyInfo, 'steeringDigit'));
    }

    function getEntitylist() {
      return entitylist;
    }

    function setEntitylist() {
      entitylist = _.cloneDeep(entitylist);
    }

    function getInternalNumberPool() {
      return internalNumberPool;
    }

    function getExternalNumberPool() {
      return externalNumberPool;
    }

    function loadInternalNumberPool(pattern) {
      return NumberService.getNumberList(pattern, 'internal', false, null, null, null, null)
        .then(function (internalPool) {
          internalNumberPool = internalPool;
        }).catch(function (response) {
          internalNumberPool = [];
          Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
        });
    }

    function loadLocationInternalNumberPool(pattern, locationId) {
      order = 'SITETOSITE-ASC';
      return NumberService.getNumberList(pattern, 'internal', false, order, null, null, locationId)
        .then(function (internalPool) {
          internalNumberPool = internalPool;
          return _.cloneDeep(internalNumberPool);
        }).catch(function (response) {
          internalNumberPool = [];
          Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
        });
    }

    function loadExternalNumberPool(pattern) {
      return TelephonyInfoService.loadExternalNumberPool(pattern).then(function (externalPool) {
        externalNumberPool = externalPool;
      }).catch(function (response) {
        externalNumberPool = [{
          uuid: 'none',
          pattern: $translate.instant('directoryNumberPanel.none'),
        }];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
    }

    function assignDNForUserList(entitylist) {
      _.forEach(entitylist, function (entity, index) {
        entity.assignedDn = internalNumberPool[index];
      });

      // don't select any DID on loading the page
      _.forEach(entitylist, function (entity) {
        entity.externalNumber = externalNumberPool[0];
        entity.didDnMapMsg = undefined;
      });
      return entitylist;
    }

    function mapDidToDn(entitylist) {
      var count = entitylist.length;
      return TelephonyInfoService.loadExtPoolWithMapping(count);
    }

    function assignMapUserList(count, externalNumberMappings, entitylist) {
      for (var i = 0; i < entitylist.length; i++) {
        if (i <= externalNumberMappings.length - 1) {
          if (externalNumberMappings[i].directoryNumber !== null) {
            entitylist[i].externalNumber = externalNumberMappings[i];
            entitylist[i].assignedDn = externalNumberMappings[i].directoryNumber;
          } else {
            entitylist[i].externalNumber = externalNumberMappings[i];
            entitylist[i].didDnMapMsg = 'usersPage.noExtMappingAvail';
          }
        } else {
          entitylist[i].externalNumber = externalNumberPool[0];
          entitylist[i].didDnMapMsg = 'usersPage.noExternalNumberAvail';
        }
      }
    }

    function isDnNotAvailable(entitylist) {
      for (var i = 0; i < entitylist.length; i++) {
        if (entitylist[i].assignedDn === undefined) {
          return true;
        }
      }
      return false;
    }

    function getNameTemplate() {
      nameTemplate = '<div class="ui-grid-cell-contents" ng-click=""><span class="name-display-style">{{row.entity.name}}</span>' +
        '<span class="email-display-style">{{row.entity.address}}</span></div>';
      return nameTemplate;
    }

    function returnInternalNumberList(pattern, locationId) {
      return FeatureToggleService.supports(FeatureToggleService.features.hI1484)
        .then(function (supported) {
          if (supported) {
            loadLocationInternalNumberPool(pattern, locationId);
          } else {
            loadInternalNumberPool(pattern);
          }
        });
    }

    function returnExternalNumberList(pattern) {
      if (pattern) {
        loadExternalNumberPool(pattern);
      } else {
        return externalNumberPool;
      }
    }
  }
})();
