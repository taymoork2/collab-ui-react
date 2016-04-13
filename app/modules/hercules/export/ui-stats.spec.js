'use strict';

describe('Service: UiStats', function () {
  beforeEach(module('Hercules'));

  var UiStats;
  var stats;

  beforeEach(inject(function (_UiStats_, _$httpBackend_) {
    UiStats = _UiStats_;
    var serviceInfo = {
      activated: '3',
      error: '0',
      notActivated: '2'
    };
    stats = UiStats.insertServiceInfo(serviceInfo);
  }));

  describe('stats updating', function () {

    it('stats according servieInfo', function () {
      expect(stats).toEqual([{
        "stateType": "activated",
        "text": "activated",
        "count": '3',
        "selected": false,
        "unselectable": false,
        "progress": 0
      }, {
        "stateType": "error",
        "text": "errors",
        "count": '0',
        "selected": true,
        "unselectable": true,
        "progress": 0
      }, {
        "stateType": "notActivated",
        "text": "pending activation",
        "count": '2',
        "selected": true,
        "unselectable": false,
        "progress": 0
      }]);

    });

    xit('selecting elements', function () {
      expect(UiStats.isSelected("activated")).toBe(false);
      expect(UiStats.isSelected("error")).toBe(false);
      expect(UiStats.isSelected("notActivated")).toBe(false);

      expect(UiStats.noneSelected()).toEqual(true);

      stats[0].selected = true; // ui checkbox checked, activated is the first in array

      expect(UiStats.isSelected("activated")).toBe(true);
      expect(UiStats.isSelected("error")).toBe(false);
      expect(UiStats.isSelected("notActivated")).toBe(false);

      expect(UiStats.noneSelected()).toEqual(false);

    });

  });

});
