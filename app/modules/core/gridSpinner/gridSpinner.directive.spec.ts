
import testModule from './index';

describe('gridSpinner', () => {
  beforeEach(function () {
    this.initModules(testModule, 'ngAnimateMock');
    this.injectDependencies(
      '$interval',
      '$animate',
      '$document',
    );
  });

  describe('Directive', () => {
    beforeEach(function () {
      this.compileTemplate(`
      <div class="outer">
        <div class="container" grid-spinner="displaySpinner">
          <div class="content"></div>
        </div>
      </div>
        `);
      this.$document[0].body.appendChild(this.view[0]);
    });

    it('should hide spinner when control expression is false ', function () {
      this.$scope.displaySpinner = false;
      this.$scope.$apply();

      // ensure grid spinner is in the container
      let spinner = this.$document.find('.container .grid-spinner')[0];
      expect(_.isElement(spinner)).toBeFalsy();
    });

    it('should show spinner when control expression is true ', function () {
      this.$scope.displaySpinner = true;
      this.$scope.$apply();

      let spinner = this.$document.find('.container .grid-spinner')[0];
      expect(_.isElement(spinner)).toBeTruthy();
    });

  });
});
