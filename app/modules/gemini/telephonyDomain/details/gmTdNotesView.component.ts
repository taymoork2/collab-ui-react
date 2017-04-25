import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';

const NOTE_ACTION = 'add_notes_td';
const NOTE_POST_ACTION_FOR = 'Telephony Domain';

class GmTdNotesView implements ng.IComponentController {
  private _model: any[];
  private _displayCount: number = 5;
  private _noteMaxByte: number = 2048;

  public model: any[];
  public newNote: any;
  public customerId: string;
  public ccaDomainId: string;
  public isLoaded: boolean = false;
  public isLoading: boolean = false;
  public isCollapsed: boolean = true;
  public isSubmitting: boolean = false;
  public needToShowAll: boolean = false;

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
    this._model = _.get(this.$stateParams, 'info.notes', []);
  }

  public onCollapse() {
    this.isCollapsed = !this.isCollapsed;

    if (!this.isCollapsed && !this.isLoaded) {
      this.getNotes();
    }
  }

  public onShowAll() {
    if (this.needToShowAll) {
      this.model = this._model;
      this.needToShowAll = false;
    }
  }

  public onSave(): void {
    let postData = {
      customerID: this.customerId,
      siteID: this.ccaDomainId,
      action: NOTE_ACTION,
      actionFor: NOTE_POST_ACTION_FOR,
      objectName: this.newNote,
    };

    let notes = _.get(postData, 'objectName');
    if (this.getByteLength(notes) > this._noteMaxByte) {
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

      this._model.unshift(resJson.body);
      this.setModel();
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

  private setModel(): void {
    this.model = _.size(this._model) <= this._displayCount
      ? this._model
      : _.slice(this._model, 0, this._displayCount);
    this.needToShowAll = (_.size(this._model) > this._displayCount);
  }

  private getNotes() {
    if (typeof this._model !== 'undefined') {
      this.setModel();
      return;
    }

    this.isLoading = true;
    this.TelephonyDomainService.getNotes(this.customerId, this.ccaDomainId)
      .then((res) => {
        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error(this.$translate.instant('getListError'));
          return;
        }
        this._model = _.get(res, 'content.data.body', []);
        this.setModel();

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
