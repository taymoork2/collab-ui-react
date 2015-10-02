'use strict';

describe('Filter: aaResourceFilter', function () {

  var filterPreferred;
  var filterMore;
  var filterAll;

  var cesWithNumbers = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumbers.json');
  var ceInfosWithNumbers = [];

  var AutoAttendantCeInfoModelService;
  var successSpy;
  var failureSpy;

  function ce2CeInfo(rawCeInfo) {
    var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
    for (var j = 0; j < rawCeInfo.assignedResources.length; j++) {
      var _resource = AutoAttendantCeInfoModelService.newResource();
      _resource.setId(rawCeInfo.assignedResources[j].id);
      _resource.setTrigger(rawCeInfo.assignedResources[j].trigger);
      _resource.setType(rawCeInfo.assignedResources[j].type);
      if (angular.isDefined(rawCeInfo.assignedResources[j].number)) {
        _resource.setNumber(rawCeInfo.assignedResources[j].number);
      }
      _ceInfo.addResource(_resource);
    }
    _ceInfo.setName(rawCeInfo.callExperienceName);
    _ceInfo.setCeUrl(rawCeInfo.callExperienceURL);
    return _ceInfo;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (preferredAAResourceFilter, moreAAResourcesFilter, allAAResourcesFilter, _AutoAttendantCeInfoModelService_) {
    filterPreferred = preferredAAResourceFilter;
    filterMore = moreAAResourcesFilter;
    filterAll = allAAResourcesFilter;

    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
  }));

  beforeEach(function () {
    var ceInfos = [];
    for (var i = 0; i < cesWithNumbers.length; i++) {
      var _ceInfo = ce2CeInfo(cesWithNumbers[i]);
      ceInfos[i] = _ceInfo;
    }
    ceInfosWithNumbers = ceInfos;
  });

  it('should do something here', function () {

  });

});
