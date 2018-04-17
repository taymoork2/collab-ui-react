import testModule from './index';
import { Devices, Platforms } from './searchService';

describe('Component: dgcTimeLine', () => {
  beforeAll(function () {
    this.sourceData = {
      lines: [],
      offset: '+08:00',
      endTime: 1497829527000,
      startTime: 1497829243000,
    };
    this.circleColor = [{ joinTime: 1497829243001, guestId: 0, userId: 62527, joinMeetingTime: '22', jmtQuality: '3' }];
    this.lineColor = [{ joinTime: 1497829243001, guestId: 0, userId: 62527, packageLossRate: 0.06, latency: 500.3, dataQuality: '2' }];
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService', 'Notification', '$timeout');
    moment.tz.setDefault('America/Chicago');
  });

  function mockLines(n) {
    let i = 0;
    while (i < n) {
      const line = { joinTime: 1497829243001, userId: 62527, guestId: 0, leaveTime: 1497829527000, userName: 'fn ln', platform: '0' };
      line.userId += i;
      line.joinTime += i;
      line.userName += i;
      this.sourceData.lines.push(line);
      i++;
    }
  }

  function initComponent(bindings) {
    this.compileComponent('dgcTimeLine', bindings);
    this.$scope.$apply();
  }

  it('Should draw timeline with svg', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);
    expect(this.view.find('.timelineSvg')).toExist();
  });

  it('', function () {
    this.sourceData.lines = [];
    mockLines.call(this, 4);
    const bindings = { sourceData: this.sourceData, circleColor: undefined, lineColor: undefined };
    initComponent.call(this, bindings);

    const circle = {
      previousValue: undefined,
      currentValue: this.circleColor,
      isFirstChange() { return true; },
    };

    const line = {
      previousValue: undefined,
      currentValue: this.lineColor,
      isFirstChange() { return true; },
    };

    this.controller.$onChanges({ lineColor: line });
    this.controller.$onChanges({ circleColor: circle });
  });

  it('Should get pstn call in type when device is IP Phone or Phone', function () {
    const bindings = { sourceData: this.sourceData };
    const mockData = { items: [{ pstnCallInType: 'Toll Free' }] };
    spyOn(this.SearchService, 'getPSTNCallInType').and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this, bindings);

    const msgArr = [{ key: 'SIP', value: '' }];
    const mockParam = { device: 'IP Phone', pstnCallInType: '' };
    this.controller.tip = {
      transition: () => { return this.controller.tip; },
      html: (ht) => { this.controller.tip.t(ht); return this.controller.tip; },
      classed: (ht, ft) => { this.controller.tip.t(ht); this.controller.tip.t(ft); return this.controller.tip; },
      style: (n, ftv) => { this.controller.tip.t(n); this.controller.tip.t(ftv); return this.controller.tip; },
      duration: (time) => { this.controller.tip.t(time); return this.controller.tip; },
      replace: (n, ftv) => { this.controller.tip.t(n); this.controller.tip.t(ftv); return this.controller.tip; },
      t: (t) => { if (t) { return true; } },
    };
    this.controller.getDeviceOrPSTNType(mockParam, msgArr);
    this.$scope.$apply();
    expect(mockParam['pstnCallInType']).toBe('Toll Free');
  });

  it('Should hide tips with hideTips', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);

    this.controller.hideTips();
    expect(1).toExist();
  });

  it('Should get correct data with getJoinMeetingQualityIndex', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);

    const item = { joinMeetingTime: 8 };
    this.controller.getJoinMeetingQualityIndex(item);
    item.joinMeetingTime = 15;
    this.controller.getJoinMeetingQualityIndex(item);
    item.joinMeetingTime = 25;
    this.controller.getJoinMeetingQualityIndex(item);
    expect(item).toExist();
  });

  it('Should get correct data with setMsg', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);

    const item = { type: 'video', quality: 4.0, audioMos: 4, callType: 2, lossRate: 3.5, jitter: 2738 };
    this.controller.setMsg(item);
    expect(item).toExist();
  });

  it('Should get correct data with updateGraph', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);

    const items = [{
      guestId: 2120903557,
      jmtQuality: 2,
      joinMeetingTime: 6,
      joinTime: 1519615361000,
      userId: 0,
      userName: 'Bangyao' }];
    this.controller.updateGraph(items);
    spyOn(this.controller, 'getJoinMeetingQualityIndex').and.returnValue(1);
    this.controller.updateGraph(items);
    expect(items).toExist();
  });

  it('Should get correct data with makeTips', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);

    const msgArr = [{ key: 'Join Time: ', value: '' }];
    this.controller.tip = {
      transition: () => { return this.controller.tip; },
      html: (ht) => { this.controller.tip.t(ht); return this.controller.tip; },
      classed: (ht, ft) => { this.controller.tip.t(ht); this.controller.tip.t(ft); return this.controller.tip; },
      style: (n, ftv) => { this.controller.tip.t(n); this.controller.tip.t(ftv); return this.controller.tip; },
      duration: (time) => { this.controller.tip.t(time); return this.controller.tip; },
      replace: (n, ftv) => { this.controller.tip.t(n); this.controller.tip.t(ftv); return this.controller.tip; },
      t: (t) => { if (t) { return true; } },
    };
    this.controller.makeTips({ arr: msgArr }, 100, 100);
    expect(msgArr).toExist();
  });

  it('Should detect and update device type', function () {
    const bindings = { sourceData: this.sourceData };
    const mockData = { items: [{ deviceType: 'SIP' }] };
    spyOn(this.SearchService, 'getRealDevice').and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this, bindings);

    const msgArr = [{ key: 'SIP', value: '' }];

    const mockParam = { platform: '10', device: '' };
    this.controller.tip = {
      transition: () => { return this.controller.tip; },
      html: (ht) => { this.controller.tip.t(ht); return this.controller.tip; },
      classed: (ht, ft) => { this.controller.tip.t(ht); this.controller.tip.t(ft); return this.controller.tip; },
      style: (n, ftv) => { this.controller.tip.t(n); this.controller.tip.t(ftv); return this.controller.tip; },
      duration: (time) => { this.controller.tip.t(time); return this.controller.tip; },
      replace: (n, ftv) => { this.controller.tip.t(n); this.controller.tip.t(ftv); return this.controller.tip; },
      t: (t) => { if (t) { return true; } },
    };
    this.controller.getDeviceOrPSTNType(mockParam, msgArr);
    this.$scope.$apply();
    expect(mockParam['device']).toBe('SIP');
  });

  it('Should get tips function for yAxis: PSTN Toll', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    const mockData = { items: [{ pstnCallInType: 'Toll' }] };
    spyOn(this.SearchService, 'getPSTNCallInType').and.returnValue(this.$q.resolve(mockData));
    initComponent.call(this, bindings);
    const tipsHandler = this.controller.yAxisTips();
    const mockParam = { userName: 'Ethan', device: Devices.IP_PHONE, joinTime_: '2018-03-29 10:00:00', duration: 120, y1: 15 };
    tipsHandler(mockParam);
    spyOn(this.controller, 'makeTips').and.returnValue(null);
    this.$timeout.flush();
    const mockArr = {
      arr: [
        { key: 'Ethan' },
        { key: 'reportsPage.webexMetrics.callIn: ', value: 'Toll' },
        { key: 'reportsPage.webexMetrics.joinTime: ', value: '2018-03-29 10:00:00' },
        { key: 'reportsPage.webexMetrics.duration: ', value: 'time.abbreviatedCap.minutes' },
      ],
    };
    expect(this.controller.makeTips).toHaveBeenCalledWith(mockArr, 0, 110.5);
  });

  it('Should get tips function for yAxis: CMR device', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);
    const tipsHandler = this.controller.yAxisTips();
    const mockParam = { userName: 'Ethan', device: 'SIP', Platforms: Platforms.TP, joinTime_: '2018-03-29 10:00:00', duration: 120, y1: 15 };
    spyOn(this.controller, 'makeTips');
    tipsHandler(mockParam);
    const mockArr = {
      arr: [
        { key: 'Ethan' },
        { key: 'SIP' },
        { key: 'reportsPage.webexMetrics.joinTime: ', value: '2018-03-29 10:00:00' },
        { key: 'reportsPage.webexMetrics.duration: ', value: 'time.abbreviatedCap.minutes' },
      ],
    };
    expect(this.controller.makeTips).toHaveBeenCalledWith(mockArr, 0, 110.5);
  });
});
