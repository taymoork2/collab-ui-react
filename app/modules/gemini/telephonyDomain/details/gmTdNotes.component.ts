import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmTdNotesCtrl implements ng.IComponentController {

  public showNotesNum: number = 5;
  public noteMaxByte: number = 2048;
  public customerId: string;
  public ccaDomainId: string;
  public allNotes: any[] = [];
  public notes: any[] = [];
  public loading: boolean = true;
  public isShowAll: boolean = false;
  public newNote: string;

  /* @ngInject */
  public constructor(
    private gemService,
    private PreviousState,
    private $stateParams,
    private Notification: Notification,
    private TelephonyDomainService: TelephonyDomainService,
    private $state: ng.ui.IStateService,
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
  ) {
    this.customerId = _.get(this.$stateParams, 'obj.customerId', '');
    this.ccaDomainId = _.get(this.$stateParams, 'obj.ccaDomainId', '');
    this.allNotes = _.get(this.$stateParams, 'obj.notes', []);
  }

  public $onInit() {
    this.initNotes();
    this.$state.current.data.displayName = this.$translate.instant('gemini.cbgs.notes.notes');
  }

  private initNotes(): void {
    this.loading = false;
    this.isShowAll = _.size(this.allNotes) > this.showNotesNum;
    this.notes = _.size(this.allNotes) > this.showNotesNum ? _.slice(this.allNotes, 0, this.showNotesNum) : this.allNotes;
  }

  public onShowAll(): void {
    this.notes = this.allNotes;
    this.isShowAll = false;
  }

  public onSave(): void {
    const postData = {
      customerID: this.customerId,
      siteID: this.ccaDomainId,
      action: 'add_notes_td',
      actionFor: 'Telephony Domain',
      objectName: this.newNote,
    };

    const notes = _.get(postData, 'objectName');
    if (this.gemService.getByteLength(notes) > this.noteMaxByte) {
      this.Notification.error('gemini.cbgs.notes.errorMsg.maxLength', { maxLength: this.noteMaxByte });
      return;
    }

    this.loading = true;
    this.TelephonyDomainService.postNotes(postData).then((res) => {
      this.loading = false;

      const resJson: any = _.get(res, 'content.data');
      if (resJson.returnCode) {
        this.Notification.notify(this.gemService.showError(resJson.returnCode));
        return;
      }

      if (!resJson.body) {
        this.Notification.error('gemini.errorCode.genericError');
        return;
      }

      this.allNotes.unshift(resJson.body);
      this.isShowAll = _.size(this.allNotes) > this.showNotesNum;
      this.notes = _.size(this.allNotes) > this.showNotesNum ? _.slice(this.allNotes, 0, this.showNotesNum) : this.allNotes;
      this.newNote = '';

      this.$scope.$$childTail.$$prevSibling.noteForm.$setPristine();

      this.$scope.$emit('detailWatch', { notes: this.allNotes });
    });
  }

  public onCancel(): void {
    this.PreviousState.go();
  }

}

export class GmTdNotesComponent implements ng.IComponentOptions {
  public controller = GmTdNotesCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdNotes.tpl.html';
}
