import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PermissionService } from '../../services/permission.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, SharedTableComponent],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css'],
})
export class RoomsComponent implements OnInit {
  rooms: any[] = [];
  roomTypes: any[] = [];
  showModal = false;
  editing = false;
  editingId = 0;
  filterStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { roomNumber: '', type: '', floor: 1, price: 0, status: 'available', description: '', imageUrl: '' };
  numberOfRooms = 1;
  imageUrls: { url: string, file?: File | null }[] = [{ url: '', file: null }];
  uploadingImages = false;
  showConfirmDialog = false;
  deleteRoomId: number | null = null;
  Math = Math;

  roomColumns: SharedTableColumn[] = [
    { key: 'roomNumber', label: 'Room #', sortable: true, formatter: (room) => room.roomNumber || '-' },
    { key: 'type', label: 'Type', sortable: true, formatter: (room) => room.type ? String(room.type).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '-' },
    { key: 'floor', label: 'Floor', sortable: true },
    { key: 'price', label: 'Price', type: 'currency', align: 'start', formatter: (room) => `${Number(room.price || 0).toLocaleString()} Tsh` },
    { key: 'status', label: 'Status', type: 'status', sortable: true, statusClass: (status) => this.getRoomStatusClass(status) },
  ];

  roomActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary', visible: () => this.canEdit() },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: () => this.canDelete() },
  ];

  constructor(private api: ApiService, private toast: ToastService, private permission: PermissionService) {}

  ngOnInit(): void {
    this.loadRoomTypes();
    this.loadRooms();
  }

  loadRoomTypes(): void {
    this.api.getRoomTypes().subscribe({
      next: (data: any) => {
        this.roomTypes = data.filter((rt: any) => rt.isActive !== false);
        if (this.roomTypes.length > 0 && !this.form.type) {
          this.form.type = this.roomTypes[0].name.toLowerCase();
        }
      },
    });
  }

  loadRooms(): void {
    this.api.getRooms({ status: this.filterStatus }).subscribe({
      next: (data: any) => {
        this.rooms = data;
        this.currentPage = 1;
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onRoomTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.editRoom(event.row);
    if (event.action === 'delete') this.deleteRoom(event.row.id);
  }

  getRoomStatusClass(status: string): string {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'warning';
      case 'maintenance':
      case 'dirty':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  openModal(): void {
    this.editing = false;
    this.numberOfRooms = 1;
    this.imageUrls = [{ url: '', file: null }];
    const defaultType = this.roomTypes.length > 0 ? this.roomTypes[0].name.toLowerCase() : '';
    this.form = { roomNumber: '', type: defaultType, floor: 1, price: 0, status: 'available', description: '', imageUrl: '', images: [] };
    this.showModal = true;
  }

  editRoom(room: any): void {
    this.editing = true;
    this.editingId = room.id;
    this.form = { ...room };
    const existing: string[] = Array.isArray(room.images) && room.images.length > 0
      ? room.images
      : (room.imageUrl ? [room.imageUrl] : []);
    this.imageUrls = existing.length > 0 ? existing.map((u: string) => ({ url: u, file: null })) : [{ url: '', file: null }];
    this.showModal = true;
  }

  addImageUrl(): void {
    this.imageUrls.push({ url: '', file: null });
  }

  removeImageUrl(i: number): void {
    if (this.imageUrls.length > 1) this.imageUrls.splice(i, 1);
  }

  onImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.warning('Invalid File', 'Please select an image file.');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrls[index] = { url: reader.result as string, file };
    };
    reader.readAsDataURL(file);
  }

  resolveImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  }

  closeModal(): void {
    this.showModal = false;
  }

  generateRoomNumbers(start: string, count: number): string[] {
    const numbers: string[] = [];
    const match = start.match(/^([A-Za-z-]*)([0-9]+)$/);
    if (match) {
      const prefix = match[1];
      const num = parseInt(match[2], 10);
      const padLen = match[2].length;
      for (let i = 0; i < count; i++) {
        numbers.push(prefix + String(num + i).padStart(padLen, '0'));
      }
    } else {
      for (let i = 0; i < count; i++) {
        numbers.push(i === 0 ? start : `${start}-${i + 1}`);
      }
    }
    return numbers;
  }

  private syncImages(): void {
    const urls = this.imageUrls.map(i => i.url).filter(u => u.trim());
    this.form.images = urls;
    this.form.imageUrl = urls[0] || '';
  }

  private uploadSelectedImages(): Promise<boolean> {
    const uploadTasks = this.imageUrls.map((image, index) => {
      if (!image.file || !image.url.startsWith('data:image/')) return Promise.resolve(true);
      return new Promise<boolean>((resolve) => {
        this.api.uploadRoomImage({ fileName: image.file?.name, dataUrl: image.url }).subscribe({
          next: (res: any) => {
            this.imageUrls[index] = { url: res.url, file: null };
            resolve(true);
          },
          error: (err: any) => {
            this.toast.error('Upload Failed', err.error?.message || 'Image upload failed');
            resolve(false);
          },
        });
      });
    });

    this.uploadingImages = true;
    return Promise.all(uploadTasks).then(results => {
      this.uploadingImages = false;
      return results.every(Boolean);
    });
  }

  async saveRoom(): Promise<void> {
    const uploaded = await this.uploadSelectedImages();
    if (!uploaded) return;
    this.syncImages();
    if (this.editing) {
      this.api.updateRoom(this.editingId, this.form).subscribe({
        next: () => { this.closeModal(); this.loadRooms(); this.toast.success('Updated', 'Room updated successfully'); },
        error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving room'),
      });
      return;
    }

    if (this.numberOfRooms <= 1) {
      this.api.createRoom(this.form).subscribe({
        next: () => { this.closeModal(); this.loadRooms(); this.toast.success('Created', 'Room created successfully'); },
        error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving room'),
      });
    } else {
      const roomNumbers = this.generateRoomNumbers(this.form.roomNumber, this.numberOfRooms);
      const roomsPayload = roomNumbers.map(rn => ({
        roomNumber: rn,
        type: this.form.type,
        floor: this.form.floor,
        price: this.form.price,
        description: this.form.description,
        imageUrl: this.form.imageUrl,
        images: this.form.images,
        status: 'available',
      }));
      this.api.createBulkRooms(roomsPayload).subscribe({
        next: (res: any) => { this.closeModal(); this.loadRooms(); this.toast.success('Created', res.message || `${this.numberOfRooms} rooms created`); },
        error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error creating rooms'),
      });
    }
  }

  deleteRoom(id: number): void {
    this.deleteRoomId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteRoomId) {
      this.api.deleteRoom(this.deleteRoomId).subscribe({ next: () => { this.loadRooms(); this.showConfirmDialog = false; this.deleteRoomId = null; } });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.deleteRoomId = null;
  }

  get roomTypeCounts(): { type: string; count: number }[] {
    const counts: Record<string, number> = {};
    this.rooms.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }

  get previewRoomNumbers(): string[] {
    if (!this.form.roomNumber || this.numberOfRooms <= 1) return [];
    return this.generateRoomNumbers(this.form.roomNumber, this.numberOfRooms);
  }

  canView(): boolean {
    return this.permission.canView('rooms');
  }

  canCreate(): boolean {
    return this.permission.canCreate('rooms');
  }

  canEdit(): boolean {
    return this.permission.canEdit('rooms');
  }

  canDelete(): boolean {
    return this.permission.canDelete('rooms');
  }
}
