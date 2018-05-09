import * as d3 from 'd3';
import moduleName from './index';

describe('Component: DgcPartnerTimeLine', () => {
  const mockNode = {
    data: () => { return mockNode; },
    enter: () => { return mockNode; },
    attr: (name, value) => {
      if (_.isString(name)) {
        mockNode.values[name] = value;
      } else {
        _.assign(mockNode.values, name);
      }
      if (_.isFunction(value)) {
        value({});
      }
      return mockNode;
    },
    select: () => { return mockNode; },
    selectAll: () => { return mockNode; },
    style: () => { return mockNode; },
    append: () => { return mockNode; },
    text: () => { return mockNode; },
    on: (name, fn) => { mockNode.values[name] = fn; return mockNode; },
    html: () => { return mockNode; },
    classed: () => { return mockNode; },
    transition: () => { return mockNode; },
    duration: () => { return mockNode; },
    replace: () => { return mockNode; },
    remove: () => { return true; },
    size: () => { return 1; },
    values: {},
  };

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
    this.initModules(moduleName);
    this.injectDependencies('$q', 'PartnerSearchService', 'Notification', '$timeout');
    moment.tz.setDefault('America/Chicago');
  });

  function mockLines(n) {
    let i = 0;
    while (i < n) {
      const line = {
        joinTime: 1497829243001,
        userId: 62527,
        guestId: 0,
        leaveTime: 1497829527000,
        userName: 'fn ln',
        platform: '0',
      };
      line.userId += i;
      line.joinTime += i;
      line.userName += i;
      this.sourceData.lines.push(line);
      i += 1;
    }
  }

  function initComponent(bindings) {
    this.compileComponent('dgcPartnerTimeLine', bindings);
  }

  it('should draw timeline with svg', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);
    expect(this.view.find('.timelineSvg')).toExist();
  });

  it('should get no throw error', function () {
    this.sourceData.lines = [];
    mockLines.call(this, 4);
    const bindings = {
      sourceData: this.sourceData,
      circleColor: undefined,
      lineColor: undefined,
    };
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

  it('should get correct data with makeTips', function () {
    mockLines.call(this, 13);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);

    const msgArr = [{ key: 'Join Time: ', value: '' }];
    spyOn(this.controller, 'makeTips').and.returnValue('');
    this.controller.makeTips({ arr: msgArr }, 100, 100);
    expect(msgArr).toExist();
  });

  it('should detect and update device type', function () {
    const bindings = { sourceData: this.sourceData };
    const msgArr = [{ key: 'SIP', value: '' }];
    const mockData = { completed: true, items: [{ deviceType: 'SIP' }] };
    initComponent.call(this, bindings);
    spyOn(this.PartnerSearchService, 'getRealDevice').and.callFake(function () { return { then: function (callback) { return callback(mockData); } }; });

    const mockParam = { conferenceID: '1234340', nodeId: '544234' };
    spyOn(this.controller, 'makeTips').and.returnValue('');
    this.controller.detectAndUpdateDevice(mockParam, msgArr, 0);
    expect(mockParam['device']).toBe('SIP');
  });

  it('should show y axis', function () {
    const mockData = _.clone(mockNode);
    spyOn(d3, 'select').and.returnValue(mockData);
    const bindings = { sourceData: this.sourceData };
    initComponent.call(this, bindings);
    this.controller.yAxis();
    mockData.values['mouseover']({}, 1);
    mockData.values['mouseout']();
    expect(mockData.values['class']).toContainText('icon');
  });

  describe('updateStartPoints():', () => {
    it('should update start points: Good', function () {
      const mockData = _.clone(mockNode);
      spyOn(d3, 'select').and.returnValue(mockData);
      const bindings = { sourceData: this.sourceData };
      initComponent.call(this, bindings);
      this.controller.updateStartPoints([{ joinMeetingTime: 1 }]);
      mockData.values['mouseover']();
      mockData.values['mouseout']();
      expect(mockData.values['jmtQuality']).toBe('Good');
    });

    it('should update start points: Fair', function () {
      const mockData = _.clone(mockNode);
      spyOn(d3, 'select').and.returnValue(mockData);
      const bindings = { sourceData: this.sourceData };
      initComponent.call(this, bindings);
      this.controller.updateStartPoints([{ joinMeetingTime: 15 }]);
      expect(mockData.values['jmtQuality']).toBe('Fair');
    });

    it('should update start points: Poor', function () {
      const mockData = _.clone(mockNode);
      spyOn(d3, 'select').and.returnValue(mockData);
      const bindings = { sourceData: this.sourceData };
      initComponent.call(this, bindings);
      this.controller.updateStartPoints([{ joinMeetingTime: 30 }]);
      expect(mockData.values['jmtQuality']).toBe('Poor');
    });
  });
});
