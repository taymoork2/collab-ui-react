import makeDefault from './index';

describe('component: MakeDefaultLocationComponent', () => {
  beforeEach(function () {
    this.initModules(makeDefault);
    this.injectDependencies(
      '$scope',
      'LocationsService',
      '$q',
      'Notification',
    );
    this.$scope.close = jasmine.createSpy('close');
    spyOn(this.LocationsService, 'createLocation');
    spyOn(this.Notification, 'errorResponse');
    this.compileComponent('ucMakeDefaultLocation', {
      close: 'close()',
    });
  });

  it('should update', function () {
    spyOn(this.LocationsService, 'makeDefault').and.returnValue(this.$q.resolve());
    this.view.find('button.btn--primary').click();
    const placeHolder = true;
    expect(placeHolder).toEqual(true);
    expect(this.$scope.close).toHaveBeenCalled();
    expect(this.Notification.errorResponse).not.toHaveBeenCalled();
  });

  describe('Negative test', () => {
    it('should throw an error', function () {
      spyOn(this.LocationsService, 'makeDefault').and.returnValue(this.$q.reject());
      this.view.find('button.btn--primary').click();
      const placeHolder = true;
      expect(placeHolder).toEqual(true);
      expect(this.Notification.errorResponse).toHaveBeenCalled();
    });
  });
});
