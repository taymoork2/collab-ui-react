
/**
 * CsvSimpleExport displays a download icon that, when pressed, exectutes
 * a csv export and download. Supports accesibility.
 */

class CsvSimpleExportController implements ng.IComponentController {
  public anchorText: string;
  public filename: string;
  public exportTooltip: string;
  public exportingTooltip: string;
  public icon: string;
  public tooltipPlacement: string;
  public onExport: any;
  public activeTooltip: string;
  public exporting = false;
  public exportedData: any;
  public stubId: string;

  /* @ngInject */
  constructor(
    public $element: ng.IRootElementService,
    public $timeout: ng.ITimeoutService,
  ) {}

  public $onInit() {
    this.activeTooltip = this.exportTooltip;
    this.exportedData = [];
    this.exporting = false;
    this.icon = 'icon-content-share';
    this.stubId = 'export-stub';
  }

  // onClick required to catch keyboard input
  public onClick() {
    if (this.exporting === false) {
      this.exporting = true;
      this.activeTooltip = this.exportingTooltip;

      this.onExport().then((data: any[]) => {
        this.exportedData = data;
        this.triggerExport();
      });
    }
  }

  private triggerExport() {
    this.$timeout(() => {
      this.$element.find('#' + this.stubId).click();
      this.activeTooltip = this.exportTooltip;
      this.exporting = false;
    });
  }
}

export class CsvSimpleExportComponent implements ng.IComponentOptions {
  public template = require('modules/core/csvDownload/csvSimpleExport/csvSimpleExport.component.html');
  public controller = CsvSimpleExportController;
  public bindings = {
    anchorText: '@',            // optional text description placed to the right of the icon
    onExport: '&',              // called when user clicks the export icon
    filename: '@',              // name of the file to use when saving
    exportTooltip: '@',         // tootip to show when not exporting
    exportingTooltip: '@',      // tootip to show WHILE exporting
    icon: '@',                  // icon to show for download symbol, defaul it icon-content-share
    stubId: '@',                // unique ID for element (required if multiple csv export elements are on a page)
    tooltipPlacement: '@',      // where to place the tooltip, use 'none' to hide tooltip
  };
}
