import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  stats: any = {
    totalRooms: 0, availableRooms: 0, occupiedRooms: 0, occupancyRate: 0,
    totalCustomers: 0, activeBookings: 0, monthlyRevenue: 0,
  };
  recentBookings: any[] = [];
  loadingError: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboardStats().subscribe({
      next: (data: any) => this.stats = data,
      error: (err: any) => {
        console.error('Failed to load stats', err);
        this.loadingError = 'Failed to load dashboard statistics. Please check if the backend server is running.';
      },
    });

    this.api.getRecentBookings().subscribe({
      next: (data: any) => this.recentBookings = data,
      error: (err: any) => console.error('Failed to load bookings', err),
    });
  }
}
