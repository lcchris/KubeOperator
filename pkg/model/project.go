package model

import (
	"errors"
	"github.com/KubeOperator/KubeOperator/pkg/constant"
	"github.com/KubeOperator/KubeOperator/pkg/db"
	"github.com/KubeOperator/KubeOperator/pkg/model/common"
	uuid "github.com/satori/go.uuid"
)

var (
	DefaultProjectCanNotDelete = "DEFAULT_PROJECT_CAN_NOT_DELETE"
	ProjectHasClusterError     = "PROJECT_HAS_CLUSTER"
)

type Project struct {
	common.BaseModel
	ID          string    `json:"id" gorm:"type:varchar(64)"`
	Name        string    `json:"name" gorm:"type:varchar(64);not null;unique"`
	Description string    `json:"description" gorm:"type:varchar(128)"`
	Clusters    []Cluster `json:"clusters"`
}

func (p *Project) BeforeCreate() (err error) {
	p.ID = uuid.NewV4().String()
	return err
}

func (p *Project) BeforeDelete() (err error) {
	if p.Name == constant.DefaultResourceName {
		return errors.New(DefaultProjectCanNotDelete)
	}
	var projectResources []ProjectResource
	err = db.DB.Model(ProjectResource{}).Where(ProjectResource{ProjectID: p.ID, ResourceType: constant.ResourceCluster}).Find(&projectResources).Error
	if err != nil {
		return err
	}
	if len(projectResources) > 0 {
		return errors.New(ProjectHasClusterError)
	}
	return err
}

func (p Project) TableName() string {
	return "ko_project"
}
