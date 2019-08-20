import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'publish-dashboard-story-list-paging',
  template: `
    <div class="paging-container">
      <button class="pager"
        [disabled]="isPageActive(1)"
        (click)="!isPageActive(1) && showPage.emit(1)"
        title="Page 1">|«</button>
      <button class="pager"
        [disabled]="isPageActive(1)"
        (click)="!isPageActive(1) && showPage.emit(currentPage - 1)"
        title="Page {{ currentPage > 1 ? currentPage - 1 : 1 }}">«</button>

      <button
        *ngFor="let page of pages"
        class="pager" [class.active]="isPageActive(page)"
        [disabled]="isPageActive(page)"
        (click)="!isPageActive(page) && showPage.emit(page)"
        title="Page {{page}}">{{page}}</button>

      <button class="pager"
        [disabled]="isPageActive(totalPages)"
        (click)="!isPageActive(totalPages) && showPage.emit(currentPage + 1)"
        title="Page {{ currentPage + 1 < totalPages ? currentPage + 1 : totalPages }}">»</button>
      <button class="pager"
        [disabled]="isPageActive(totalPages)"
        (click)="!isPageActive(totalPages) && showPage.emit(totalPages)"
        title="Page {{ totalPages }}">»|</button>
    </div>
  `
})
export class DashboardStoryListPagingComponent implements OnChanges {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Output() showPage = new EventEmitter<number>();
  pages: number[];
  showNumPages = 5;
  pagesBegin: number;
  pagesEnd: number;
  lastPage: number;

  ngOnChanges() {
    this.lastPage = Math.floor(this.totalPages);

    if (this.totalPages <= this.showNumPages) {
      this.pagesBegin = 1;
      this.pagesEnd = this.lastPage;
    } else {
      const halfWindow = Math.floor(this.showNumPages / 2);
      if (this.currentPage <= (halfWindow + 1)) {
        this.pagesBegin = 1;
        this.pagesEnd = this.showNumPages;
      } else if ((this.currentPage + halfWindow) >= this.lastPage) {
        this.pagesBegin = this.lastPage - this.showNumPages + 1;
        this.pagesEnd = this.lastPage;
      } else {
        this.pagesBegin = this.currentPage - halfWindow;
        this.pagesEnd = this.currentPage + halfWindow;
      }
    }

    this.pages = [];
    for (let i = this.pagesBegin; i <= this.pagesEnd; i++) {
      this.pages.push(i);
    }
  }

  isPageActive(page: number): boolean {
    return this.currentPage === page;
  }
}
