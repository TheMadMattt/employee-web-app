import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {translations} from './shared/common/translations';
import {NotificationContainer} from './shared/components/notification-container/notification-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = translations['APP_TITLE'];
}
