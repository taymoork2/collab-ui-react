import deleteLocation from './../../index';

describe('component: deleteLocation', () => {
  beforeEach(function() {
    this.initModules(deleteLocation);
    this.injectDependencies(
      'LocationsService',
      '$q',
     );
    spyOn(this.LocationsService, 'deleteLocation');
    this.LocationsService.deleteLocation.and.returnValue(this.$q.resolve());
    this.compileComponent('deleteLocation', {});
  });

  it('should delete', function() {
    this.controller.deleteLocation();
    expect(this.LocationsService.deleteLocation).toHaveBeenCalled();
  });

});
