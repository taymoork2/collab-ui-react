'use strict';

describe('Filter: aaResourceFilter', function () {

  var filterPreferred;
  var filterMore;
  var filterAll;

  var ceDefinitions = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumbers.json');
  var ceInfos = [];

  var AutoAttendantCeInfoModelService;

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

  function getTestCeInfo(testName) {
    for (var i = 0; i < ceInfos.length; i++) {
      var _ceInfo = ceInfos[i];
      if (testName === _ceInfo.name) {
        return _ceInfo;
      }
    }
  }

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (preferredAAResourceFilter, moreAAResourcesFilter, allAAResourcesFilter, _AutoAttendantCeInfoModelService_) {
    filterPreferred = preferredAAResourceFilter;
    filterMore = moreAAResourcesFilter;
    filterAll = allAAResourcesFilter;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
  }));

  beforeEach(function () {
    var _ceInfos = [];
    for (var i = 0; i < ceDefinitions.length; i++) {
      var _ceInfo = ce2CeInfo(ceDefinitions[i]);
      _ceInfos.push(_ceInfo);
    }
    ceInfos = _ceInfos;
  });

  it('should return empty preferred resource', function () {
    var _ceInfo0 = getTestCeInfo("Test AA0");
    expect(_ceInfo0.getName()).toBe("Test AA0");

    expect(filterPreferred(_ceInfo0)).toBe("");
  });

  it('should return one preferred resource', function () {
    var _ceInfo1 = getTestCeInfo("Test AA1"); //1111
    expect(filterPreferred(_ceInfo1)).toBe("1111");

    var _ceInfo2 = getTestCeInfo("Test AA2"); //2221
    expect(filterPreferred(_ceInfo2)).toBe("2221");

    var _ceInfo3 = getTestCeInfo("Test AA3"); //3331
    expect(filterPreferred(_ceInfo3)).toBe("3331");
  });

  it('should return empty +more resource count', function () {
    var _ceInfo0 = getTestCeInfo("Test AA0");
    expect(_ceInfo0.getName()).toBe("Test AA0");
    expect(filterMore(_ceInfo0)).toBe("");

    var _ceInfo1 = getTestCeInfo("Test AA1");
    expect(_ceInfo1.getName()).toBe("Test AA1");
    expect(filterMore(_ceInfo1)).toBe("");

  });

  it('should return correct +more resource count', function () {
    var _ceInfo2 = getTestCeInfo("Test AA2"); //+1more
    expect(filterMore(_ceInfo2)).toBeDefined();

    var _ceInfo3 = getTestCeInfo("Test AA3"); //+2more
    expect(filterMore(_ceInfo3)).toBeDefined();
  });

  it('should return empty resources', function () {
    var _ceInfo0 = getTestCeInfo("Test AA0");
    expect(_ceInfo0.getName()).toBe("Test AA0");
    expect(filterAll(_ceInfo0)).toBe("");
  });

  it('should return all resources', function () {
    var _ceInfo1 = getTestCeInfo("Test AA1"); // 1
    expect(filterAll(_ceInfo1)).not.toContain("<br>");

    var _ceInfo2 = getTestCeInfo("Test AA2"); // 2
    expect(filterAll(_ceInfo2)).toContain("<br>");

    var _ceInfo3 = getTestCeInfo("Test AA3"); // 3
    expect(filterAll(_ceInfo3)).toContain("<br>");

  });

});
