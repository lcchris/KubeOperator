import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, Subject} from 'rxjs';
import {Log} from './log';
import {Execution} from '../deploy/component/operater/execution';


const baseUrl = '/api/v1/clusters/{clusterName}/executions/';

export class TaskLog {
  data: string;
  end: false;
  mark: string;
}

@Injectable()
export class LogService implements OnInit {


  constructor(private http: HttpClient) {

  }

  ngOnInit(): void {

  }

  listExecutions(clusterName): Observable<Execution[]> {
    return this.http.get<Execution[]>(`${baseUrl.replace('{clusterName}', clusterName)}`);
  }

  getExecution(clusterName, executionId): Observable<Execution> {
    return this.http.get<Execution>(`${baseUrl.replace('{clusterName}', clusterName)}` + executionId);
  }

  getExecutionLog(url): Observable<TaskLog> {
    return this.http.get<TaskLog>(url);
  }

}
