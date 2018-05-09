import sitesGridModule from './index';

describe('Component: SitesGrid', () => {

  beforeEach(function () {
    this.initModules(sitesGridModule);
    this.injectDependencies(
      '$translate',
      'uiGridConstants',
    );
  });

  describe('at startup', () => {

    beforeEach(function () {
      this.compileComponent('sitesGrid');
    });
    it('defines a grid', function() {
      this.controller.$onInit();
      expect(this.controller.gridConfig).toExist();
    });

  });

});
