import testModule from './index';

describe('Component: custTimeLine', () => {
  beforeAll(function () {
    this.sourceData = {
      lines: [],
      offset: '+08:00',
      overview: { endTime: 1497829527000, startTime: 1497829243000 },
    };
    this.circleColor = [{ joinTime: 1497829243001, guestId: 0, userId: 62527, joinMeetingTime: '22', jmtQuality: '3' }];
    this.lineColor = [{ joinTime: 1497829243001, guestId: 0, userId: 62527, packageLossRate: 0.06, latency: 500.3, dataQuality: '2' }];
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies();
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
    this.compileComponent('custTimeLine', bindings);
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
});
