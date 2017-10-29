import virtualAssistantModule from './virtual-assistant-modal.component';

describe('Component: virtual assistant modal', () => {

  let expertVaDeferred;

  const listExpertAssistantsSuccess = function () {
    return {
      items: [
        {
          id: 'Expert Virtual Assistant',
          name: 'test1',
        },
      ],
    };
  };

  const listExpertAssistantsEmpty = function () {
    return {
      items: [],
    };
  };

  beforeEach(function () {
    this.initModules('Sunlight', virtualAssistantModule);
    this.injectDependencies(
      '$modal',
      '$q',
      '$scope',
      'Authinfo',
      '$state',
      'EvaService',
    );
    this.$scope.dismiss = jasmine.createSpy('dismiss');

    expertVaDeferred = this.$q.defer();
    spyOn(this.$modal, 'open');
    spyOn(this.$state, 'go');
    spyOn(this.Authinfo, 'isCare').and.returnValue(true);
    spyOn(this.EvaService, 'listExpertAssistants').and.returnValue(expertVaDeferred.promise);

    this.$state.isVirtualAssistantEnabled = true;
    this.$state.isExpertVirtualAssistantEnabled = true;

    this.compileComponent('virtual-assistant-modal', {
      dismiss: 'dismiss()',
    });

  });

  it('ok function call for VirtualAssistant results in no initiating state call But does close the care new feature Modal with the value chosen.', function () {
    this.controller.ok('cva');
    expect(this.$scope.dismiss).toHaveBeenCalledWith();
    expect(this.$state.go).toHaveBeenCalledWith('care.cva');
  });

  it('virtualAssistant Enabled, but expert virtual assistant disabled feature list to have care - customer only', function () {
    this.$state.isVirtualAssistantEnabled = true;
    this.$state.isExpertVirtualAssistantEnabled = false;
    this.compileComponent('virtual-assistant-modal', {
      dismiss: 'dismiss()',
    });
    expertVaDeferred.resolve(listExpertAssistantsSuccess());
    this.$scope.$apply();
    expect(this.controller.features.length).toEqual(1);
  });

  it('virtualAssistant Enabled feature list to have care - customer and expert virtualAssistants disabled', function () {
    expertVaDeferred.resolve(listExpertAssistantsSuccess());
    this.$scope.$apply();
    expect(this.controller.features.length).toEqual(2);
    expect(this.controller.features[1].disabled).toEqual(true);
  });

  it('virtualAssistant Enabled feature list to have care - customer and expert virtualAssistants enabled', function () {
    expertVaDeferred.resolve(listExpertAssistantsEmpty());
    this.$scope.$apply();
    expect(this.controller.features.length).toEqual(2);
    expect(this.controller.features[1].disabled).toEqual(false);
  });
});
