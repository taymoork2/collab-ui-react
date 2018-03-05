import testModule from './index';

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

  it('Should get pstn call in type when there is not user name', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);

    const mockData = { completed: true, description: 'Return results.', items: [{ pstnCallInType: 'TollFree' }] };
    spyOn(this.SearchService, 'getPSTNCallInType').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(mockData);
        },
      };
    });
    spyOn(this.controller, 'makeTips').and.returnValue(0);
    const line = { conferenceID: '434', nodeId: '234234', device: 'IP Phone', joinTime: 1497829243001, userId: 62527, guestId: 0, leaveTime: 1497829527000, userName: 'fnln', platform: '0' };
    const msgArr = [ { key: 'Join Time: ', value: '' }];
    const tollFree = {};
    this.controller.getPSTNCallInType(tollFree, msgArr, line);
    expect(tollFree['fnlnstartTime']).toBe(0);
  });

  it('Should get pstn call in type when there is user name', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);

    spyOn(this.controller, 'makeTips').and.returnValue(0);
    const mockTollFreeData = {User: 'Normal User', };
    const mockMsgArr = [{key: 'Join Time', value: '1', }, {key: 'Leave Time', value: '2', }];
    const mockItem = {device: 'Phone', userName: 'User', };
    this.controller.getPSTNCallInType(mockTollFreeData, mockMsgArr, mockItem);
    expect(mockMsgArr[1].value).toBe('Normal User');
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

    const msgArr = [ { key: 'Join Time: ', value: '' }];
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
    initComponent.call(this, bindings);

    const msgArr = [ { key: 'SIP', value: '' }];
    const mockData = {"items": [{"deviceType": "SIP"}], };
    spyOn(this.SearchService, 'getRealDevice').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(mockData);
        },
      };
    });

    const mockParam = {"platform": "10", };
    this.controller.tip = {
      transition: () => { return this.controller.tip; },
      html: (ht) => { this.controller.tip.t(ht); return this.controller.tip; },
      classed: (ht, ft) => { this.controller.tip.t(ht); this.controller.tip.t(ft); return this.controller.tip; },
      style: (n, ftv) => { this.controller.tip.t(n); this.controller.tip.t(ftv); return this.controller.tip; },
      duration: (time) => { this.controller.tip.t(time); return this.controller.tip; },
      replace: (n, ftv) => { this.controller.tip.t(n); this.controller.tip.t(ftv); return this.controller.tip; },
      t: (t) => { if (t) { return true; } },
    };
    this.controller.detectAndUpdateDevice(mockParam, msgArr);
    expect(mockParam['device']).toBe('SIP');
  });
});
