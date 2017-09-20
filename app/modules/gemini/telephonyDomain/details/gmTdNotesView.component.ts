import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';
import { ICustomGmtNotesScope } from './gmTdNotes.component';

class GmTdNotesView implements ng.IComponentController {
  private _getDataFromHttp: boolean = true;
  private static readonly MAX_LENGTH_NOTE: number = 2048;
  private static readonly NOTE_ACTION: string = 'add_notes_td';
  private static readonly NOTE_POST_ACTION_FOR: string = 'Telephony Domain';

  public newNote: any;
  public model: any[] = [];
  public customerId: string;
  public ccaDomainId: string;
  public displayCount: number = 5;
  public isLoaded: boolean = false;
  public isLoading: boolean = false;
  public isCollapsed: boolean = true;
  public isSubmitting: boolean = false;

  /* @ngInject */
  public constructor(private gemService,
                     private $scope: ICustomGmtNotesScope,
                     private Notification: Notification,
                     private $translate: ng.translate.ITranslateService,
                     private TelephonyDomainService: TelephonyDomainService,
  ) {
    const currentTD = this.gemService.getStorage('currentTelephonyDomain');
    this.customerId = currentTD.customerId;
    this.ccaDomainId = currentTD.ccaDomainId;

    this.model = this.gemService.getStorage('currentTdNotes');
    if (this.model && this.model.length) {
      this._getDataFromHttp = false;
    }
  }

  public onCollapse() {
    this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed && !this.isLoaded) {
      this.getNotes();
    }
  }

  public onShowAll() {
    this.displayCount = this.model.length;
  }

  public onSave(): void {
    const postData = {
      customerID: this.customerId,
      siteID: this.ccaDomainId,
      action: GmTdNotesView.NOTE_ACTION,
      actionFor: GmTdNotesView.NOTE_POST_ACTION_FOR,
      objectName: this.newNote,
    };

    const notes = _.get(postData, 'objectName');
    if (this.gemService.getByteLength(notes) > GmTdNotesView.MAX_LENGTH_NOTE) {
      this.Notification.error('gemini.cbgs.notes.errorMsg.maxLength', { maxLength: GmTdNotesView.MAX_LENGTH_NOTE });
      return;
    }

    this.isSubmitting = true;
    this.TelephonyDomainService.postNotes(postData).then((res) => {
      this.isSubmitting = false;

      const resJson: any = _.get(res, 'content.data');
      if (resJson.returnCode) {
        this.Notification.error(this.$translate.instant('gemini.errorCode.genericError'));
        return;
      }

      if (!resJson.body) {
        this.Notification.error(this.$translate.instant('gemini.errorCode.genericError'));
        return;
      }

      this.model.unshift(resJson.body);
      if (this.displayCount === this.model.length - 1) {
        this.displayCount = this.model.length;
      }
      this.newNote = '';
      this.$scope.$$childTail.$$childTail.noteForm.$setPristine();
      this.$scope.$emit('detailWatch', { notes: this.model });
    });
  }

  private getNotes() {
    if (!this._getDataFromHttp) {
      return;
    }

    this.isLoading = true;
    this.TelephonyDomainService.getNotes(this.customerId, this.ccaDomainId)
      .then((res) => {
        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error(this.$translate.instant('getListError'));
          return;
        }
        this.model = _.get(res, 'content.data.body', []);
        this.isLoading = false;
        this.isLoaded = true;
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }
}

export class GmTdNotesViewComponent implements ng.IComponentOptions {
  public controller = GmTdNotesView;
  public template = require('modules/gemini/telephonyDomain/details/gmTdNotesView.tpl.html');
}
