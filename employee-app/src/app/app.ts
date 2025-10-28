import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {translations} from './shared/common/translations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = translations['APP_TITLE'];
}
