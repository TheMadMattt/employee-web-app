import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private nextId = 1;

  readonly notifications$ = this.notifications.asReadonly();

  show(message: string, type: NotificationType = 'info', duration: number = 3000): void {
    const notification: Notification = {
      id: this.nextId++,
      message,
      type
    };

    this.notifications.update(current => [...current, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: number): void {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }

  confirm(message: string): boolean {
    return confirm(message);
  }
}
