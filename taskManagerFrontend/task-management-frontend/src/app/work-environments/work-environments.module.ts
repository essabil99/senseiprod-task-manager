import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkEnvironmentsRoutingModule } from './work-environments-routing.module';
import { WorkEnvironmentListComponent } from './work-environment-list.component';
import { WorkEnvironmentDetailComponent } from './work-environment-detail/work-environment-detail.component';
import { WorkEnvironmentFormComponent } from './work-environment-form/work-environment-form.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    WorkEnvironmentListComponent,
    WorkEnvironmentDetailComponent,
    WorkEnvironmentFormComponent
  ],
  imports: [
    CommonModule,
    WorkEnvironmentsRoutingModule,
    SharedModule
  ]
})
export class WorkEnvironmentsModule { }
