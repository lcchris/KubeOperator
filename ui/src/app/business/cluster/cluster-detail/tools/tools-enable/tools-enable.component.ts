import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {KubernetesService} from '../../../kubernetes.service';
import {ClusterTool} from '../tools';
import {V1StorageClass} from '@kubernetes/client-node';
import {NgForm} from '@angular/forms';
import {Cluster} from '../../../cluster';
import {ToolsService} from '../tools.service';
import {EsIndexPattern, EsIndexPatternHelper} from './../../../../../constant/pattern';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-tools-enable',
    templateUrl: './tools-enable.component.html',
    styleUrls: ['./tools-enable.component.css']
})
export class ToolsEnableComponent implements OnInit {

    constructor(private kubernetesService: KubernetesService,
                private toolsService: ToolsService,
                private translateService: TranslateService
    ) {}
    esIndexPattern = EsIndexPattern;
    esIndexPatternHelper = EsIndexPatternHelper;
    opened = false;
    isSubmitGoing = false;
    nodeNum = 0;
    isAlertShow = false;
    alertMsg = '';
    item: ClusterTool = new ClusterTool();
    storageClazz: V1StorageClass[] = [];
    @ViewChild('itemForm') itemForm: NgForm;
    @Output() enabled = new EventEmitter();
    @Input() currentCluster: Cluster;


    ngOnInit(): void {
    }

    onSubmit() {
        this.checkIsCorrect();
        if (!this.isAlertShow) {
            this.toolsService.enable(this.currentCluster.name, this.item).subscribe(data => {
                this.opened = false;
                this.enabled.emit();
            });
        }
    }
    checkIsCorrect() {
        if (this.item.name === 'logging') {
            if (this.item.vars['elasticsearch.replicas'] > this.nodeNum) {
                this.isAlertShow = true;
                this.alertMsg = this.translateService.instant('APP_EFK_CREATE_REPLICAS');
                return;
            }
            if (this.item.vars['elasticsearch.esJavaOpts[0]'] < this.item.vars['elasticsearch.esJavaOpts[1]']) {
                this.isAlertShow = true;
                this.alertMsg = this.translateService.instant('APP_EFK_CREATE_HEAP');
                return;
            }
            this.isAlertShow = false;
        }
    }
    onCancel() {
        this.opened = false;
    }

    reset() {
        this.itemForm.resetForm();
        this.listStorageClass();
    }

    open(item: ClusterTool) {
        this.nodeNumGet();
        this.reset();
        this.opened = true;
        this.setDefaultVars(item);
        this.item = item;
    }

    listStorageClass() {
        this.kubernetesService.listStorageClass(this.currentCluster.name, '', true).subscribe(data => {
            this.storageClazz = data.items;
        });
    }
    nodeNumGet() {
        this.kubernetesService.listNodes(this.currentCluster.name).subscribe(data => {
            this.nodeNum = data.items.length;
        });
    }

    setDefaultVars(item: ClusterTool) {
        switch (item.name) {
            case 'prometheus':
                item.vars = {
                    'server.retention': 10,
                    'server.persistentVolume.enabled': false,
                    'server.persistentVolume.size': 10,
                    'server.persistentVolume.storageClass': '',
                };
                break;
            case 'chartmuseum':
                item.vars = {
                    'persistence.enabled': false,
                    'env.open.DISABLE_API': false,
                    'persistence.storageClass': '',
                    'persistence.size': 10,
                };
                break;
            case 'registry':
                item.vars = {
                    'persistence.enabled': false,
                    'persistence.storageClass': '',
                    'service.type': 'NodePort',
                    'persistence.size': 10,
                };
                break;
            case 'logging':
                item.vars = {
                    'elasticsearch.esJavaOpts[0]': 1,
                    'elasticsearch.esJavaOpts[1]': 1,
                    'elasticsearch.replicas': 1,
                    'elasticsearch.persistence.enabled': false,
                    'elasticsearch.volumeClaimTemplate.resources.requests.storage': 10,
                    'elasticsearch.volumeClaimTemplate.storageClassName': '',
                };
                break;
            case 'kubeapps':
                item.vars = {
                    'postgresql.persistence.enabled': false,
                    'postgresql.persistence.size': 10,
                    'global.storageClass': ''
                };
                break;
            case 'dashboard':
                item.vars = {};
                break;
        }
    }

}
