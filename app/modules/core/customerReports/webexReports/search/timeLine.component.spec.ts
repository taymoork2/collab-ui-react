import testModule from './index';


describe('Component: custTimeLine', () => {
  beforeAll(function () {
    this.sourceData = {
      overview: {
        startTime: 1497829243000,
        endTime: 1497829527000,
        duration: '344',
      },
      lines: [
        {
          joinTime: 1497829303000,
          leaveTime: 1497829467000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829243000,
          leaveTime: 1497829407000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829363000,
          leaveTime: 1497829527000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829303000,
          leaveTime: 1497829467000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829243000,
          leaveTime: 1497829407000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829363000,
          leaveTime: 1497829527000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829303000,
          leaveTime: 1497829467000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829243000,
          leaveTime: 1497829407000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829363000,
          leaveTime: 1497829527000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829303000,
          leaveTime: 1497829467000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829243000,
          leaveTime: 1497829407000,
          userName: 'fn ln',
          platform: '0',
        }, {
          joinTime: 1497829363000,
          leaveTime: 1497829527000,
          userName: 'fn ln',
          platform: '0',
        },
      ],
    };
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies();
  });

  function initComponent() {
    const bindings = { sourceData: this.sourceData };
    this.compileComponent('custTimeLine', bindings);
    this.$scope.$apply();
  }

  it('Should draw timeline with svg', function () {
    initComponent.call(this);
    expect(this.view.find('.timelineSvg')).toExist();
  });
});
