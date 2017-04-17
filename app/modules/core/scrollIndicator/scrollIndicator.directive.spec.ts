
import { ScrollIndicatorController } from './scrollIndicator.directive';
import testModule from './index';

describe('scrollIndicator', () => {
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
        <div class="container" scroll-indicator style="background-color: yellow; height: 5em; width: 100%; overflow: scroll;">
          <ol>
            ${_.repeat('<li>ITEM</li>', 10)}
          </ol>
        </div>
      </div>
        `);
      this.$document[0].body.appendChild(this.view[0]);
      // we need to ensure the eoc-tag element has some height so we can pick it from the document
      this.$document.find('.container .scroll-indicator-eoc-tag').css({ height: '1px', margin: '1px 0', 'background-color': 'green' });
    });

    it('should inject require HTML', function () {

      let container = this.$document.find('.container')[0];
      expect(_.isElement(container)).toBeTruthy();

      // ensure the visibility tag element is in the container
      let eocTag = this.$document.find('.container .scroll-indicator-eoc-tag')[0];
      expect(_.isElement(eocTag)).toBeTruthy();

      // ensure indicator element is not in the scrolling container
      let noIndicator = this.$document.find('.container .scroll-indicator')[0];
      expect(angular.isElement(noIndicator)).toBeFalsy();

      // ensure the indicator element is child of the outer container
      let indicator = this.$document.find('.outer .scroll-indicator')[0];
      expect(angular.isElement(indicator)).toBeTruthy();

      // ensure the indicator contains the icon
      let icon = $(indicator).find('.icon');
      expect(angular.isElement(icon)).toBeTruthy();

    });

    it('should show indicator when eoc-tag is not visible', function () {
      expect(this.$scope.$ctrl.moreContent).toBeFalsy();
      this.$interval.flush(ScrollIndicatorController.MORE_CONTENT_CHECK_INTERVAL * 2);
      this.$scope.$digest();
      expect(this.$scope.$ctrl.moreContent).toBeTruthy();

      let indicator = this.$document.find('.outer .scroll-indicator')[0];
      expect(indicator).not.toHaveClass('ng-hide');
    });

    it('should hide indicator when eoc-tag is visible', function (done) {
      this.$interval.flush(ScrollIndicatorController.MORE_CONTENT_CHECK_INTERVAL * 2);
      this.$scope.$digest();
      expect(this.$scope.$ctrl.moreContent).toBeTruthy();

      this.$scope.$ctrl.scrollToEnd(() => {
        this.$interval.flush(ScrollIndicatorController.MORE_CONTENT_CHECK_INTERVAL * 2);
        this.$scope.$digest();
        expect(this.$scope.$ctrl.moreContent).toBeFalsy();
        let indicator = this.$document.find('.outer .scroll-indicator')[0];
        expect(indicator).toHaveClass('ng-hide');
        done();
      });

    });

  });
});
