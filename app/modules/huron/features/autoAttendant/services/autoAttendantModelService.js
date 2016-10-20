(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAModelService', AAModelService);

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
  function AARecord() {
    this.callExperienceName = "";
    this.assignedResources = [];
    this.actionSets = [{
      "name": "regularOpenActions",
      "actions": []
    }];
    this.scheduleEventTypeMap = {};
  }

  function AARecordWithEmptyActionSets() {
    this.callExperienceName = "";
    this.assignedResources = [];
    this.actionSets = [];
    this.scheduleEventTypeMap = {};
  }

  function AAModel() {
    this.aaRecord = new AARecord();
    this.aaRecords = [];
    this.scheduleEventTypeMap = {};
  }

  function AAModelService() {

    var aaModel = {};

    var service = {
      getAAModel: getAAModel,
      setAAModel: setAAModel,

      newAAModel: function () {
        return new AAModel();
      },

      newAARecord: function () {
        return new AARecord();
      },

      getNewAARecord: function () {
        return new AARecordWithEmptyActionSets();
      }
    };

    return service;

    /////////////////////

    function getAAModel() {
      return aaModel;
    }

    function setAAModel(aaMdl) {
      aaModel = aaMdl;
    }

  }
})();
