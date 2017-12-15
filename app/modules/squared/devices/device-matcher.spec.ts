'use strict';
import { DeviceMatcher } from './device-matcher';

describe('Service: DeviceMatcher', function () {

  const createDevice = (): csdm.IDevice => {
    return {
      isATA: true,
      ip: 'bbb',
      mac: '22:cc:cc:11:11',
      serial: 'ddd',
      isOnline: true,
      canReset: true,
      canDelete: true,
      canReportProblem: true,
      supportsCustomTags: true,
      cssColorClass: 'eee',
      product: 'fff',
      productFamily: 'ggg',
      diagnosticsEvents: [{ message: 'hhh', type: 'iii' }],
      upgradeChannel: { label: 'jjj', value: '11jjj11' },
      hasIssues: true,
      accountType: 'kkk',
      cisUuid: 'lll',
      displayName: 'mmm',
      image: 'nnn',
      type: 'ooo',
      sipUrl: 'ppp',
      tags: ['qqq'],
      url: 'rrr',
      photos: ['sss'],
      state: { key: 'vvv', readableState: 'ttt' },
      readableActiveInterface: 'uuu',
    };
  };

  const test = {
    device: createDevice(),
  };

  function testForTermInDevice(term: string) {
    expect(term).not.toBeEmpty();
    expect(new DeviceMatcher().matchesSearch(term, test.device)).toBeTruthy();
    expect(new DeviceMatcher().matchesSearch(term.slice(0, -1), test.device)).toBeTruthy();
    expect(new DeviceMatcher().matchesSearch(term + 'BB', test.device)).toBeFalsy();
    expect(new DeviceMatcher().matchesSearch(term + 'Bb', test.device)).toBeFalsy();
  }

  describe('matchesSearch', function () {
    it('should match when no search term', function () {
      expect(new DeviceMatcher().matchesSearch('', test.device)).toBeTruthy();
    });

    it('should not match when it shouldnt', function () {
      expect(new DeviceMatcher().matchesSearch('asdfas', test.device)).toBeFalsy();
    });

    it('should match case insensitive', function () {
      testForTermInDevice(_.toUpper(test.device.displayName));
      testForTermInDevice(_.toLower(test.device.displayName));
    });

    it('should search on display name', function () {
      testForTermInDevice(test.device.displayName);
    });

    it('should search on product', function () {
      testForTermInDevice(test.device.product);
    });

    it('should search on state readableState', function () {
      testForTermInDevice(test.device.state.readableState);
    });

    it('should search on ip', function () {
      testForTermInDevice(test.device.ip);
    });

    it('should search on readableActiveInterface', function () {
      testForTermInDevice(test.device.readableActiveInterface);
    });

    it('should search on mac without colon', function () {
      testForTermInDevice('cccc');
    });

    it('should search on mac with colon', function () {
      testForTermInDevice('cc:cc');
    });

    it('should search on tags', function () {
      testForTermInDevice(test.device.tags[0]);
    });

    it('should search on serial', function () {
      testForTermInDevice(test.device.serial);
    });

    it('should search on upgradechannel label', function () {
      testForTermInDevice(test.device.upgradeChannel.label);
    });

    it('should search on upgrade channel value', function () {
      testForTermInDevice(test.device.upgradeChannel.value);
    });

    it('should search on issue types', function () {
      testForTermInDevice(test.device.diagnosticsEvents[0].type);
    });

    it('should search on issue messages', function () {
      testForTermInDevice(test.device.diagnosticsEvents[0].message);
    });

    it('should search on multiple terms', function () {
      testForTermInDevice(test.device.displayName + ',' + test.device.serial);
      testForTermInDevice(test.device.displayName + ' ' + test.device.serial);
      testForTermInDevice(test.device.displayName + ', ' + test.device.serial);
    });
  });
});
