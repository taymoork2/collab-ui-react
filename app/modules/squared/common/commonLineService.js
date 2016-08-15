(function () {
  'use strict';
  angular
    .module('Squared')
    .service('CommonLineService', CommonLineService);

  /* @ngInject */
  function CommonLineService(TelephonyInfoService, Notification, $translate) {
    var entitylist = [];
    var internalNumberPool = [];
    var externalNumberPool = [];
    var telephonyInfo = {};
    var PATTERN_LIMIT = 50;
    var nameTemplate;

    var service = {
      loadPrimarySiteInfo: loadPrimarySiteInfo,
      getTelephonyInfo: getTelephonyInfo,
      loadInternalNumberPool: loadInternalNumberPool,
      loadExternalNumberPool: loadExternalNumberPool,
      returnInternalNumberlist: returnInternalNumberlist,
      checkDnOverlapsSteeringDigit: checkDnOverlapsSteeringDigit,
      assignDNForUserList: assignDNForUserList,
      assignMapUserList: assignMapUserList,
      getInternalNumberlist: getInternalNumberlist,
      getEntitylist: getEntitylist,
      setEntitylist: setEntitylist,
      getInternalNumberPool: getInternalNumberPool,
      getExternalNumberPool: getExternalNumberPool,
      getNameTemplate: getNameTemplate,
      mapDidToDn: mapDidToDn,
      isDnNotAvailable: isDnNotAvailable

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
      var steeringDigit = telephonyInfo.steeringDigit;
      return _.startsWith(_.get(entity, 'assignedDn.pattern'), steeringDigit);
    }

    function getEntitylist() {
      return entitylist;
    }

    function setEntitylist() {
      entitylist = _.cloneDeep(entitylist);
    }

    function getInternalNumberlist(pattern) {
      if (pattern) {
        loadInternalNumberPool(pattern);
      } else {
        return internalNumberPool;
      }
    }

    function getInternalNumberPool() {
      return internalNumberPool;
    }

    function getExternalNumberPool() {
      return externalNumberPool;
    }

    function loadInternalNumberPool(pattern) {
      return TelephonyInfoService.loadInternalNumberPool(pattern, PATTERN_LIMIT).then(function (internalPool) {
        internalNumberPool = internalPool;
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
          pattern: $translate.instant('directoryNumberPanel.none')
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
      nameTemplate = '<div class="ui-grid-cell-contents"><span class="name-display-style">{{row.entity.name}}</span>' +
        '<span class="email-display-style">{{row.entity.address}}</span></div>';
      return nameTemplate;
    }

    function returnInternalNumberlist(pattern) {
      if (pattern) {
        loadInternalNumberPool(pattern);
      } else {
        return internalNumberPool;
      }
    }

  }
})();
