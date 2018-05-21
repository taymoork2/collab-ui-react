import { FileShareControl, FileShareControlType } from 'modules/core/shared/org-settings/org-settings.service';

interface IDownloadUploadModel {
  download: boolean;
  upload: boolean;
}

export class FileSharingControlModel {
  public blockDesktopApp: IDownloadUploadModel = { download: false, upload: false };
  public blockWebApp: IDownloadUploadModel = { download: false, upload: false };
  public blockMobileApp: IDownloadUploadModel = { download: false, upload: false };
  public blockBots: IDownloadUploadModel = { download: false, upload: false };

  constructor(
    fileShareControl?: FileShareControl,
  ) {
    if (fileShareControl) {
      this.setModel(this.blockDesktopApp, fileShareControl.desktopFileShareControl);
      this.setModel(this.blockWebApp, fileShareControl.webFileShareControl);
      this.setModel(this.blockMobileApp, fileShareControl.mobileFileShareControl);
      this.setModel(this.blockBots, fileShareControl.botFileShareControl);
    }
  }

  public toFileShareControl(): FileShareControl {
    return {
      desktopFileShareControl: this.getModel(this.blockDesktopApp),
      mobileFileShareControl: this.getModel(this.blockMobileApp),
      webFileShareControl: this.getModel(this.blockWebApp),
      botFileShareControl: this.getModel(this.blockBots),
    };
  }

  private setModel(model: IDownloadUploadModel, type: FileShareControlType): void {
    switch (type) {
      case FileShareControlType.BLOCK_BOTH:
        model.download = true;
      case FileShareControlType.BLOCK_UPLOAD:
        model.upload = true;
        break;
    }
  }

  private getModel(model: IDownloadUploadModel): FileShareControlType {
    if (model.upload && model.download) {
      return FileShareControlType.BLOCK_BOTH;
    }
    if (model.upload) {
      return FileShareControlType.BLOCK_UPLOAD;
    }
    return FileShareControlType.NONE;
  }
}
