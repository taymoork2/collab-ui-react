import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from '../telephonyDomain.service';
import { ICustomGmtNotesScope } from './gmTdNotes.component';

class GmTdNotesView implements ng.IComponentController {
  private _getDataFromHttp: boolean = true;
  private static readonly MAX_LENGTH_NOTE: number = 2048;
  private static readonly NOTE_ACTION: string = 'add_notes_td';
  private static readonly NOTE_ACTION_FOR: string = 'Telephony Domain';

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
      customerId: this.customerId,
      part: 'TD',
      siteId: this.ccaDomainId,
      note: this.newNote,
    };

    const notes = _.get(postData, 'note');
    if (this.gemService.getByteLength(notes) > GmTdNotesView.MAX_LENGTH_NOTE) {
      this.Notification.error('gemini.cbgs.notes.errorMsg.maxLength', { maxLength: GmTdNotesView.MAX_LENGTH_NOTE });
      return;
    }

    this.isSubmitting = true;
    this.TelephonyDomainService.postNotes(postData).then((res) => {
      this.isSubmitting = false;

      this.model.unshift(res);
      if (this.displayCount === this.model.length - 1) {
        this.displayCount = this.model.length;
      }
      this.newNote = '';
      this.$scope.$$childTail.$$childTail.noteForm.$setPristine();
      this.$scope.$emit('detailWatch', { notes: this.model });
    }).catch((err) => {
      this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
    });
  }

  private getNotes() {
    if (!this._getDataFromHttp) {
      return;
    }

    const data = {
      siteId: this.ccaDomainId,
      objectId: '',
      customerId: this.customerId,
      actionFor: GmTdNotesView.NOTE_ACTION_FOR,
    };

    this.isLoading = true;
    this.TelephonyDomainService.getHistories(data)
      .then((res: any[]) => {
        this.model = _.remove(res, (item: any): boolean => {
          return item.action === GmTdNotesView.NOTE_ACTION;
        });

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
