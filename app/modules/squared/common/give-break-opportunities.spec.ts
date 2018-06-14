describe('giveBreakOpportunities', () => {
  beforeEach(angular.mock.module('Squared'));
  let state = defaultState();

  function defaultState() {
    return {
      giveBreakOpportunities: Function,
    };
  }

  afterEach(() => {
    state = defaultState(); //clean up memory
  });

  beforeEach(inject((_$filter_) => {
    state.giveBreakOpportunities = _$filter_('giveBreakOpportunities');
  }));

  it('inserts zero width space before dots', () => {
    expect(state.giveBreakOpportunities('test.test')).toBe('test\u200B.test');
  });

  it('escapes input', () => {
    expect(state.giveBreakOpportunities('<evil script>')).toBe('&lt;evil script&gt;');
  });
});
