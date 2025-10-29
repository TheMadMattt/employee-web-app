import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notification-container',
  imports: [],
  templateUrl: './notification-container.html',
  styleUrl: './notification-container.scss'
})
export class NotificationContainer {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications$;

  onClose(id: number): void {
    this.notificationService.remove(id);
  }
}
