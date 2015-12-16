(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AutoAttendantCeInfoModelService', AutoAttendantCeInfoModelService);

  //
  // Data model derived from the AA Json data
  //
  // AAModel
  //     aaRecord
  //         callExperienceName
  //         assignedResources[]
  //         actionSets[]
  //
  //     aaResourceRecord
  //         callExperienceName
  //         assignedResources[]
  //         callExperienceURL
  //

  //
  // UI model:
  //
  // Customer
  //     CeInfo[]
  //         CeInfo
  //             name
  //             Resources[]
  //                 Resource
  //                     id: uuid
  //                     trigger: 'inComing', 'outGoing'
  //                     type: 'directoryNumber'
  //                     number: 'E164'
  //
  function CeInfoResource() {
    this.id = '';
    this.trigger = '';
    this.type = '';
    this.number = '';
  }

  CeInfoResource.prototype.setId = function (id) {
    this.id = id;
  };

  CeInfoResource.prototype.getId = function () {
    return this.id;
  };

  CeInfoResource.prototype.setTrigger = function (trigger) {
    this.trigger = trigger;
  };

  CeInfoResource.prototype.getTrigger = function () {
    return this.trigger;
  };

  CeInfoResource.prototype.setType = function (type) {
    this.type = type;
  };

  CeInfoResource.prototype.getType = function () {
    return this.type;
  };

  CeInfoResource.prototype.setNumber = function (number) {
    this.number = number;
  };

  CeInfoResource.prototype.getNumber = function () {
    return this.number;
  };

  function CeInfo() {
    this.name = '';
    this.resources = [];
    this.ceUrl = '';
  }

  CeInfo.prototype.getName = function () {
    return this.name;
  };

  CeInfo.prototype.setName = function (name) {
    this.name = name;
  };

  CeInfo.prototype.addResource = function (resource) {
    this.resources[this.resources.length] = resource;
  };

  CeInfo.prototype.getResources = function () {
    return this.resources;
  };

  CeInfo.prototype.setCeUrl = function (url) {
    this.ceUrl = url;
  };

  CeInfo.prototype.getCeUrl = function () {
    return this.ceUrl;
  };

  /* @ngInject */
  function AutoAttendantCeInfoModelService($q, AutoAttendantCeService, AACeDependenciesService) {

    var service = {
      getAllCeInfos: getAllCeInfos,
      getCeInfosList: getCeInfosList,
      getCeInfo: getCeInfo,
      setCeInfo: setCeInfo,
      deleteCeInfo: deleteCeInfo,
      extractUUID: extractUUID,

      newCeInfo: function () {
        return new CeInfo();
      },

      newResource: function () {
        return new CeInfoResource();
      }
    };

    return service;

    /////////////////////

    function getAllCeInfos(aaResourceRecords) {
      var ceInfos = [];
      if (angular.isArray(aaResourceRecords)) {
        for (var i = 0; i < aaResourceRecords.length; i++) {
          ceInfos[i] = getCeInfo(aaResourceRecords[i]);
        }
      }
      return ceInfos;
    }

    // New get method for Huron Features Page
    function getCeInfosList() {
      var aaModel = {};
      var promises = [];

      var listPromise = AutoAttendantCeService.listCes().then(function (aaRecords) {
        if (angular.isArray(aaRecords)) {
          aaModel.aaRecords = aaRecords;
          _.forEach(aaModel.aaRecords, function (aaRecord) {
            _.forEach(aaRecord.assignedResources, function (assignedResource) {
              setDirectoryNumber(assignedResource);
            });
          });
          aaModel.ceInfos = getAllCeInfos(aaModel.aaRecords);
        }
      }).catch(function (response) {
        aaModel = {};
        return $q.reject(response);
      });
      promises.push(listPromise);

      var dependsPromise = AACeDependenciesService.readCeDependencies().then(function (depends) {
        aaModel.dependsIds = depends.dependencies;
      }).catch(function (response) {
        aaModel = {};
        return $q.reject(response);
      });
      promises.push(dependsPromise);

      return $q.all(promises).then(function () {
        return aaModel;
      }).catch(function (response) {
        aaModel = {};
        return $q.reject(response);
      });

    }

    /*
     * getCeInfo can read information from aaResourceRecord or aaRecord.
     */
    function getCeInfo(aaResourceRecord) {
      var ceInfo = new CeInfo();
      if (angular.isDefined(aaResourceRecord.callExperienceName)) {
        ceInfo.setName(aaResourceRecord.callExperienceName);
      }
      if (angular.isDefined(aaResourceRecord.callExperienceURL)) {
        ceInfo.setCeUrl(aaResourceRecord.callExperienceURL);
      }
      if (angular.isArray(aaResourceRecord.assignedResources)) {
        for (var j = 0; j < aaResourceRecord.assignedResources.length; j++) {
          var iResource = aaResourceRecord.assignedResources[j];
          var resource = new CeInfoResource();
          resource.setTrigger(iResource.trigger);
          resource.setId(iResource.id);
          resource.setType(iResource.type);
          if (angular.isDefined(iResource.number)) {
            resource.setNumber(iResource.number);
          }
          ceInfo.addResource(resource);
        }
      }
      return ceInfo;
    }

    function setCeInfo(aaRecord, ceInfo) {
      var resources = [];
      var ceInfoResources = ceInfo.getResources();
      for (var i = 0; i < ceInfoResources.length; i++) {
        var resource = {};
        resource.trigger = ceInfoResources[i].getTrigger();
        resource.type = ceInfoResources[i].getType();
        resource.id = ceInfoResources[i].getId();
        resource.number = ceInfoResources[i].getNumber();
        resources.push(resource);
      }
      aaRecord.assignedResources = resources;
      aaRecord.callExperienceName = ceInfo.getName();
    }

    function deleteCeInfo(aaResourceRecords, ceInfo) {
      var i;
      if (angular.isArray(aaResourceRecords)) {
        for (i = 0; i < aaResourceRecords.length; i++) {
          if (aaResourceRecords[i].callExperienceName === ceInfo.getName()) {
            aaResourceRecords.splice(i, 1);
            break;
          }
        }
      }
    }

    function extractUUID(ceURL) {
      var uuidPos = ceURL.lastIndexOf("/");
      if (uuidPos === -1) {
        return '';
      }
      return ceURL.substr(uuidPos + 1);
    }

    ////////////

    function setDirectoryNumber(resource) {
      resource.number = resource.id;
      /* workaround for Tropo-AA integraiton
      return DirectoryNumberService.get({
        customerId: Authinfo.getOrgId(),
        directoryNumberId: resource.id
      }).$promise.then(function (data) {
        resource.number = data.pattern;
      });
      */
    }

  }
})();
