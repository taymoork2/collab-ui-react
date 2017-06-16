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
    this.uuid = '';
  }

  CeInfoResource.prototype.setId = function (id) {
    this.id = id;
  };

  CeInfoResource.prototype.getId = function () {
    return this.id;
  };

  CeInfoResource.prototype.setUUID = function (uuid) {
    this.uuid = uuid;
  };

  CeInfoResource.prototype.getUUID = function () {
    return this.uuid;
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

  CeInfo.prototype.getSchedule = function () {
    return this.scheduleId;
  };

  CeInfo.prototype.setSchedule = function (scheduleId) {
    this.scheduleId = scheduleId;
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
  function AutoAttendantCeInfoModelService($q, AutoAttendantCeService, AACeDependenciesService, AAModelService, AANumberAssignmentService, Authinfo) {

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
      },
    };

    return service;

    /////////////////////

    function getAllCeInfos(aaModel) {
      var aaResourceRecords = aaModel.aaRecords;
      var ceInfos = [];
      var ceInfoPromises = [];
      if (_.isArray(aaResourceRecords)) {
        for (var i = 0; i < aaResourceRecords.length; i++) {
          if (!_.isUndefined(aaResourceRecords[i].assignedResources[0])) {
            ceInfoPromises.push(setupResourcesFromCmi(aaResourceRecords[i]));
          }
        }
      }
      return $q.all(ceInfoPromises).then(function () {
        if (_.isArray(aaResourceRecords)) {
          for (var i = 0; i < aaResourceRecords.length; i++) {
            ceInfos[i] = getCeInfo(aaResourceRecords[i]);
          }
        }
        aaModel.ceInfos = ceInfos;
      });
    }

    function findUUIDFromCmiUsingNumber(fromCMI, resource) {
      var cmiNumber = _.find(fromCMI, function (thisCMI) {
        return (_.trimStart(thisCMI.number, '+') === _.trimStart(resource.number, '+'));
      });

      if (cmiNumber) {
        resource.uuid = cmiNumber.uuid;
      }
    }

    function setupResourcesFromCmi(resources) {
      var deferred = $q.defer();
      var cmiNumber;
      var uuid = extractUUID(resources.callExperienceURL);
      AANumberAssignmentService.getAANumberAssignments(Authinfo.getOrgId(), uuid).then(function (fromCMI) {

        if (fromCMI && fromCMI.length !== 0) {
          _.forEach(resources.assignedResources, function (resource) {
            if (resource.uuid) {
              cmiNumber = _.find(fromCMI, { 'uuid': resource.uuid });
              if (cmiNumber) {
                resource.number = (cmiNumber.number);
              } else {
                findUUIDFromCmiUsingNumber(fromCMI, resource);
              }
            } else {
              findUUIDFromCmiUsingNumber(fromCMI, resource);
            }
          });
        }
        deferred.resolve();
      }, function (response) {
        deferred.reject(response);
      });
      return deferred.promise;
    }

// New get method for Huron Features Page
    function getCeInfosList() {
      var aaModel = {};
      aaModel.ceInfos = [];

      return AutoAttendantCeService.listCes().then(function (aaRecords) {
        if (_.isArray(aaRecords)) {
          aaModel.aaRecords = aaRecords;
          return getAllCeInfos(aaModel).then(function () {
            return AACeDependenciesService.readCeDependencies().then(function (depends) {
              aaModel.dependsIds = depends.dependencies;
              return aaModel;
            }, function (response) {
              aaModel.dependsIds = {};
              if (response.status === 404) {
              // there are no CEs or no dependencies between CEs; this is OK
                return aaModel;
              }
              return $q.reject(response);
            });
          });
        }
        return aaModel; // should not happen but avoids undefined errors if it happens
      }, function (response) {
        // init the model and move the chain the forward
        aaModel = AAModelService.newAAModel();
        aaModel.ceInfos = [];
        aaModel.dependsIds = {};
        if (response.status === 404) {
        // there are no CEs; this is OK
          return aaModel;
        }
        return $q.reject(response);
      }).finally(function () {
        // always set the aaModel for UI access, even if empty
        AAModelService.setAAModel(aaModel);
      });
    }

    /*
     * getCeInfo can read information from aaResourceRecord or aaRecord.
     */
    function getCeInfo(aaResourceRecord) {
      var ceInfo = new CeInfo();
      if (!_.isUndefined(aaResourceRecord.callExperienceName)) {
        ceInfo.setName(aaResourceRecord.callExperienceName);
      }
      if (!_.isUndefined(aaResourceRecord.callExperienceURL)) {
        ceInfo.setCeUrl(aaResourceRecord.callExperienceURL);
      }
      if (_.isArray(aaResourceRecord.assignedResources)) {
        for (var j = 0; j < aaResourceRecord.assignedResources.length; j++) {
          var iResource = aaResourceRecord.assignedResources[j];
          var resource = new CeInfoResource();
          resource.setTrigger(iResource.trigger);
          resource.setId(iResource.id);
          resource.setType(iResource.type);
          resource.setUUID(iResource.uuid);
          if (!_.isUndefined(iResource.number)) {
            resource.setNumber(iResource.number);
          }
          ceInfo.addResource(resource);
        }
      }
      if (!_.isUndefined(aaResourceRecord.scheduleId)) {
        ceInfo.setSchedule(aaResourceRecord.scheduleId);
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
        resource.uuid = ceInfoResources[i].getUUID();
        resources.push(resource);
      }
      aaRecord.assignedResources = resources;
      aaRecord.callExperienceName = ceInfo.getName();
      aaRecord.scheduleId = ceInfo.getSchedule();
    }

    function deleteCeInfo(aaResourceRecords, ceInfo) {
      var i;
      if (_.isArray(aaResourceRecords)) {
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

  }
})();
