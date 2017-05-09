import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

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
                     private Notification: Notification,
                     private $stateParams: ng.ui.IStateParamsService,
                     private $translate: ng.translate.ITranslateService,
                     private TelephonyDomainService: TelephonyDomainService,
  ) {
    let currentTD = this.gemService.getStorage('currentTelephonyDomain');
    this.customerId = currentTD.customerId;
    this.ccaDomainId = currentTD.ccaDomainId;

    if (_.has(this.$stateParams, 'info.notes')) {
      this.model = _.get(this.$stateParams, 'info.notes', []);
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
    let postData = {
      customerID: this.customerId,
      siteID: this.ccaDomainId,
      action: GmTdNotesView.NOTE_ACTION,
      actionFor: GmTdNotesView.NOTE_POST_ACTION_FOR,
      objectName: this.newNote,
    };

    let notes = _.get(postData, 'objectName');
    if (this.getByteLength(notes) > GmTdNotesView.MAX_LENGTH_NOTE) {
      this.Notification.error(this.$translate.instant('gemini.cbgs.notes.errorMsg.maxLength'));
      return;
    }

    this.isSubmitting = true;
    this.TelephonyDomainService.postNotes(postData).then((res) => {
      this.isSubmitting = false;

      let resJson: any = _.get(res, 'content.data');
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
    });
  }

  private getByteLength(str) {
    let totalLength = 0;
    let charCode;
    for (let i = 0; i < str.length; i++) {
      charCode = str.charCodeAt(i);
      if (charCode < 0x007f) {
        totalLength = totalLength + 1;
        /* istanbul ignore if */
      } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
        totalLength += 2;
        /* istanbul ignore else */
      } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
        totalLength += 3;
      }
    }
    return totalLength;
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
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdNotesView.tpl.html';
}
