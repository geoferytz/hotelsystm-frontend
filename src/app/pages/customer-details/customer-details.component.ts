import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Pipe({ name: 'activeStays', standalone: true })
export class ActiveStaysPipe implements PipeTransform {
  transform(bookings: any[]): number {
    return bookings.filter(b => b.status === 'checked-in').length;
  }
}

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ActiveStaysPipe],
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css'],
})
export class CustomerDetailsComponent implements OnInit {
  customer: any = null;
  bookings: any[] = [];
  billings: any[] = [];
  totalBilled = 0;
  totalPaid = 0;
  showExtendModal = false;
  extendBooking: any = null;
  newCheckOut = '';

  constructor(private api: ApiService, private route: ActivatedRoute, private toast: ToastService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDetails(+id);
  }

  loadDetails(id: number): void {
    this.api.getCustomerDetails(id).subscribe({
      next: (data: any) => {
        this.customer = data.customer;
        this.bookings = data.bookings;
        this.billings = data.billings;
        this.totalBilled = this.billings.reduce((s: number, b: any) => s + parseFloat(b.totalAmount || 0), 0);
        this.totalPaid = this.billings.reduce((s: number, b: any) => s + parseFloat(b.paidAmount || 0), 0);
      },
    });
  }

  openExtendModal(b: any): void {
    this.extendBooking = b;
    this.newCheckOut = '';
    this.showExtendModal = true;
  }

  submitExtend(): void {
    if (!this.newCheckOut) { this.toast.warning('Select Date', 'Please select a new check-out date.'); return; }
    this.api.extendBooking(this.extendBooking.id, this.newCheckOut).subscribe({
      next: (res: any) => {
        this.toast.success('Stay Extended', res.message);
        this.showExtendModal = false;
        this.loadDetails(this.customer.id);
      },
      error: (err: any) => this.toast.error('Extension Failed', err.error?.message || 'Extension failed.'),
    });
  }
}
