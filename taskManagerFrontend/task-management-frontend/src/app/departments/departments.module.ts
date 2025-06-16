import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepartmentsRoutingModule } from './departments-routing.module';
import { DepartmentListComponent } from './department-list/department-list.component';
import { DepartmentDetailComponent } from './department-detail/department-detail.component';
import { DepartmentFormComponent } from './department-form/department-form.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DepartmentListComponent,
    DepartmentDetailComponent,
    DepartmentFormComponent
  ],
  imports: [
    CommonModule,
    DepartmentsRoutingModule,
    SharedModule
  ]
})
export class DepartmentsModule { }
