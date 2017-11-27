import testModule from './index';

describe('Component: tabParticipants', () => {
  beforeAll(function() {

  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'SearchService');

    initSpies.apply(this);
  });

  function initSpies() {
  }

  function initComponent(this) {
    this.compileComponent('dgcTabParticipants');
    this.$scope.$apply();
  }

  it('Should get correct meetingName', function () {
    initComponent.call(this);
  });
});
