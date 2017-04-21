export class PaginateOptions {
  public currentPage = 0;
  public pageSize = 15;
  public numberOfPages(searchResults) {
    return Math.ceil(searchResults.length / this.pageSize);
  }
  public previousPage() {
    this.currentPage--;
  }
  public nextPage() {
    this.currentPage++;
  }
}
