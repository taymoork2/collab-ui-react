import module from './index';
describe('Component: WebexSiteResultDisplayComponent', function () {

  beforeEach(function () {
    this.initModules(module);
    this.injectDependencies('$componentController', '$q', '$rootScope', '$scope');
    this.$scope.fixtures = {
      action: '',
    };
  });

  function compileComponent(action, isSuccess) {
    this.$scope.fixtures.action =  action;
    this.compileComponent('webexSiteResultDisplay', {
      action: 'fixtures.action',
      isSuccess: isSuccess,
    });
  }

  describe('Showing the results', function () {
    describe('DELETE results', function () {
      it('should have a success text for success', function () {
        compileComponent.apply(this, ['deleteSite', true]);
        const bodyHtml = this.view[0].innerHTML;
        expect(_.includes(bodyHtml, 'deleteSiteSuccessModalTitle')).toBeTruthy();
        expect(_.includes(bodyHtml, 'deleteSiteSuccessModalBody')).toBeTruthy();
      });

      it('should have a failure text for failure', function () {
        compileComponent.apply(this, ['deleteSite', false]);
        const bodyHtml = this.view[0].innerHTML;
        expect(_.includes(bodyHtml, 'deleteSiteFailureModalTitle')).toBeTruthy();
        expect(_.includes(bodyHtml, 'deleteSiteFailureModalTitle')).toBeTruthy();
      });
    });

    describe('ADD SITE results', function () {
      it('should have a success text for success', function () {
        compileComponent.apply(this, ['addSite', true]);
        const bodyHtml = this.view[0].innerHTML;
        expect(_.includes(bodyHtml, 'addSiteSuccessModalTitle')).toBeTruthy();
        expect(_.includes(bodyHtml, 'addSiteSuccessModalTitle')).toBeTruthy();
      });
      it('should have a failure text for failure', function () {
        compileComponent.apply(this, ['addSite', false]);
        const bodyHtml = this.view[0].innerHTML;
        expect(_.includes(bodyHtml, 'addSiteFailureModalTitle')).toBeTruthy();
        expect(_.includes(bodyHtml, 'addSiteFailureModalTitle')).toBeTruthy();
      });
    });
    describe('REDISTRIBUTE results', function () {
      it('should have a success text for success', function () {
        compileComponent.apply(this, ['redistribute', true]);
        const bodyHtml = this.view[0].innerHTML;
        expect(_.includes(bodyHtml, 'redistributeSuccessModalTitle')).toBeTruthy();
        expect(_.includes(bodyHtml, 'redistributeSuccessModalTitle')).toBeTruthy();
      });
      it('should have a failure text for failure', function () {
        compileComponent.apply(this, ['redistribute', false]);
        const bodyHtml = this.view[0].innerHTML;
        expect(_.includes(bodyHtml, 'redistributeFailureModalTitle')).toBeTruthy();
        expect(_.includes(bodyHtml, 'redistributeFailureModalTitle')).toBeTruthy();
      });
    });
  });
});

