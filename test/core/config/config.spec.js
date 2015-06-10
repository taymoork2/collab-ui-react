'use strict';

describe('App Configuration', function () {
  var Config;

  beforeEach(module('Core'));

  beforeEach(inject(function (_Config_) {
    Config = _Config_;
  }));

  it('should exist', function () {
    expect(Config).toBeDefined();
  });

  it('should have tabs', function () {
    expect(Config.tabs).toBeDefined();
  });

  it('should have roleStates', function () {
    expect(Config.roleStates).toBeDefined();
  });

  it('should not have development states assigned to Full_Admin role', function () {
    function getDevelopmentStates() {
      var devStates = [];
      for (var i = 0; i < Config.tabs.length; i++) {
        var tab = Config.tabs[i];
        if (tab && tab.tab === 'developmentTab') {
          var subPages = tab.subPages;
          for (var j = 0; j < subPages.length; j++) {
            var devTab = subPages[j];
            if (devTab && devTab.state) {
              devStates.push(devTab.state);
            }
          }
        }
      }
      return devStates;
    }
    var adminStates = Config.roleStates.Full_Admin || [];
    var developmentStates = getDevelopmentStates();
    for (var i = 0; i < adminStates.length; i++) {
      expect(developmentStates).not.toContain(adminStates[i]);
    }
  });

  describe('service states', function () {

    it('squared-fusion-mgmt should contain fusion states', function () {
      expect(Config.serviceStates['squared-fusion-mgmt'][0]).toBe('fusion');
      expect(Config.serviceStates['squared-fusion-mgmt'][1]).toBe('cluster-details');
      expect(Config.serviceStates['squared-fusion-mgmt'][2]).toBe('mediafusionconnector');
    });

    it('squared-fusion-uc should contain devices state', function () {
      expect(Config.serviceStates['squared-fusion-uc'][0]).toBe('devices');
    });

  });

});
