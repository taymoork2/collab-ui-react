import { TOSService } from './termsOfService.service';
import { IToolkitModalService } from 'modules/core/modal';

class TermsOfServiceCtrl implements ng.IComponentController {
  public hasReadAggreement: boolean = false;
  public acceptingToS: boolean = false;
  public scrollData = {
    iframeHeight: 0,
    curPos: 0,
    bottomPos: 0,
    bodyHeight: 0,
  };
  private isFrameInitialized = false;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Auth,
    private TOSService: TOSService,
    private $modal: IToolkitModalService,
    private $window: ng.IWindowService,
    private $scope: ng.IScope,
    private $log: ng.ILogService,
    private $element,
  ) { }

  private getScrollY(doc: Document) {
    let scrOfY = 0;
    if (doc.body && doc.body.scrollTop) {
      //DOM compliant
      scrOfY = doc.body.scrollTop;
    } else if (doc.documentElement && doc.documentElement.scrollTop) {
      //IE6 standards compliant mode
      scrOfY = doc.documentElement.scrollTop;
    }
    return scrOfY;
  }

  public $onInit(): void {
    this.acceptingToS = false;

    // Load the external hosted PDF.  This does not look good since we are up to the whims of the
    // embedded PDF viewer.  However, at least it is up to date.
    // Also, clicking any link in the PDF will navigate away to that page, not open a new tab.
    // Finally, there is no way to detect when the user has scrolled to the bottom of the PDF since
    // scrolling is handled by the PDF viewer, which could be different on every platform.
    // let tosUrl = 'http://www.cisco.com/c/dam/en_us/about/doing_business/legal/docs/universal-cloud-terms.pdf';
    // let tosHtml = `
    // <html>
    //   <body>
    //       <object data="${tosUrl}" type="application/pdf">
    //           <embed src="${tosUrl}" type="application/pdf" />
    //       </object>
    //   </body>
    // </html>
    // `;
    // let tosStyle = `
    // <style>
    //   object {
    //     width: 100%;
    //     height: 100%
    //   }
    // </style>`;

    // manually update the iframe content
    const tosFrame = this.getTermsOfServiceFrame();
    if (tosFrame) {
      this.initFrameDocument(tosFrame.document);
    } else {
      const deregisterWatch = this.$scope.$watch(() => this.getTermsOfServiceFrame(), (tosFrame) => {
        if (tosFrame && !this.isFrameInitialized) {
          deregisterWatch();
          this.initFrameDocument(tosFrame.document);
        }
      });
    }
  }

  private getTermsOfServiceFrame() {
    return this.$window.frames['tos-frame'];
  }

  private initFrameDocument(iframeDoc: Document) {
    this.isFrameInitialized = true;

    // Load a copy of the ToS PDF that was converted to HTML. This WILL be out of date with what
    // is in the hosted PDF, but it looks nice and we can track the user scrolling to the bottom
    const tosHtml: string = require('modules/core/auth/tos/tos.html');
    const tosStyle: string = require('modules/core/auth/tos/tos-style.html');

    const iframe = $(iframeDoc);
    const style = $(tosStyle);
    iframeDoc.open();
    iframeDoc.close();
    iframe.find('head').append(style);
    iframe.find('body').append(tosHtml);

    iframe.scroll(() => {
      this.scrollData.iframeHeight = _.ceil(this.$element.find('.tos-container').height());
      this.scrollData.curPos = _.ceil(this.getScrollY(iframeDoc));
      this.scrollData.bodyHeight = _.floor(iframe.height() || 0);
      this.scrollData.bottomPos = _.ceil(this.scrollData.curPos + this.scrollData.iframeHeight);

      if (this.scrollData.bottomPos >= this.scrollData.bodyHeight) {
        this.hasReadAggreement = true;
      }
      this.$scope.$apply();
    });

    iframe.delegate('a', 'click', (e: any) => {
      const url = e.currentTarget.href;
      this.$log.log('Terms of Service opening external link to: ' + url);
      this.$window.open(url, '_blank');
      e.preventDefault();
      e.stopPropagation();
    });
  }

  public agree(): ng.IPromise<any> {
    this.acceptingToS = true;
    return this.TOSService.acceptTOS()
      .then(() => {
        this.TOSService.dismissModal();
        this.$state.go('login', {}, {
          reload: true,
        });
      });
  }

  public disagree(): void {
    this.$modal.open({
      template: '<h1 translate="termsOfService.loggingOut"></h1>',
      backdrop: 'static',
      keyboard: false,
      type: 'dialog',
    });
    this.Auth.logout();
  }

}

export class TermsOfServiceComponent implements ng.IComponentOptions {
  public controller = TermsOfServiceCtrl;
  public template = require('modules/core/auth/tos/termsOfService.html');
}
