import { Pipe, PipeTransform } from '@angular/core';
import { TaskPriority } from '../../core/models/task.model';

@Pipe({
  name: 'taskPriority'
})
export class TaskPriorityPipe implements PipeTransform {
  transform(value: TaskPriority): string {
    switch (value) {
      case TaskPriority.LOW:
        return 'Low';
      case TaskPriority.MEDIUM:
        return 'Medium';
      case TaskPriority.HIGH:
        return 'High';
      default:
        return value;
    }
  }
}
