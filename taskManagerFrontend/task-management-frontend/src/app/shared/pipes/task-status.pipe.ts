import { Pipe, PipeTransform } from '@angular/core';
import { TaskStatus } from '../../core/models/task.model';

@Pipe({
  name: 'taskStatus'
})
export class TaskStatusPipe implements PipeTransform {
  transform(value: TaskStatus): string {
    switch (value) {
      case TaskStatus.TODO:
        return 'To Do';
      case TaskStatus.PENDING:
        return 'In Progress';
      case TaskStatus.DONE:
        return 'Completed';
      default:
        return value;
    }
  }
}
