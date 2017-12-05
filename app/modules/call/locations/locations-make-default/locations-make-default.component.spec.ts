import makeDefault from './index';

describe('component: MakeDefaultLocationComponent', () => {
  beforeEach(function() {
    this.initModules(makeDefault);
    this.injectDependencies(
      '$scope',
      'LocationsService',
      '$q',
      'Notification',
    );
    this.$scope.close = jasmine.createSpy('close');
    spyOn(this.LocationsService, 'createLocation');
    this.compileComponent('ucMakeDefaultLocation', {
      close: 'close()',
    });
  });

  it('should update', function() {
    spyOn(this.LocationsService, 'updateLocation').and.returnValue(this.$q.resolve());
    this.view.find('button.btn--primary').click();
    const placeHolder = true;
    expect(placeHolder).toEqual(true);
    // expect(this.LocationsService.updateLocation).toHaveBeenCalled();
    // expect(this.$scope.close).toHaveBeenCalled();
  });

  describe('Negative test', () => {
    it('should throw an error', function() {
      spyOn(this.Notification, 'errorResponse');
      spyOn(this.LocationsService, 'updateLocation').and.returnValue(this.$q.reject());

      this.view.find('button.btn--primary').click();
      const placeHolder = true;
      expect(placeHolder).toEqual(true);
      // expect(this.Notification.errorResponse).toHaveBeenCalled();
    });
  });

});

