import { IToolkitModalService } from 'modules/core/modal';

export class MigrateSipAddressSection implements ng.IComponentController {
  public settingSection = {
    title: 'hercules.settings.migrateSipAddress.title',
  };

  private isTestDone = false;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private ModalService: IToolkitModalService,
  ) {}

  public get l10nTestOrUndo(): string {
    if (this.isTestDone) {
      return 'hercules.settings.migrateSipAddress.undoTest';
    }
    return 'hercules.settings.migrateSipAddress.test';
  }

  public runOrUndoTest(): void {
    if (this.isTestDone) {
      this.undoTest();
    } else {
      this.runTest();
    }
  }

  public migrate(): void {
    this.ModalService.open({
      title: this.$translate.instant('hercules.settings.migrateSipAddress.migrateAllModal.title'),
      message: this.$translate.instant('hercules.settings.migrateSipAddress.migrateAllModal.message'),
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
    });
  }

  private runTest(): void {
    this.$modal.open({
      template: '<migrate-sip-address-search-modal close="$close()" dismiss="$dismiss()"></migrate-sip-address-search-modal>',
    }).result
      .then(() => this.isTestDone = true);
  }

  private undoTest(): void {
    this.ModalService.open({
      title: this.$translate.instant('hercules.settings.migrateSipAddress.undoTestModal.title'),
      message: this.$translate.instant('hercules.settings.migrateSipAddress.undoTestModal.message'),
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
    }).result
      .then(() => this.isTestDone = false);
  }
}

export class MigrateSipAddressSectionComponent implements ng.IComponentOptions {
  public controller = MigrateSipAddressSection;
  public template = require('./migrate-sip-address-section.component.html');
}
