import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
})
export class BillingComponent implements OnInit {
  billings: any[] = [];
  bookings: any[] = [];
  hotelServices: any[] = [];
  showModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  editing = false;
  editingId = 0;
  deleteId = 0;
  filterStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { bookingId: '', customerId: '', totalAmount: 0, paidAmount: 0, paymentMethod: '', notes: '' };
  selectedBilling: any = null;
  extraChargeForm: any = { serviceId: '', quantity: 1, customName: '', price: 0 };
  Math = Math;

  billingColumns: SharedTableColumn[] = [
    { key: 'Customer.fullName', label: 'Guest', sortable: true, formatter: (b) => b.Customer?.fullName || '-' },
    { key: 'Booking.Room.roomNumber', label: 'Room', sortable: true, formatter: (b) => b.Booking?.Room?.roomNumber || '-' },
    { key: 'totalAmount', label: 'Total', type: 'currency', align: 'end', sortable: true, formatter: (b) => `${Number(b.totalAmount || 0).toLocaleString()} Tsh` },
    { key: 'paidAmount', label: 'Paid', type: 'currency', align: 'end', sortable: true, formatter: (b) => `${Number(b.paidAmount || 0).toLocaleString()} Tsh` },
    { key: 'paymentMethod', label: 'Method', sortable: true, formatter: (b) => b.paymentMethod || '-' },
    { key: 'paymentStatus', label: 'Status', type: 'status', sortable: true, statusClass: (status) => this.getPaymentStatusClass(status) },
  ];

  billingActions: SharedTableAction[] = [
    { action: 'view', label: 'View', icon: 'bi-eye', class: 'btn-outline-info' },
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadBillings();
    this.api.getHotelServices({ isActive: true }).subscribe({ next: (data: any) => this.hotelServices = data });
  }

  loadBillings(): void {
    this.api.getBillings(this.filterStatus).subscribe({
      next: (data: any) => {
        this.billings = data;
        this.currentPage = 1;
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onBillingTableAction(event: { action: string; row: any }): void {
    if (event.action === 'view') this.viewDetails(event.row);
    if (event.action === 'edit') this.editBilling(event.row);
    if (event.action === 'delete') this.deleteBilling(event.row.id);
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'partial':
        return 'info';
      case 'refunded':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  openModal(): void {
    this.editing = false;
    this.form = { bookingId: '', customerId: '', totalAmount: 0, paidAmount: 0, paymentMethod: '', notes: '' };
    this.api.getBookings().subscribe({ next: (data: any) => this.bookings = data });
    this.showModal = true;
  }

  editBilling(b: any): void {
    this.editing = true;
    this.editingId = b.id;
    this.form = { ...b };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onBookingSelect(): void {
    const selected = this.bookings.find((b: any) => b.id == this.form.bookingId);
    if (selected) {
      this.form.customerId = selected.customerId;
      const checkIn = new Date(selected.checkIn);
      const checkOut = new Date(selected.checkOut);
      const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
      this.form.totalAmount = nights * parseFloat(selected.Room?.price || 0);
    }
  }

  saveBilling(): void {
    // Auto-calculate payment status based on balance
    const totalAmount = parseFloat(this.form.totalAmount || 0);
    const paidAmount = parseFloat(this.form.paidAmount || 0);
    const balance = totalAmount - paidAmount;

    if (balance <= 0) {
      this.form.paymentStatus = 'paid';
    } else if (paidAmount > 0) {
      this.form.paymentStatus = 'partial';
    } else {
      this.form.paymentStatus = 'pending';
    }

    const obs = this.editing
      ? this.api.updateBilling(this.editingId, this.form)
      : this.api.createBilling(this.form);
    obs.subscribe({
      next: () => { this.closeModal(); this.loadBillings(); this.toast.success('Invoice Saved', this.editing ? 'Invoice updated.' : 'Invoice created.'); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving billing'),
    });
  }

  deleteBilling(id: number): void {
    this.deleteId = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    this.api.deleteBilling(this.deleteId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.loadBillings();
        this.toast.success('Deleted', 'Billing record deleted successfully.');
      },
      error: (err: any) => this.toast.error('Delete Failed', err.error?.message || 'Error deleting billing'),
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.deleteId = 0;
  }

  // ── Details Modal ──────────────────────────────────────────────────────────

  viewDetails(b: any): void {
    // Fetch fresh billing data to get latest extraCharges
    this.api.getBilling(b.id).subscribe({
      next: (data: any) => {
        console.log('Fresh billing data:', data);
        console.log('Extra charges:', data.extraCharges);
        
        // Auto-load food and drink requests for the room
        const roomId = data.Booking?.roomId;
        if (roomId) {
          this.loadFoodDrinkRequests(roomId, data);
        } else {
          this.selectedBilling = { ...data, extraCharges: data.extraCharges || [] };
          this.extraChargeForm = { serviceId: '', quantity: 1, customName: '', price: 0 };
          this.showDetailsModal = true;
        }
      },
      error: (err: any) => {
        console.error('Error fetching billing details:', err);
        this.toast.error('Error', 'Failed to load billing details');
      }
    });
  }

  loadFoodDrinkRequests(roomId: number, billingData: any): void {
    // Fetch both food and drink requests for the room
    forkJoin([
      this.api.getFoodRequestsByRoom(roomId),
      this.api.getDrinkRequestsByRoom(roomId)
    ]).subscribe({
      next: ([foodRequests, drinkRequests]: [any[], any[]]) => {
        console.log('Food requests:', foodRequests);
        console.log('Drink requests:', drinkRequests);
        
        // Convert food requests to charge format
        const foodCharges = foodRequests
          .filter((req: any) => req.status !== 'cancelled')
          .map((req: any) => ({
            name: `Food Request - ${req.items?.map((i: any) => i.name).join(', ') || 'Items'}`,
            quantity: 1,
            price: req.totalAmount,
            subtotal: req.totalAmount,
            type: 'food',
            referenceId: req.id,
            date: req.createdAt,
            autoAdded: true
          }));

        // Convert drink requests to charge format
        const drinkCharges = drinkRequests
          .filter((req: any) => req.status !== 'cancelled')
          .map((req: any) => ({
            name: `Drink Request - ${req.items?.map((i: any) => i.name).join(', ') || 'Items'}`,
            quantity: 1,
            price: req.totalAmount,
            subtotal: req.totalAmount,
            type: 'drink',
            referenceId: req.id,
            date: req.createdAt,
            autoAdded: true
          }));

        // Merge with existing extraCharges, avoiding duplicates by referenceId
        const existingCharges = billingData.extraCharges || [];
        const existingRefIds = new Set(existingCharges.map((c: any) => c.referenceId));
        
        const newCharges = [...foodCharges, ...drinkCharges].filter(
          (charge: any) => !existingRefIds.has(charge.referenceId)
        );

        const allCharges = [...existingCharges, ...newCharges];
        
        this.selectedBilling = { ...billingData, extraCharges: allCharges };
        this.extraChargeForm = { serviceId: '', quantity: 1, customName: '', price: 0 };
        this.showDetailsModal = true;
      },
      error: (err: any) => {
        console.error('Error loading food/drink requests:', err);
        // Show billing data even if food/drink requests fail to load
        this.selectedBilling = { ...billingData, extraCharges: billingData.extraCharges || [] };
        this.extraChargeForm = { serviceId: '', quantity: 1, customName: '', price: 0 };
        this.showDetailsModal = true;
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedBilling = null;
  }

  onServiceSelect(): void {
    const svc = this.hotelServices.find((s: any) => s.id == this.extraChargeForm.serviceId);
    if (svc) {
      this.extraChargeForm.customName = svc.name;
      this.extraChargeForm.price = parseFloat(svc.price);
    }
  }

  getExtraTotal(): number {
    return (this.selectedBilling?.extraCharges || [])
      .reduce((sum: number, c: any) => sum + parseFloat(c.subtotal || 0), 0);
  }

  getRoomBase(): number {
    if (!this.selectedBilling) return 0;
    return parseFloat(this.selectedBilling.totalAmount) - this.getExtraTotal();
  }

  getBalance(): number {
    if (!this.selectedBilling) return 0;
    return parseFloat(this.selectedBilling.totalAmount) - parseFloat(this.selectedBilling.paidAmount);
  }

  getChargeIcon(type: string): string {
    switch (type) {
      case 'food':
        return 'bi-egg-fried text-danger';
      case 'drink':
        return 'bi-cup-straw text-primary';
      default:
        return 'bi-plus-circle text-success';
    }
  }

  getChargeBadgeClass(type: string): string {
    switch (type) {
      case 'food':
        return 'danger';
      case 'drink':
        return 'primary';
      default:
        return 'success';
    }
  }

  addExtraCharge(): void {
    if (!this.extraChargeForm.serviceId && !this.extraChargeForm.customName) {
      this.toast.error('Validation', 'Please select a service or enter a name.'); return;
    }
    const qty = Math.max(1, parseFloat(this.extraChargeForm.quantity) || 1);
    const price = parseFloat(this.extraChargeForm.price) || 0;
    const charge = { name: this.extraChargeForm.customName, quantity: qty, price, subtotal: qty * price };

    // Fetch fresh billing data to get latest extraCharges including food/drink charges
    this.api.getBilling(this.selectedBilling.id).subscribe({
      next: (freshData: any) => {
        const updatedCharges = [...(freshData.extraCharges || []), charge];
        const newTotal = parseFloat(freshData.totalAmount) + charge.subtotal;
        const paidAmount = parseFloat(freshData.paidAmount || 0);
        const balance = newTotal - paidAmount;

        // Recalculate payment status based on new balance
        let newStatus = 'pending';
        if (balance <= 0) {
          newStatus = 'paid';
        } else if (paidAmount > 0) {
          newStatus = 'partial';
        }

        this.api.updateBilling(this.selectedBilling.id, { extraCharges: updatedCharges, totalAmount: newTotal, paymentStatus: newStatus }).subscribe({
          next: () => {
            this.selectedBilling.extraCharges = updatedCharges;
            this.selectedBilling.totalAmount = newTotal;
            this.selectedBilling.paymentStatus = newStatus;
            this.extraChargeForm = { serviceId: '', quantity: 1, customName: '', price: 0 };
            this.loadBillings();
            this.toast.success('Charge Added', `${charge.name} added to invoice.`);
          },
          error: (err: any) => this.toast.error('Failed', err.error?.message || 'Error adding charge'),
        });
      },
      error: (err: any) => this.toast.error('Failed', 'Error fetching fresh billing data'),
    });
  }

  removeExtraCharge(index: number): void {
    const charge = this.selectedBilling.extraCharges[index];

    // Fetch fresh billing data to get latest extraCharges including food/drink charges
    this.api.getBilling(this.selectedBilling.id).subscribe({
      next: (freshData: any) => {
        const updatedCharges = freshData.extraCharges.filter((_: any, i: number) => i !== index);
        const newTotal = Math.max(0, parseFloat(freshData.totalAmount) - parseFloat(charge.subtotal));
        const paidAmount = parseFloat(freshData.paidAmount || 0);
        const balance = newTotal - paidAmount;

        // Recalculate payment status based on new balance
        let newStatus = 'pending';
        if (balance <= 0) {
          newStatus = 'paid';
        } else if (paidAmount > 0) {
          newStatus = 'partial';
        }

        this.api.updateBilling(this.selectedBilling.id, { extraCharges: updatedCharges, totalAmount: newTotal, paymentStatus: newStatus }).subscribe({
          next: () => {
            this.selectedBilling.extraCharges = updatedCharges;
            this.selectedBilling.totalAmount = newTotal;
            this.selectedBilling.paymentStatus = newStatus;
            this.loadBillings();
            this.toast.success('Removed', `${charge.name} removed.`);
          },
          error: (err: any) => this.toast.error('Failed', err.error?.message || 'Error removing charge'),
        });
      },
      error: (err: any) => this.toast.error('Failed', 'Error fetching fresh billing data'),
    });
  }

  // ── Print & WhatsApp ───────────────────────────────────────────────────────

  printInvoice(): void {
    const b = this.selectedBilling;
    if (!b) return;
    const extras = (b.extraCharges || []);
    const extraRows = extras.map((c: any) =>
      `<tr><td>${c.name}</td><td style="text-align:center">${c.quantity}</td><td style="text-align:right">${parseFloat(c.price).toLocaleString()} Tsh</td><td style="text-align:right">${parseFloat(c.subtotal).toLocaleString()} Tsh</td></tr>`
    ).join('');
    const roomBase = this.getRoomBase();
    const nights = this.getNights(b);
    const balance = this.getBalance();
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Invoice #${b.id}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
      body{font-family:'Poppins',Arial,sans-serif;padding:0;margin:0;color:#16233f;background:#EBEBEB}
      .invoice-container{max-width:800px;margin:40px auto;background:#fff;border-radius:12px;box-shadow:0 10px 40px rgba(16, 54, 125,0.15);overflow:hidden}
      .header{background:linear-gradient(135deg,#0B2658 0%,#10367D 100%);padding:30px 40px;color:#fff;display:flex;justify-content:space-between;align-items:center}
      .logo{font-size:28px;font-weight:700;letter-spacing:1px;display:flex;align-items:center;gap:12px}
      .logo-icon{width:55px;height:55px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:28px;border:2px solid rgba(255,255,255,0.3);font-weight:800;font-size:32px;color:#fff}
      .logo-text{display:flex;flex-direction:column;line-height:1.2}
      .logo-name{font-size:26px;font-weight:700;letter-spacing:2px;display:flex;align-items:center}
      .invoice-logo{height:50px;width:auto;max-width:200px;object-fit:contain}
      .logo-tagline{font-size:11px;font-weight:300;letter-spacing:3px;text-transform:uppercase;opacity:0.9}
      .invoice-number{font-size:32px;font-weight:700;text-align:right}
      .invoice-number span{font-size:14px;font-weight:400;opacity:0.8;display:block}
      .content{padding:40px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px}
      .card{background:#EBEBEB;border-radius:10px;padding:20px;border-left:4px solid #10367D}
      .card h4{margin:0 0 15px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#0B2658;font-weight:600}
      .card p{margin:8px 0;font-size:13px;color:#5a6b85;display:flex;justify-content:space-between}
      .card p strong{color:#16233f}
      table{width:100%;border-collapse:collapse;margin:25px 0}
      th{background:#10367D;color:#fff;padding:15px 20px;text-align:left;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
      th:first-child{border-radius:8px 0 0 0}
      th:last-child{border-radius:0 8px 0 0}
      td{padding:15px 20px;border-bottom:1px solid #d5dde8;font-size:13px;color:#5a6b85}
      tr:last-child td{border-bottom:none}
      tr:hover{background:#EBEBEB}
      .totals{width:300px;margin-left:auto;margin-top:20px;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(16, 54, 125,0.1)}
      .totals td{border:none;padding:12px 20px;background:#fff}
      .totals tr:nth-child(even){background:#EBEBEB}
      .tot{font-weight:700;color:#0B2658;font-size:16px}
      .bal{font-weight:700;color:#c0392b;font-size:16px}
      .signature-section{margin-top:40px;padding-top:30px;border-top:2px dashed #d5dde8}
      .signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:20px}
      .signature-box{text-align:center}
      .signature-line{border-bottom:2px solid #10367D;padding-bottom:10px;margin-bottom:10px;min-height:60px;display:flex;align-items:center;justify-content:center;color:#5a6b85;font-style:italic;font-size:12px}
      .signature-label{font-size:12px;color:#0B2658;text-transform:uppercase;letter-spacing:1px;font-weight:500}
      .footer{text-align:center;margin-top:35px;color:#5a6b85;font-size:12px;padding:20px;background:#EBEBEB;border-radius:10px}
      .footer p{margin:5px 0}
      .badge{padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
      .badge-paid{background:#d4edda;color:#155724}.badge-pending{background:#fff3cd;color:#856404}.badge-partial{background:#cce5ff;color:#004085}
      @media print{body{background:#fff}.invoice-container{box-shadow:none;margin:0}}
    </style></head><body>
    <div class="invoice-container">
      <div class="header">
        <div class="logo">
          <div class="logo-text">
            <div class="logo-name">
            <img src="assets/images/NABO.png" alt="Naboo Hotels" class="invoice-logo" onerror="this.style.display='none'">
            </div>
            <div class="logo-tagline">HOTELS MANAGEMENT</div>
          </div>
        </div>
        <div class="invoice-number">
          INVOICE #${b.id}
          <span>${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <div class="content">
        <div class="grid">
          <div class="card"><h4>Guest Information</h4>
            <p><strong>Name:</strong> ${b.Customer?.fullName || '-'}</p>
            <p><strong>Phone:</strong> ${b.Customer?.phone || '-'}</p>
            <p><strong>Email:</strong> ${b.Customer?.email || '-'}</p>
          </div>
          <div class="card"><h4>Stay Details</h4>
            <p><strong>Room:</strong> ${b.Booking?.Room?.roomNumber || '-'} (${b.Booking?.Room?.type || '-'})</p>
            <p><strong>Check-In:</strong> ${b.Booking?.checkIn || '-'}</p>
            <p><strong>Check-Out:</strong> ${b.Booking?.checkOut || '-'}</p>
            <p><strong>Nights:</strong> ${nights}</p>
          </div>
        </div>
        <table>
          <thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Amount</th></tr></thead>
          <tbody>
            <tr><td>Room Charge – ${b.Booking?.Room?.roomNumber || '-'}</td><td style="text-align:center">${nights} nights</td><td style="text-align:right">${parseFloat(b.Booking?.Room?.price || 0).toLocaleString()} Tsh</td><td style="text-align:right">${roomBase.toLocaleString()} Tsh</td></tr>
            ${extraRows}
          </tbody>
        </table>
        <table class="totals">
          <tr class="tot"><td>Total Amount</td><td style="text-align:right">${parseFloat(b.totalAmount).toLocaleString()} Tsh</td></tr>
          <tr><td>Paid Amount</td><td style="text-align:right">${parseFloat(b.paidAmount).toLocaleString()} Tsh</td></tr>
          <tr class="bal"><td>Balance Due</td><td style="text-align:right">${balance.toLocaleString()} Tsh</td></tr>
        </table>
        <div style="margin-top:25px;padding:15px;background:#EBEBEB;border-radius:8px">
          <p style="margin:5px 0;font-size:13px"><strong>Payment Method:</strong> ${b.paymentMethod || '-'}</p>
          <p style="margin:5px 0;font-size:13px"><strong>Status:</strong> <span class="badge badge-${b.paymentStatus}">${b.paymentStatus}</span></p>
          ${b.notes ? `<p style="margin:5px 0;font-size:13px"><strong>Notes:</strong> ${b.notes}</p>` : ''}
        </div>
        <div class="signature-section">
          <div class="signature-grid">
            <div class="signature-box">
              <div class="signature-line">Customer Signature</div>
              <div class="signature-label">Guest</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Authorized Signature</div>
              <div class="signature-label">Hotel Management</div>
            </div>
          </div>
        </div>
        <div class="footer">
          <p><strong>Thank you for choosing Naboo Hotels!</strong></p>
          <p>For inquiries, contact us at info@naboohotels.com | +255 XXX XXX XXX</p>
          <p>Generated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
    <script>window.onload=function(){window.print()}</script>
    </body></html>`);
    w.document.close();
  }

  shareWhatsApp(): void {
    const b = this.selectedBilling;
    if (!b) return;
    const balance = this.getBalance();
    const extraLines = (b.extraCharges || [])
      .map((c: any) => `  • ${c.name} x${c.quantity}: ${parseFloat(c.subtotal).toLocaleString()} Tsh`).join('%0A');
    const text = `🏨 *Hotel Invoice #${b.id}*%0A%0A*Guest:* ${b.Customer?.fullName || '-'}%0A*Room:* ${b.Booking?.Room?.roomNumber || '-'}%0A*Check-In:* ${b.Booking?.checkIn || '-'}%0A*Check-Out:* ${b.Booking?.checkOut || '-'}%0A%0A*Charges:*%0A${extraLines ? extraLines + '%0A' : ''}*Total:* ${parseFloat(b.totalAmount).toLocaleString()} Tsh%0A*Paid:* ${parseFloat(b.paidAmount).toLocaleString()} Tsh%0A*Balance:* ${balance.toLocaleString()} Tsh%0A*Status:* ${b.paymentStatus}%0A*Method:* ${b.paymentMethod || '-'}%0A%0AThank you for your stay! 🙏`;
    const phone = b.Customer?.phone ? b.Customer.phone.replace(/\D/g, '') : '';
    window.open(phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`, '_blank');
  }

  getNights(b: any): number | string {
    if (!b?.Booking?.checkIn || !b?.Booking?.checkOut) return '-';
    const ci = new Date(b.Booking.checkIn);
    const co = new Date(b.Booking.checkOut);
    return Math.max(1, Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)));
  }
}
