import { IFeature } from './featureList.component';

describe('Component: featureList', () => {
  let features: IFeature[] = [
   {
      "name":"Message",
      "icon":"Message",
      "state":"user-overview.messaging",
      "detail":"Message",
      "actionsAvailable":false
   },
   {
      "name":"Meeting",
      "icon":"Meeting",
      "state":"user-overview.conferencing",
      "detail":"Meeting 25 Party",
      "actionsAvailable":false
   },
   {
      "name":"Call",
      "icon":"Call",
      "state":"user-overview.communication",
      "detail":"Call",
      "actionsAvailable":true
   }
];

  beforeEach(function() {
    this.initModules('Core');
    this.injectDependencies('$scope');
    this.$scope.features = features;
    this.compileComponent('featureList', {'features': 'features'});
  });

  it('should expose a `features` object', function() {
    expect(this.controller.features).toBeDefined();
    expect(this.controller.features.length).toBeGreaterThan(0);
    expect(this.controller.features[0].name).toBe('Message');
  });

  it('should have a Message feature', function() {
    expect(this.view).toContainElement('a#Message');
  });

  it('should have a Meeting feature', function() {
    expect(this.view).toContainElement('a#Meeting');
  });

  it('should have a Call feature', function() {
    expect(this.view).toContainElement('a#Call');
  });
});
