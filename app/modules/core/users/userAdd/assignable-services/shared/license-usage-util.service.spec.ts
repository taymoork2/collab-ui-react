import moduleName from './index';

describe('LicenseUsageUtilService:', () => {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      'Config',
      'LicenseUsageUtilService',
    );
  });

  beforeEach(function () {
    this.fixtures = {};
    this.fixtures.simpleFakeLicenses = [{
      foo: 1,
      bar: 1,
    }, {
      bar: 2,
    }, {
      foo: 1,
      baz: 3,
    }];
    this.fixtures.fakeLicensesWithBasicMeeting = [{
      offerName: 'foo',
    }, {
      offerName: 'CF',
    }, {
      offerName: 'bar',
    }];
  });

  describe('filterLicenses(): ', () => {
    it('should use "_.filter()" using options specified by its first arg, to filter on its second arg', function () {
      let result = this.LicenseUsageUtilService.filterLicenses({ bar: 2 }, this.fixtures.simpleFakeLicenses);
      expect(result).toEqual([{ bar: 2 }]);

      result = this.LicenseUsageUtilService.filterLicenses({ foo: 1 }, this.fixtures.simpleFakeLicenses);
      expect(result).toEqual([{
        foo: 1,
        bar: 1,
      }, {
        foo: 1,
        baz: 3,
      }]);
    });
  });

  describe('findLicense(): ', () => {
    it('should use "_.find()" using options specified by its first arg, to search on its second arg', function () {
      let result = this.LicenseUsageUtilService.findLicense({ bar: 2 }, this.fixtures.simpleFakeLicenses);
      expect(result).toEqual({ bar: 2 });

      result = this.LicenseUsageUtilService.findLicense({ foo: 1, baz: 3 }, this.fixtures.simpleFakeLicenses);
      expect(result).toEqual({
        foo: 1,
        baz: 3,
      });
    });
  });

  describe('hasLicensesWith(): ', () => {
    it('should use "_.some()" using options specified by its first arg, to search on its second arg', function () {
      let result = this.LicenseUsageUtilService.hasLicensesWith({ bar: 1 }, this.fixtures.simpleFakeLicenses);
      expect(result).toBe(true);

      result = this.LicenseUsageUtilService.hasLicensesWith({ bar: 2 }, this.fixtures.simpleFakeLicenses);
      expect(result).toBe(true);

      result = this.LicenseUsageUtilService.hasLicensesWith({ bar: 3 }, this.fixtures.simpleFakeLicenses);
      expect(result).toBe(false);
    });
  });

  describe('getMessageLicenses(): ', () => {
    it('should filter licenses with "offerName" any of ["MS", "MSGR"]', function () {
      const fakeLicenses = [{ offerName: 'foo' }];
      let result = this.LicenseUsageUtilService.getMessageLicenses(fakeLicenses);
      expect(result.length).toBe(0);

      fakeLicenses.push({ offerName: 'MS' });
      result = this.LicenseUsageUtilService.getMessageLicenses(fakeLicenses);
      expect(result.length).toBe(1);

      fakeLicenses.push({ offerName: 'MSGR' });
      result = this.LicenseUsageUtilService.getMessageLicenses(fakeLicenses);
      expect(result.length).toBe(2);
    });
  });

  describe('getCallLicenses(): ', () => {
    it('should filter licenses with "offerName" of "CO"', function () {
      const fakeLicenses = [{ offerName: 'foo' }];
      let result = this.LicenseUsageUtilService.getCallLicenses(fakeLicenses);
      expect(result.length).toBe(0);

      fakeLicenses.push({ offerName: 'CO' });
      result = this.LicenseUsageUtilService.getCallLicenses(fakeLicenses);
      expect(result.length).toBe(1);
    });
  });

  describe('getCareLicenses(): ', () => {
    it('should filter licenses with "offerName" any of ["CDC", "CVC"]', function () {
      const fakeLicenses = [{ offerName: 'foo' }];
      let result = this.LicenseUsageUtilService.getCareLicenses(fakeLicenses);
      expect(result.length).toBe(0);

      fakeLicenses.push({ offerName: 'CDC' });
      result = this.LicenseUsageUtilService.getCareLicenses(fakeLicenses);
      expect(result.length).toBe(1);

      fakeLicenses.push({ offerName: 'CVC' });
      result = this.LicenseUsageUtilService.getCareLicenses(fakeLicenses);
      expect(result.length).toBe(2);
    });
  });

  describe('getBasicMeetingLicenses(): ', () => {
    it('should filter licenses with "offerName" of "CF"', function () {
      const result = this.LicenseUsageUtilService.getBasicMeetingLicenses(this.fixtures.fakeLicensesWithBasicMeeting);
      expect(result.length).toBe(1);
      expect(_.get(result, '[0].offerName')).toBe('CF');
    });
  });

  describe('getAdvancedMeetingLicenses(): ', () => {
    it('should filter licenses with "offerName" any of ["CMR", "EC", "EE", "MC", "TC"]', function () {
      const fakeLicenses = [{ offerName: 'foo' }];
      let result = this.LicenseUsageUtilService.getAdvancedMeetingLicenses(fakeLicenses);
      expect(result.length).toBe(0);

      fakeLicenses.push({ offerName: 'CMR' });
      result = this.LicenseUsageUtilService.getAdvancedMeetingLicenses(fakeLicenses);
      expect(result.length).toBe(1);

      fakeLicenses.push({ offerName: 'EC' });
      result = this.LicenseUsageUtilService.getAdvancedMeetingLicenses(fakeLicenses);
      expect(result.length).toBe(2);

      fakeLicenses.push({ offerName: 'EE' });
      result = this.LicenseUsageUtilService.getAdvancedMeetingLicenses(fakeLicenses);
      expect(result.length).toBe(3);

      fakeLicenses.push({ offerName: 'MC' });
      result = this.LicenseUsageUtilService.getAdvancedMeetingLicenses(fakeLicenses);
      expect(result.length).toBe(4);

      fakeLicenses.push({ offerName: 'TC' });
      result = this.LicenseUsageUtilService.getAdvancedMeetingLicenses(fakeLicenses);
      expect(result.length).toBe(5);

      // remember that 'CF' isn't an advanced meeting
      fakeLicenses.push({ offerName: 'CF' });
      result = this.LicenseUsageUtilService.getAdvancedMeetingLicenses(fakeLicenses);
      expect(result.length).toBe(5);
    });
  });

  describe('getAdvancedMeetingSiteUrls(): ', () => {
    it('should return a sorted unique list of only "siteUrl"s found in advanced licenses', function () {
      // start with a non-advanced meeting
      const fakeLicenses = [{ offerName: 'foo', siteUrl: 'fake-site-url-0' }];
      let result = this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(fakeLicenses);
      expect(result).toEqual([]);

      fakeLicenses.push({ offerName: 'CMR', siteUrl: 'fake-site-url-1' });
      result = this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(fakeLicenses);
      expect(result).toEqual(['fake-site-url-1']);

      fakeLicenses.push({ offerName: 'EC', siteUrl: 'fake-site-url-2'  });
      result = this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(fakeLicenses);
      expect(result).toEqual(['fake-site-url-1', 'fake-site-url-2']);

      fakeLicenses.push({ offerName: 'EE', siteUrl: 'fake-site-url-3'  });
      result = this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(fakeLicenses);
      expect(result).toEqual(['fake-site-url-1', 'fake-site-url-2', 'fake-site-url-3']);

      fakeLicenses.push({ offerName: 'MC', siteUrl: 'fake-site-url-2'  });
      result = this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(fakeLicenses);
      expect(result).toEqual(['fake-site-url-1', 'fake-site-url-2', 'fake-site-url-3']);

      fakeLicenses.push({ offerName: 'TC', siteUrl: 'fake-site-url-1'  });
      result = this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(fakeLicenses);
      expect(result).toEqual(['fake-site-url-1', 'fake-site-url-2', 'fake-site-url-3']);
    });
  });

  describe('getTotalLicenseUsage(): ', () => {
    it('should return sum total of the "usage" property for all licenses with matching "offerName" property', function () {
      const fakeLicenses = [{ offerName: 'foo', usage: 0 }];
      let result = this.LicenseUsageUtilService.getTotalLicenseUsage('foo', fakeLicenses);
      expect(result).toBe(0);

      fakeLicenses.push({ offerName: 'foo', usage: 3 });
      result = this.LicenseUsageUtilService.getTotalLicenseUsage('foo', fakeLicenses);
      expect(result).toBe(3);

      result = this.LicenseUsageUtilService.getTotalLicenseUsage('bar', fakeLicenses);
      expect(result).toBe(0);

      fakeLicenses.push({ offerName: 'bar', usage: 2 });
      result = this.LicenseUsageUtilService.getTotalLicenseUsage('bar', fakeLicenses);
      expect(result).toBe(2);
    });
  });

  describe('getTotalLicenseVolume(): ', () => {
    it('should return sum total of the "volume" property for all licenses with matching "offerName" property', function () {
      const fakeLicenses = [{ offerName: 'foo', volume: 0 }];
      let result = this.LicenseUsageUtilService.getTotalLicenseVolume('foo', fakeLicenses);
      expect(result).toBe(0);

      fakeLicenses.push({ offerName: 'foo', volume: 3 });
      result = this.LicenseUsageUtilService.getTotalLicenseVolume('foo', fakeLicenses);
      expect(result).toBe(3);

      result = this.LicenseUsageUtilService.getTotalLicenseVolume('bar', fakeLicenses);
      expect(result).toBe(0);

      fakeLicenses.push({ offerName: 'bar', volume: 2 });
      result = this.LicenseUsageUtilService.getTotalLicenseVolume('bar', fakeLicenses);
      expect(result).toBe(2);
    });
  });

  describe('isSharedMeetingsLicense(): ', () => {
    it('should return true if "licenseModel" property is "cloud shared meeting", false otherwise', function () {
      const cloudSharedMeeting = this.Config.licenseModel.cloudSharedMeeting;
      expect(this.LicenseUsageUtilService.isSharedMeetingsLicense({ licenseModel: 'foo' })).toBe(false);
      expect(this.LicenseUsageUtilService.isSharedMeetingsLicense({ licenseModel: cloudSharedMeeting })).toBe(true);
    });
  });
});
