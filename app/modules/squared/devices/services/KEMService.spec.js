'use strict';

describe('KemService', function () {
  beforeEach(angular.mock.module('Squared'));

  var KemService;

  beforeEach(inject(function (_KemService_) {
    KemService = _KemService_;
  }));

  describe('getOptionList', function () {

    it('Nothing should return 0 option', function () {
      var actual = KemService.getOptionList();
      var expected = [{
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      }];
      expect(actual).toEqual(expected);
    });

    it('Unknown model should return 0 option', function () {
      var actual = KemService.getOptionList('Ccc');
      var expected = [{
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      }];
      expect(actual).toEqual(expected);
    });

    it('Cisco 8865 should return 0-3 options', function () {
      var actual = KemService.getOptionList('Cisco 8865');
      var expected = [{
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      }, {
        label: 'deviceOverviewPage.kemOptions.one',
        value: 1
      }, {
        label: 'deviceOverviewPage.kemOptions.two',
        value: 2
      }, {
        label: 'deviceOverviewPage.kemOptions.three',
        value: 3
      }];
      expect(actual).toEqual(expected);
    });

    it('Cisco 8851 should return 0-2 option', function () {
      var actual = KemService.getOptionList('Cisco 8851');
      var expected = [{
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      }, {
        label: 'deviceOverviewPage.kemOptions.one',
        value: 1
      }, {
        label: 'deviceOverviewPage.kemOptions.two',
        value: 2
      }];
      expect(actual).toEqual(expected);
    });

    it('Cisco 8831 should return 0 option', function () {
      var actual = KemService.getOptionList('Cisco 8831');
      var expected = [{
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      }];
      expect(actual).toEqual(expected);
    });
  });

  describe('getKemOption', function () {

    it('Nothing should return 0 option', function () {
      var actual = KemService.getKemOption();
      var expected = {
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      };
      expect(actual).toEqual(expected);
    });

    it('-1 should return 0 option', function () {
      var actual = KemService.getKemOption(-1);
      var expected = {
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      };
      expect(actual).toEqual(expected);
    });

    it('4 should return 0 option', function () {
      var actual = KemService.getKemOption(4);
      var expected = {
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      };
      expect(actual).toEqual(expected);
    });

    it('2 should return 2 option', function () {
      var actual = KemService.getKemOption(2);
      var expected = {
        label: 'deviceOverviewPage.kemOptions.two',
        value: 2
      };
      expect(actual).toEqual(expected);
    });

    it('0 should return 0 option', function () {
      var actual = KemService.getKemOption(0);
      var expected = {
        label: 'deviceOverviewPage.kemOptions.none',
        value: 0
      };
      expect(actual).toEqual(expected);
    });

    it('3 should return 3 option', function () {
      var actual = KemService.getKemOption(3);
      var expected = {
        label: 'deviceOverviewPage.kemOptions.three',
        value: 3
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('isKEMAvailable', function () {

    it('Nothing should return false', function () {
      expect(KemService.isKEMAvailable()).toBeFalsy();
    });

    it('Cisco 8865 should return true', function () {
      expect(KemService.isKEMAvailable('Cisco 8865')).toBeTruthy();
    });

    it('Cisco 8831 should return false', function () {
      expect(KemService.isKEMAvailable('Cisco 8831')).toBeFalsy();
    });

  });
});
