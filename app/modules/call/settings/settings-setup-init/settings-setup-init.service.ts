export class SettingSetupInitService {
  public selected;
  public setSelected(index) {
    this.selected = index;
  }

  public getSelected() {
    return this.selected;
  }
}
