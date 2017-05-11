export class DirectInwardDialing {
  private list: Array<any> = [];

  public add(did): void {
    this.list.push(did);
  }

  public remove(did): void {
    let index = _.indexOf(this.list, did);
    if (index > -1) {
      this.list.splice(index, 1);
    }
  }

  public getList(): Array<any> {
    return this.list;
  }

  public clearList() {
    this. list = [];
  }
}
