import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TodoCreatorComponent } from './todo-creator/todo-creator.component';
import { TimeTrackerComponent } from './time-tracker/time-tracker.component';

export const routes: Routes = [
    {
        path: 'time-tracker',
        component: TimeTrackerComponent,
    },
    {
        path: 'todo-creator',
        component: TodoCreatorComponent,
    }
];
