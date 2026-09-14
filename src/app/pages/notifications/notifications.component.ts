import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getNotifications().subscribe({ next: (data: any) => {
      this.notifications = data;
      this.unreadCount = data.filter((n: any) => !n.isRead).length;
    }});
  }

  markRead(n: any): void {
    if (n.isRead) return;
    this.api.markNotificationRead(n.id).subscribe({ next: () => { n.isRead = true; this.unreadCount--; } });
  }

  markAllRead(): void {
    this.api.markAllNotificationsRead().subscribe({ next: () => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    }});
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'booking': 'bi-calendar-check',
      'cancellation': 'bi-x-circle',
      'payment': 'bi-credit-card',
      'extension': 'bi-calendar-plus',
      'short-stay': 'bi-clock-history',
      'check-in': 'bi-box-arrow-in-right',
      'check-out': 'bi-box-arrow-right',
    };
    return icons[type] || 'bi-bell';
  }
}
