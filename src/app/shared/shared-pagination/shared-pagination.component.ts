import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-shared-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-pagination.component.html',
  styleUrls: ['./shared-pagination.component.css'],
})
export class SharedPaginationComponent {
  @Input() currentPage = 1;
  @Input() itemsPerPage = 10;
  @Input() totalItems = 0;
  @Input() maxVisiblePages = 5;
  @Input() showInfo = true;
  @Input() disabled = false;

  @Output() pageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  get pages(): number[] {
    const visibleCount = Math.max(1, this.maxVisiblePages);
    let start = Math.max(1, this.currentPage - Math.floor(visibleCount / 2));
    let end = Math.min(this.totalPages, start + visibleCount - 1);

    if (end - start + 1 < visibleCount) {
      start = Math.max(1, end - visibleCount + 1);
    }

    const pages: number[] = [];
    for (let page = start; page <= end; page++) {
      pages.push(page);
    }
    return pages;
  }

  get showFirstPage(): boolean {
    return this.pages.length > 0 && this.pages[0] > 1;
  }

  get showLastPage(): boolean {
    return this.pages.length > 0 && this.pages[this.pages.length - 1] < this.totalPages;
  }

  get showStartEllipsis(): boolean {
    return this.pages.length > 0 && this.pages[0] > 2;
  }

  get showEndEllipsis(): boolean {
    return this.pages.length > 0 && this.pages[this.pages.length - 1] < this.totalPages - 1;
  }

  goToPage(page: number): void {
    if (this.disabled || page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
