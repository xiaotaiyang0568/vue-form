import scClient from './sc_client.js'
const ParamType = {
  Cell: 1, // 细胞/样本
  Gene: 2, // 基因
  ToolVectorLV: 3, // 载体（慢病毒）
  Antibody: 4, // 抗体
  VirusPlasmid: 5, // 病毒/质粒
  CheckPoint: 6, // 检测时间点
  Drug: 7, // 药物
  LowOxygen: 8, // 缺氧处理
  Grouping: 9, // 分组
  VirusPackageSpec: 10, // 病毒包装规格
  DataComparingGroup: 11, // 数据比较分组
  Additional: 12, // 备注说明
  RPLevel: 13, // RP分级数
  PartAToProvide: 15, // 甲方提供实物
  ResearchDirection: 16, // 研究方向
  Locus: 17, // 位点信息（一代测序）
  SegmentPerSample: 18, // 单个样本片断数
  MouseType: 19, // 小鼠类型
  TumorModel: 20, // 肿瘤模型
  MouseCountPerGroupPreExperiment: 21, // 预实验每组鼠只数
  MouseCountPerGroupFormalExperiment: 22, // 正式实验每组鼠只数
  FeedingDrug: 23, // 裸鼠给药信息
  LiveImaging: 24, // 活体成像信息
  MouseDelivery: 25, // 裸鼠产物发货信息
  ToolVectorAV: 26, // 载体（腺病毒）
  ToolVectorTransfection: 27, // 载体（转染）
  GeneMassArray: 28, // 基因（massarray)
  SampleMassArray: 29, // 样本（massarray）
  GeneCas9KI: 30, // 基因（Cas9 KI）
  KitImmune: 31, // 试剂盒信息（免疫）
  KitByCustomerImmune: 32, // 甲方提供试剂信息（免疫）
  KitMiRNA: 33, // 试剂盒信息（miRNA）
  KitByCustomerMiRNA: 34, // 甲方提供试剂信息（miRNA）
  GeneInfoHCS: 35, // 基因信息（HCS）
  Cell_Proliferation: 36, // 细胞信息（增值）
  Cell_Transwell: 37, // 细胞信息（转移）
  RatInfo: 38, // 鼠信息
  BreedingPlan: 39, // 鼠繁育
  GeneEditRat: 40, // 基因信息（编辑鼠）
  ConstructionInfo: 41, // 构建信息
  ResuscitationInfo: 42, // 复苏信息
  StockInfo: 43, // 现货信息
  GenecardNo: 44, // Genecard流水号
  ResearchArea: 45, // 研究领域
  Type: 46, // 类型
  GeneListHCS: 47, // 基因列表（HCS）
  LUCGrouping: 48, // 分组（LUC）
  StableStrainDelivery: 49, // 稳定株细胞发货
  ChipType: 50, // 芯片类型
  BioAnalysisSet: 51, // 生信分析套系
  ChipTax: 52, // 芯片物种
  WBVerificationGene: 53, // WB验证基因数
  Cas9StableStrainConstruction: 54, // CAS9稳定株构建
  ProteomicsGroupings: 55 // 样本分组
}

const ParamAttrType = {
  None: -1,
  Number: 1, // 整数
  Text: 2, // 文本
  // Enum: 3, // 枚举
  List: 3, // 列表
  Check: 4, // 多选
  Radio: 5, // 单选
  Input: 6, // 单行文本
  Group: 7, // 组
  GeneList: 8, // 基因列表
  Search: 9, // 搜索
  Display: 10, // 展示信息
  Object: 11, // 对象
  SerialNoList: 12, // 字符串列表
  CellList: 13, // 细胞列表
  MouseTable: 14, // 裸鼠产物发货
  VirusPlasmidList: 15, // 乙方提供病毒／质粒列表
  CheckList: 16, // 多选列表
  Date: 17, // 年月
  AntibodyList: 18, // 抗体列表
  Result: 20
}

const ParamAttrDataType = {
  Number: 1, // 整数
  String: 2, // 文本
  Array: 3, // 枚举
  Obj: 4, // 列表
  Group: 5
}

const createMetaType = {
  notForValue: 1, // 保存前创建attrs
  forValue: 2, // 保存后--> 为value创建attrs
  inComponent: 3 // 在组件内创建attrs
}

const Position = {
  Header: 1,
  Description: 2,
  Content: 3,
  Detail: 4,
  Extra: 5
}

const BooleanContent = [{
  dictKey: true,
  dictValue: '是',
  sortCode: 10,
  typeID: -1,
  valid: 1
}, {
  dictKey: false,
  dictValue: '否',
  sortCode: 10,
  typeID: -1,
  valid: 1
}]

const CellInfoHCS = {
  Increment: 1, // 增值
  Transfer: 2 // 转移
}

const DictIds = {
  MerchandiseStatusType: 52001, // 52001 ---》 字典中服务类商品的状态
  OperationType: 52002,

  Boolean: -1, //  是否 Boolean 型
  BooleanType: 52004, // 是否
  VirusSpec: 52005, // 病毒包装规格

  PartAToProvide: 52007,
  CellType: { // 细胞类型
    Cell: 52008, // 细胞或样本
    CellProliferation: 52040, // 细胞信息（增殖）
    CellTranswell: 52041 // 细胞信息（转移）
  },

  Provider: 52013,

  ToolVectorType: {
    LV: 52017, // 载体类型（慢病毒）
    AV: 52018, // 载体类型（腺病毒）
    Transfection: 52019 // 载体类型（转染）
  },
  VirusType: 52020, // 病毒或质粒
  TumorType: 52021, // 肿瘤类型
  MouseType: 52022, // 小鼠类型
  TumorModel: 52023, // 肿瘤模型
  DrugMethod: 52025, // 给药方式
  ImagingMethod: 52026, // 成像方式
  Storage: 52027, // 产物保存方式
  BloodCollection: 52028, // 采血
  Consequence: 52037, // 基因（鼠编辑）=》结果
  LineSource: 52003, // 品系来源
  OperationMode: 52036, // 操作方式
  Tax: { // 物种
    SourceOrganism: 52009, // 样本、基因（massarray）
    GeneOrGeneCas9: 52044, // 基因、基因（Cas9 KI）
    KitImmune: 52029, // 试剂盒信息（免疫）
    KitMiRNA: 52031, // 试剂盒信息（miRNA）
    MouseInfo: 52035, // 鼠信息
    GeneInfoHCS: 52031 // 基因信息（HCS）
  },
  FactorType: { // 因子类型
    KitImmune: 52030, // 试剂盒信息（免疫）
    KitMiRNA: 52032 // 试剂盒信息（miRNA）
  },
  Type: 52034, // 类型

  GeneType: 52038, // 基因信息（HCS）=》基因类型

  TypeConst: 52042, // 类型=>构建信息
  ResuscitationType: 52043, // 复苏信息

  DeliveryTumor: 52045, // 产物发货-》肿瘤
  AntibodyProvider: 52046, // 抗体提供方,
  GroupingTypes: 52047, // 分组（LUC）=》类型
  StableStrainDelivery: 52048, // 稳定株细胞发货
  ChipType: 52006, // 芯片类型
  BioAnalysisSet: 52049, // 生信分析套系
  WBVerificationGene: 52010, // WB验证基因数
  ChipTax: 52011, // 芯片物种
  Mode: 52052 // genecardNo或种子待筛
}

const GroupingTypes = {
  Unconfirmed: 0, // 尚未指定
  WildMutation: 1, // 1->野生突变型
  Promoter: 2, // 2->启动子
  UserDefined: 3 // 3->自定义
}

const ExtraInfo = {
  ExtraSourceOrganism: 20, // 物种来源--其它
  ExtraMouseType: 5, // 小鼠类型--其它
  ExtraStorage: 3, // 产物保存方式--其它
  ExtraTumorType: 200, // 研究领域肿瘤类型--其它
  ExtraCellInfo: 200, // 细胞信息=》细胞类型--其它
  ExtraResuscitationType: 2, // 复苏类型--乙方品系
  ExtraBoolean: 1, // 是否缺氧处理--是
  Mode: {GenecardNo: 1, ExtraInfo: 2}
}

const Provider = {
  PartA: 1,
  PartB: 2
}

const KitType = {
  KitImmune: 1, // 试剂盒信息（免疫）
  KitMiRNA: 2 // 试剂盒信息（miRNA）
}

const CellLineKey = {
  key: 1,
  label: '细胞系'
} // 52008细胞类型:1-->细胞系

const ParamMeta = {
  [ParamType.Cell]: { // BSMBusinessParamCellPlusSample
    attrs: {
      partACells: {
        label: '甲方提供细胞',
        type: ParamAttrType.List,
        list: {
          provider: {
            label: '',
            value: Provider.PartA
          },
          cellName: {
            label: '细胞名称',
            type: ParamAttrType.Input,
            placeholder: '请填写'
          },
          cellType: {
            label: '细胞类型',
            type: ParamAttrType.Radio,
            enumId: DictIds.CellType.Cell,
            row: true
          }
        }
      },
      partBCells: {
        label: '乙方提供细胞',
        type: ParamAttrType.CellList,
        list: {
          cellGuid: {
            label: '',
            getDetail: function (params, callback) {
              getDetailForDisplay('loadCellPartBProvideDetail', params, callback)
            }
          },
          cellName: {
            label: '细胞名称',
            position: Position.Header
          },
          sourceSpeciesName: {
            label: '物种',
            position: Position.Description,
            row: true
          },
          cellType: {
            label: '细胞类型',
            position: Position.Extra,
            cell: CellLineKey
          }
        }
      },
      partASamples: {
        label: '甲方提供样本',
        type: ParamAttrType.List,
        list: {
          tax: {
            label: '物种',
            type: ParamAttrType.Radio,
            enumId: DictIds.Tax.SourceOrganism,
            row: true,
            position: Position.Header
          },
          attrsGroup: {
            type: ParamAttrType.Group,
            show_if: function (attr, index, attributes, attributesMap) {
              return attributesMap.tax === ExtraInfo.ExtraSourceOrganism
            },
            attrs: {
              taxExtra: {
                label: '',
                type: ParamAttrType.Input,
                placeholder: '请填写'
              }
            }
          },
          provider: {
            label: '',
            value: Provider.PartA
          },
          sampleName: {
            label: '样本名称',
            type: ParamAttrType.Input,
            position: Position.Description,
            placeholder: '请填写'
          },
          quantity: {
            label: '样本数量',
            type: ParamAttrType.Number,
            position: Position.Description
          }
        }
      },
      partBSamples: {
        label: '乙方提供样本',
        type: ParamAttrType.List,
        list: {
          tax: {
            label: '物种',
            type: ParamAttrType.Radio,
            enumId: DictIds.Tax.SourceOrganism,
            row: true,
            position: Position.Header
          },
          attrsGroup: {
            type: ParamAttrType.Group,
            show_if: function (attr, index, attributes, attributesMap) {
              return attributesMap.tax === ExtraInfo.ExtraSourceOrganism
            },
            attrs: {
              taxExtra: {
                label: '',
                type: ParamAttrType.Input,
                placeholder: '请填写'
              }
            }
          },
          provider: {
            label: '',
            value: Provider.PartB
          },
          sampleName: {
            label: '样本名称',
            type: ParamAttrType.Input,
            position: Position.Description,
            placeholder: '请填写'
          },
          quantity: {
            label: '样本数量',
            type: ParamAttrType.Number,
            position: Position.Description
          }
        }
      }
    }
  },
  [ParamType.Gene]: { // BSMBusinessParamGene
    attrs: {
      businessParamGeneTargetList: {
        label: '目的基因',
        type: ParamAttrType.GeneList,
        list: {
          symbol: {
            label: '基因名',
            position: Position.Header
          },
          geneID: {
            label: '基因ID',
            position: Position.Description
          },
          NMID: {
            label: 'Bank ID',
            position: Position.Extra
          },
          taxId: {
            label: '物种',
            type: ParamAttrType.Radio,
            enumId: DictIds.Tax.GeneOrGeneCas9,
            position: Position.Description,
            row: true
          },
          geneGuid: {
            label: ''
          },
          geneUsage: {
            label: '',
            value: 1
          }
        }
      },
      businessParamGeneDownList: {
        label: '下游基因',
        type: ParamAttrType.GeneList,
        list: {
          symbol: {
            label: '基因名',
            type: ParamAttrType.Input,
            position: Position.Header,
            placeholder: '请填写'
          },
          geneID: {
            label: '基因ID',
            type: ParamAttrType.Input,
            position: Position.Description,
            placeholder: '请填写'
          },
          NMID: {
            label: 'Bank ID',
            position: Position.Extra
          },
          taxId: {
            label: '物种',
            type: ParamAttrType.Radio,
            enumId: DictIds.Tax.GeneOrGeneCas9,
            position: Position.Description,
            row: true
          },
          geneGuid: {
            label: ''
          },
          geneUsage: {
            label: '',
            value: 2
          }
        }
      }
    }
  },
  [ParamType.ToolVectorLV]: { // BSMBusinessParamToolVectorLV
    attrs: {
      type: {
        type: ParamAttrType.Radio,
        enumId: DictIds.ToolVectorType.LV,
        default: 1 // 默认选中第一个
      }
    }
  },
  [ParamType.StableStrainDelivery]: { // BSMBusinessParamStableStrainDelivery
    attrs: {
      stableStrainDeliveries: {
        type: ParamAttrType.CheckList,
        enumId: DictIds.StableStrainDelivery,
        keyAttrName: 'type',
        list: {
          type: {
            label: '',
            type: ParamAttrType.Radio,
            enumId: DictIds.StableStrainDelivery,
            row: true
          },
          quantity: {
            label: '数量',
            type: ParamAttrType.Number,
            default: 2 // 缺省2支
          }
        }
      }
    }
  },
  [ParamType.Antibody]: { // BSMBusinessParamAntibody
    attrs: {
      businessParamAntibodyPartAList: {
        label: '',
        type: ParamAttrType.CheckList,
        enumId: DictIds.AntibodyProvider,
        keyAttrName: 'provider',
        list: {
          provider: {
            label: ''
          },
          antibodyComment: {
            type: ParamAttrType.Input,
            placeholder: '流水号+抗体预实验合同号（若有）'
          }
        }
      },
      businessParamAntibodyPartBList: {
        label: '',
        type: ParamAttrType.AntibodyList,
        list: {
          antibodyGuid: {
            label: '',
            getDetail: function (params, callback) {
              getDetailForDisplay('loadBSMBAntiBodyDetail', params, callback)
            }
          },
          antibodyNo: {
            label: '抗体编号',
            position: Position.Header
          },
          geneID: {
            label: '基因ID',
            position: Position.Description
          },
          tax_Name: {
            label: '物种',
            position: Position.Description
          },
          globulinName: {
            label: '蛋白名',
            position: Position.Extra
          },
          symbol: {
            label: ''
          }
        }
      }
    }
  },
  [ParamType.VirusPlasmid]: { // BSMBusinessParamVirusPlasmid
    attrs: {
      useVirusPlasmidOrNot: {
        label: '是否使用病毒/质粒',
        type: ParamAttrType.Radio,
        enumId: DictIds.Boolean,
        default: false, // 2->否
        row: true, // 一行显示
        validate: 'not null'
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.useVirusPlasmidOrNot === true
        },
        attrs: {
          partAList: {
            label: '甲方提供',
            type: ParamAttrType.List,
            validate: 'if add, then not null',
            list: {
              provider: {
                label: '',
                value: Provider.PartA
              },
              type: {
                label: '类型',
                type: ParamAttrType.Radio,
                enumId: DictIds.VirusType,
                row: true
              },
              serialNo: {
                label: '流水号',
                type: ParamAttrType.Input,
                placeholder: '请填写'
              }
            }
          },
          partBList: {
            label: '乙方提供',
            type: ParamAttrType.VirusPlasmidList,
            validate: 'if add, then not null',
            list: {
              provider: {
                label: '',
                value: Provider.PartB
              },
              contractNo: {
                label: '合同编号',
                position: Position.Header,
                getDetail: function (params, callback) {
                  getDetailForDisplay('loadBSMBVirusPlasmidDetail', params, callback)
                }
              },
              type: {
                label: '类型',
                type: ParamAttrType.Radio,
                enumId: DictIds.VirusType,
                row: true,
                position: Position.Extra
              },
              validTargetNo: {
                label: '有效靶点编号',
                type: ParamAttrType.Input,
                position: Position.Extra,
                placeholder: '请填写'
              }
            }
          }
        }
      }
    }
  },
  [ParamType.CheckPoint]: { // BSMBusinessParamCheckPoint
    attrs: {
      count: {
        type: ParamAttrType.Number,
        default: 1 // 缺省为 1
      },
      content: {
        type: ParamAttrType.Input
      }
    }
  },
  [ParamType.Drug]: { // BSMBusinessParamDrug
    attrs: {
      useDrugOrNot: {
        label: '是否使用药物',
        type: ParamAttrType.Radio,
        enumId: DictIds.Boolean,
        default: false, // 否
        row: true, // 一行显示
        validate: 'not null'
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.useDrugOrNot === true
        },
        attrs: {
          businessParamDrugList: {
            type: ParamAttrType.List,
            validate: 'if useDrugOrNot = true, then not null',
            list: {
              drugName: {
                label: '药物名称',
                type: ParamAttrType.Input,
                placeholder: '请填写'
              },
              provider: {
                label: '提供方',
                type: ParamAttrType.Radio,
                enumId: DictIds.Provider,
                row: true
              },
              solvent: {
                label: '药物溶剂',
                type: ParamAttrType.Input,
                placeholder: '请填写'
              },
              concentrationCount: {
                label: '药物处理浓度数',
                type: ParamAttrType.Number,
                placeholder: '请填写',
                default: 1
              },
              concentrationDetail: {
                label: '药物处理浓度信息',
                type: ParamAttrType.Text
              },
              treatmentTime: {
                label: '药物处理时间',
                type: ParamAttrType.Text
              },
              withdrawDrug: {
                label: '检测时是否撒药',
                type: ParamAttrType.Input
              }
            }
          }
        }
      }
    }
  },
  [ParamType.LowOxygen]: { // BSMBusinessParamLowOxygen
    attrs: {
      needLowOxygen: {
        label: '是否缺氧处理',
        type: ParamAttrType.Radio,
        enumId: DictIds.BooleanType,
        default: 2, // 2->否
        row: true // 一行显示
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.needLowOxygen === ExtraInfo.ExtraBoolean
        },
        attrs: {
          concentration: {
            label: '缺氧浓度(%)',
            type: ParamAttrType.Input,
            default: 2, // 缺省为2%
            validate: '' // default value -> 2 可为小数，百分号固定; v-show = "needLowOxygen === true"
          },
          inComment: {
            label: '缺氧处理时间', // v-show = "needLowOxygen === true"
            type: ParamAttrType.Input
          },
          outComment: {
            label: '复氧处理时间', // v-show = "needLowOxygen === true"
            type: ParamAttrType.Input
          }
        }
      }
    }
  },
  [ParamType.Grouping]: { // BSMBusinessParamGrouping
    attrs: {
      groupCount: {
        label: '分组',
        type: ParamAttrType.Number,
        default: 1 // 缺省为1
      },
      groupDetail: {
        type: ParamAttrType.Text,
        placeholder: '若各个实验项的分组不同，请分别说明'
      },
      repetitionCount: {
        label: '每组重复数',
        type: ParamAttrType.Number,
        default: 1 // 缺省为1
      },
      repetitionDetail: {
        type: ParamAttrType.Text,
        placeholder: '若各个实验项的重复数不同，请分别说明'
      }
    }
  },
  [ParamType.VirusPackageSpec]: { // BSMBusinessParamVirusPackageSpec
    attrs: {
      spec: {
        type: ParamAttrType.Radio,
        enumId: DictIds.VirusSpec,
        row: true,
        default: 1 // 默认选中第一个
      }
    }
  },
  [ParamType.DataComparingGroup]: { // BSMBusinessParamDataComparingGroup
    attrs: {
      businessParamDataComparingGroupList: {
        type: ParamAttrType.List,
        list: {
          experimentGroupName: {
            label: '实验组样品（名称／组名）',
            type: ParamAttrType.Input,
            placeholder: '请填写'
          },
          comparisonGroupName: {
            label: '对照组样品（名称／组名）',
            type: ParamAttrType.Input,
            placeholder: '请填写'
          }
        }
      }
    }
  },
  [ParamType.Additional]: { // BSMBusinessParamAdditional
    attrs: {
      content: {
        type: ParamAttrType.Text
      }
    }
  },
  [ParamType.RPLevel]: { // BSMBusinessParamRPLevel
    attrs: {
      RPLevel: {
        type: ParamAttrType.Number,
        default: 10, // 默认为10
        validate: 'default 10, not null'
      }
    }
  },
  [ParamType.PartAToProvide]: { // BSMBusinessParamPartAToProvide
    attrs: {
      materialItems: {
        type: ParamAttrType.CheckList, // if checked
        enumId: DictIds.PartAToProvide,
        keyAttrName: 'materialIndex',
        list: {
          materialIndex: {
            label: '',
            type: ParamAttrType.Check,
            enumId: DictIds.PartAToProvide
          },
          arrived: {
            label: '实物已到',
            type: ParamAttrType.Radio, // if add
            enumId: DictIds.BooleanType,
            row: true,
            default: 2 // 否
          },
          attrsGroup: {
            type: ParamAttrType.Group,
            show_if: function (attr, index, attributes, attributesMap) {
              return attributesMap.arrived === ExtraInfo.ExtraBoolean
            },
            attrs: {
              serialNos: {
                type: ParamAttrType.SerialNoList,
                getDetail: function (params, callback) {
                  getDetailForDisplay('loadPartAToProvideParamDataDetail', params, callback)
                },
                position: Position.Header
              }
            }
          }
        }
      }
    }
  },
  [ParamType.ResearchDirection]: { // BSMBusinessParamResearchDirection
    attrs: {
      businessParamResearchDirectionA: {
        type: ParamAttrType.Object,
        object: {
          nonTumor: {
            label: '非肿瘤',
            type: ParamAttrType.Input
          },
          direction: {
            label: '研究方向',
            type: ParamAttrType.Input
          }
        }
      },
      businessParamResearchDirectionBList: {
        type: ParamAttrType.List,
        enumId: DictIds.TumorType,
        list: {
          tumorType: {
            label: '肿瘤',
            type: ParamAttrType.Check
          }
        }
      }
    }
  },
  [ParamType.Locus]: { // BSMBusinessParamLocus
    attrs: {
      content: {
        type: ParamAttrType.Text
      }
    }
  },
  [ParamType.SegmentPerSample]: { // BSMBusinessParamSegmentPerSample
    attrs: {
      segmentPerSample: {
        type: ParamAttrType.Number,
        default: 1, // 缺省为1
        validate: 'default 1, not null'
      }
    }
  },
  [ParamType.MouseType]: { // BSMBusinessParamMouseType
    attrs: {
      mouseType: {
        type: ParamAttrType.Radio,
        enumId: DictIds.MouseType,
        default: 1 // 默认选中第一个
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.mouseType === ExtraInfo.ExtraMouseType
        },
        attrs: {
          other: {
            type: ParamAttrType.Input,
            validate: 'not null',
            placeholder: '请填写' // v-show if mouseType = other
          }
        }
      }
    }
  },
  [ParamType.TumorModel]: { // BSMBusinessParamTumorModel
    attrs: {
      tumorModel: {
        type: ParamAttrType.Radio,
        enumId: DictIds.TumorModel,
        default: 1 // 默认选中第一个
      }
    }
  },
  [ParamType.MouseCountPerGroupPreExperiment]: { // BSMBusinessParamMouseCountPerGroupPreExperiment
    attrs: {
      count: {
        type: ParamAttrType.Number, // default value -> 3
        default: 3 // 缺省为3
      }
    }
  },
  [ParamType.MouseCountPerGroupFormalExperiment]: { // BSMBusinessParamMouseCountPerGroupFormalExperiment
    attrs: {
      count: {
        type: ParamAttrType.Number, // default value -> 10
        default: 10 // 缺省为10
      }
    }
  },
  [ParamType.FeedingDrug]: { // BSMBusinessParamFeedingDrug
    attrs: {
      needDrug: {
        label: '是否给药',
        type: ParamAttrType.Radio,
        enumId: DictIds.BooleanType,
        default: 2, // 2->否
        row: true // 一行显示
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.needDrug === ExtraInfo.ExtraBoolean
        },
        attrs: {
          drugMethod: {
            label: '给药方式', // v-show needDrug = true ,not null
            type: ParamAttrType.Radio,
            enumId: DictIds.DrugMethod,
            default: 1 // 默认选中第一个
          },
          drugName: {
            label: '药物名称', // v-show needDrug = true ,not null
            type: ParamAttrType.Input
          },
          groupConcentration: {
            label: '分组，浓度及次数', // v-show needDrug = true ,not null
            type: ParamAttrType.Input
          }
        }
      }
    }
  },
  [ParamType.LiveImaging]: { // BSMBusinessParamLiveImaging
    attrs: {
      imagingMethod: {
        type: ParamAttrType.Radio,
        enumId: DictIds.ImagingMethod, // default -> none
        default: 1, // 1->无
        row: true
      }
    }
  },
  [ParamType.MouseDelivery]: { // BSMBusinessParamMouseDelivery
    attrs: {
      ifBloodCollections: {
        label: '采血',
        type: ParamAttrType.Radio,
        validate: 'if checked, show input box',
        enumId: DictIds.Boolean
      },
      attrsGroupBloodCollections: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.ifBloodCollections === true
        },
        attrs: {
          bloodCollections: {
            label: '采血', // v-show ifBloodCollections = true ,not null
            type: ParamAttrType.Radio,
            enumId: DictIds.BloodCollection
          }
        }
      },
      ifInternalOrganSelect: {
        label: '内脏',
        type: ParamAttrType.Radio,
        validate: 'if checked, show input box',
        enumId: DictIds.Boolean
      },
      attrsGroupInternalOrganSelect: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.ifInternalOrganSelect === true
        },
        attrs: {
          internalOrgan: {
            label: '内脏',
            type: ParamAttrType.Input,
            validate: 'if checked, show input box',
            placeholder: '请填写'
          }
        }
      },
      tumor: {
        label: '瘤体',
        type: ParamAttrType.Radio,
        enumId: DictIds.DeliveryTumor,
        default: 1 // 默认选中第一个
      },
      storage: {
        label: '产物保存方式',
        type: ParamAttrType.Radio,
        enumId: DictIds.Storage,
        default: 1, // 默认选中第一个
        row: true
      },
      attrsGroupStorage: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.storage === ExtraInfo.ExtraStorage
        },
        attrs: {
          storageComment: {
            type: ParamAttrType.Input,
            placeholder: '请填写'
          }
        }
      }
    }
  },
  [ParamType.ToolVectorAV]: { // BSMBusinessParamToolVectorAV
    attrs: {
      type: {
        type: ParamAttrType.Radio,
        enumId: DictIds.ToolVectorType.AV,
        default: 1 // 默认选中第一个
      }
    }
  },
  [ParamType.ToolVectorTransfection]: { // BSMBusinessParamToolVectorTransfection
    attrs: {
      type: {
        type: ParamAttrType.Radio,
        enumId: DictIds.ToolVectorType.Transfection,
        default: 1 // 默认选中第一个
      }
    }
  },
  [ParamType.GeneMassArray]: { // BSMBusinessParamGeneMassArray
    attrs: {
      RSID: {
        label: '位点名称（rs ID）',
        type: ParamAttrType.Input,
        validate: '非空',
        placeholder: '请填写'
      },
      otherLocusInfo: {
        label: '其他位点信息',
        type: ParamAttrType.Input,
        placeholder: '请填写'
      },
      tax: {
        label: '物种来源',
        type: ParamAttrType.Radio,
        enumId: DictIds.Tax.SourceOrganism,
        row: true,
        default: 1 // 默认选中第一个
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.tax === ExtraInfo.ExtraSourceOrganism
        },
        attrs: {
          taxExtra: {
            type: ParamAttrType.Input,
            validate: '', // 选其他时需输入框填写
            placeholder: '请填写'
          }
        }
      },
      diseaseInfo: {
        label: '疾病信息',
        type: ParamAttrType.Input,
        placeholder: '请填写'
      }
    }
  },
  [ParamType.SampleMassArray]: { // BSMBusinessParamSampleMassArray
    attrs: {
      preSampleNumber: {
        label: '预实验样本数目',
        type: ParamAttrType.Number,
        default: 1, // 缺省 1例
        validate: '>=1, （例）'
      },
      formalSampleNumber: {
        label: '正式实验样本数目',
        type: ParamAttrType.Number,
        default: 1, // 缺省 1例
        validate: '>=1, （例）'
      },
      locusNumber: {
        label: '检测位点总数',
        type: ParamAttrType.Number,
        default: 1, // 缺省 1个
        validate: '>=1, （个）'
      }
    }
  },
  [ParamType.GeneCas9KI]: { // BSMBusinessParamGene
    attrs: {
      businessParamGeneCAS9: {
        label: '',
        type: ParamAttrType.Object,
        validate: 'not null',
        object: {
          knockInSequence: {
            label: '敲入基因序列／编辑位点',
            type: ParamAttrType.Input,
            placeholder: '请填写'
          }
        }
      },
      businessParamGeneTargetList: {
        label: '目的基因',
        type: ParamAttrType.GeneList,
        list: {
          symbol: {
            label: '基因名',
            position: Position.Header
          },
          geneID: {
            label: '基因ID',
            position: Position.Description
          },
          NMID: {
            label: 'Bank ID',
            position: Position.Extra
          },
          taxId: {
            label: '物种',
            type: ParamAttrType.Radio,
            enumId: DictIds.Tax.GeneOrGeneCas9,
            position: Position.Description,
            row: true
          },
          geneGuid: {
            label: ''
          },
          geneUsage: {
            label: '',
            value: 1
          }
        }
      },
      businessParamGeneDownList: {
        label: '下游基因',
        type: ParamAttrType.GeneList,
        list: {
          symbol: {
            label: '基因名',
            position: Position.Header
          },
          geneID: {
            label: '基因ID',
            position: Position.Description
          },
          NMID: {
            label: 'Bank ID',
            position: Position.Extra
          },
          taxId: {
            label: '物种',
            type: ParamAttrType.Radio,
            enumId: DictIds.Tax.GeneOrGeneCas9,
            position: Position.Description,
            row: true
          },
          geneGuid: {
            label: ''
          },
          geneUsage: {
            label: '',
            value: 2
          }
        }
      }
    }
  },
  [ParamType.KitImmune]: { // BSMBusinessParamFirePlexKitImmune
    attrs: {
      tax: {
        label: '物种',
        type: ParamAttrType.Radio,
        enumId: DictIds.Tax.KitImmune,
        row: true,
        default: 1 // 1->人
      },
      firePlexKitList: {
        label: '因子类型',
        type: ParamAttrType.CheckList, // List
        enumId: DictIds.FactorType.KitImmune,
        keyAttrName: 'factorType',
        list: { // todo check + input
          factorType: {
            label: '',
            type: ParamAttrType.Radio,
            enumId: DictIds.Tax.KitImmune
          },
          wellCount: {
            label: '孔数',
            type: ParamAttrType.Number,
            default: 1,
            value: 1
          }
        }
      }
    }
  },
  [ParamType.KitByCustomerImmune]: { // BSMBusinessParamFirePlexKitByCustomerImmune
    attrs: {
      type: {
        label: '',
        type: ParamAttrType.None,
        default: KitType.KitImmune
      },
      plateNumber: {
        label: '板数',
        type: ParamAttrType.Number
      },
      hybridFactor: {
        label: '是否增加混合因子',
        type: ParamAttrType.Radio,
        enumId: DictIds.BooleanType,
        default: 2, // 2->否
        row: true // 一行显示
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.hybridFactor === ExtraInfo.ExtraBoolean
        },
        attrs: {
          antibodyCount: { // v-show hybridFactor = true ,not null
            label: '抗体数',
            type: ParamAttrType.Number
          },
          plateNumber2: { // v-show hybridFactor = true ,not null
            label: '板数',
            type: ParamAttrType.Number
          }
        }
      }
    }
  },
  [ParamType.KitMiRNA]: { // BSMBusinessParamFirePlexKitMiRNA
    attrs: {
      tax: {
        label: '物种',
        type: ParamAttrType.Radio,
        enumId: DictIds.Tax.KitMiRNA,
        row: true,
        default: 1 // 1->人
      },
      firePlexKitList: {
        label: '因子类型',
        type: ParamAttrType.CheckList, // List
        enumId: DictIds.FactorType.KitMiRNA,
        keyAttrName: 'factorType',
        list: { // todo check + input
          factorType: {
            label: '',
            type: ParamAttrType.Radio,
            enumId: DictIds.Tax.KitMiRNA
          },
          wellCount: {
            label: '孔数',
            type: ParamAttrType.Number,
            default: 1,
            value: 1
          }
        }
      }
    }
  },
  [ParamType.KitByCustomerMiRNA]: { // BSMBusinessParamFirePlexKitByCustomerMiRNA
    attrs: {
      type: {
        label: '',
        type: ParamAttrType.None,
        default: KitType.KitMiRNA
      },
      hybridFactor: {
        type: ParamAttrType.None,
        default: 2 // 2->否
      },
      plateNumber: {
        label: '板数',
        type: ParamAttrType.Number
      }
    }
  },
  [ParamType.GeneInfoHCS]: { // BSMBusinessParamGeneInfoHCS
    attrs: {
      tax: {
        label: '物种',
        type: ParamAttrType.Radio,
        enumId: DictIds.Tax.GeneInfoHCS,
        row: true,
        default: 1 // 1->人
      },
      geneType: {
        label: '基因类型',
        type: ParamAttrType.Radio,
        row: true,
        enumId: DictIds.GeneType
      }
    }
  },
  [ParamType.Cell_Proliferation]: { // BSMBusinessParamCellInfoHCSIncrement
    attrs: {
      cellType: {
        type: ParamAttrType.Radio,
        enumId: DictIds.CellType.CellProliferation
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.cellType === ExtraInfo.ExtraCellInfo
        },
        attrs: {
          cellOther: {
            type: ParamAttrType.Input,
            validate: '', // v-show, if cellType = other
            placeholder: '请填写'
          }
        }
      },
      type: {
        type: ParamAttrType.None,
        default: CellInfoHCS.Increment
      }
    }
  },
  [ParamType.Cell_Transwell]: { // BSMBusinessParamCellInfoHCSTransfer
    attrs: {
      cellType: {
        type: ParamAttrType.Radio,
        enumId: DictIds.CellType.CellTranswell
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.cellType === ExtraInfo.ExtraCellInfo
        },
        attrs: {
          cellOther: {
            type: ParamAttrType.Input,
            validate: '', // v-show, if cellType = other
            placeholder: '请填写'
          }
        }
      },
      type: {
        type: ParamAttrType.None,
        default: CellInfoHCS.Transfer
      }
    }
  },
  [ParamType.RatInfo]: { // BSMBusinessParamRatInfo
    attrs: {
      tax: {
        label: '物种',
        type: ParamAttrType.Radio,
        enumId: DictIds.Tax.MouseInfo,
        row: true
      },
      lineName: {
        label: '品系名称',
        type: ParamAttrType.Input
      },
      gene: {
        label: '基因',
        type: ParamAttrType.Input
      },
      lineSource: {
        label: '品系来源',
        type: ParamAttrType.Radio,
        enumId: DictIds.LineSource,
        row: true
      },
      operationMode: {
        label: '操作方式',
        type: ParamAttrType.Radio,
        enumId: DictIds.OperationMode
      },
      contractNo: {
        label: '合同号',
        type: ParamAttrType.Input,
        placeholder: '关联合同号（如有）'
      },
      duration: {
        label: '预计周期（天）',
        type: ParamAttrType.Number
      },
      dateStart: {
        label: '起始年月', // 起始年月
        type: ParamAttrType.Date,
        attrs: {
          yearStart: {
            label: '年',
            type: ParamAttrType.Number,
            validate: 'not null' // default current year
          },
          monthStart: {
            label: '月',
            type: ParamAttrType.Number,
            validate: 'not null' // default current month
          }
        }
      },
      dateEnd: {
        label: '终止年月', // 终止年月
        type: ParamAttrType.Date,
        attrs: {
          yearEnd: {
            label: '年',
            type: ParamAttrType.Number
          },
          monthEnd: {
            label: '月',
            type: ParamAttrType.Number
          }
        }
      },
      estimatedPrice: {
        label: '预估价格（元）',
        type: ParamAttrType.Number,
        validate: 'not null'
      }
    }
  },
  [ParamType.BreedingPlan]: { // BSMBusinessParamBreedingPlan
    attrs: {
      content: {
        type: ParamAttrType.Text
      }
    }
  },
  [ParamType.GeneEditRat]: { // BSMBusinessParamGeneEditRat
    attrs: {
      geneName: {
        label: '基因名称',
        type: ParamAttrType.Input,
        validate: 'not null',
        placeholder: '请填写'
      },
      geneID: {
        label: '基因ID',
        type: ParamAttrType.Input,
        validate: 'not null',
        placeholder: '请填写'
      },
      consequence: {
        label: '敲入／敲除是否会使小鼠死亡或不育',
        type: ParamAttrType.Radio,
        enumId: DictIds.Consequence,
        row: true,
        validate: 'not null'
      }
    }
  },
  [ParamType.ConstructionInfo]: { // BSMBusinessParamConstructionInfo
    attrs: {
      tax: {
        label: '物种',
        type: ParamAttrType.Radio,
        enumId: DictIds.Tax.MouseInfo,
        row: true
      }
    }
  },
  [ParamType.ResuscitationInfo]: { // BSMBusinessParamResuscitationInfo
    attrs: {
      tax: {
        label: '物种',
        type: ParamAttrType.Radio,
        enumId: DictIds.Tax.MouseInfo,
        row: true
      },
      resuscitationType: {
        label: '复苏类型',
        type: ParamAttrType.Radio,
        enumId: DictIds.ResuscitationType,
        row: true
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.resuscitationType === ExtraInfo.ExtraResuscitationType
        },
        attrs: {
          contractNoOrSeqNo: {
            label: '',
            type: ParamAttrType.Input,
            validate: '关联合同号／现货编号', // v-show , if resuscitationType = '乙方'， not null
            placeholder: '关联合同号／现货编号'
          }
        }
      }
    }
  },
  [ParamType.StockInfo]: { // BSMBusinessParamStockInfo
    attrs: {
      tax: {
        label: '物种',
        type: ParamAttrType.Radio,
        enumId: DictIds.Tax.MouseInfo,
        row: true
      },
      stockNo: {
        label: '现货编号',
        type: ParamAttrType.Input,
        validate: 'not null',
        placeholder: '请填写'
      }
    }
  },
  [ParamType.GenecardNo]: { // BSMBusinessParamGenecardNo
    attrs: {
      mode: {
        type: ParamAttrType.radio,
        enumId: DictIds.Mode,
        row: true
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.mode === ExtraInfo.Mode.GenecardNo
        },
        attrs: {
          genecardNo: {
            type: ParamAttrType.Input,
            placeholder: '请填写GenecardNo'
          },
          cellCancer: {
            type: ParamAttrType.None
          },
          geneCardFunction: {
            type: ParamAttrType.None
          },
          geneCardApplyStatus: {
            type: ParamAttrType.None
          },
          applyOperator: {
            type: ParamAttrType.None
          }
        }
      },
      attrsGroupExtraInfo: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.mode === ExtraInfo.Mode.ExtraInfo
        },
        attrs: {
          extraInfo: {
            type: ParamAttrType.Input,
            placeholder: '请填写癌肿信息'
          }
        }
      }
    }
  },
  [ParamType.ResearchArea]: { // BSMBusinessParamResearchArea
    attrs: {
      tumorType: {
        type: ParamAttrType.Radio,
        enumId: DictIds.TumorType
      },
      attrsGroup: {
        type: ParamAttrType.Group,
        show_if: function (attr, index, attributes, attributesMap) {
          return attributesMap.tumorType === ExtraInfo.ExtraTumorType
        },
        attrs: {
          other: {
            type: ParamAttrType.Input,
            validate: '', // 选择其他，必填
            placeholder: '请填写'
          }
        }
      }
    }
  },
  [ParamType.Type]: { // BSMBusinessParamGenecardType
    attrs: {
      typeIds: {
        type: ParamAttrType.Check,
        enumId: DictIds.Type
      }
    }
  },
  [ParamType.GeneListHCS]: { // BSMBusinessParamGeneList
    attrs: {
      // geneSourceText: {},
      geneListHCS: {
        type: ParamAttrType.List, // List
        list: {
          geneName: {
            label: '基因名称',
            type: ParamAttrType.Input,
            placeholder: '请填写'
          },
          refSeqID: {
            label: 'RefSeq ID',
            type: ParamAttrType.Input,
            placeholder: '请填写'
          }
        }
      }
    }
  },
  [ParamType.LUCGrouping]: { // BSMBusinessParamLUC
    attrs: {
      groupingType: {
        type: ParamAttrType.Radio,
        enumId: DictIds.GroupingTypes
      },
      businessParamLUCGrouping: {
        type: ParamAttrType.Object,
        object: {
          text1: {},
          text2: {},
          text3: {},
          text4: {},
          text5: {}
        }
      },
      groupingTexts: {
        type: ParamAttrType.Input,
        placeholder: '请填写' // 普通类型
      }
    }
  },
  [ParamType.ChipType]: { // BSMBusinessParamChipType
    attrs: {
      chipTypes: {
        type: ParamAttrType.Check,
        enumId: DictIds.ChipType
      }
    }
  },
  [ParamType.BioAnalysisSet]: { // BSMBusinessParamBioAnalysisSet
    attrs: {
      setType: {
        type: ParamAttrType.Radio,
        enumId: DictIds.BioAnalysisSet,
        default: 1 // 1->A套系
      }
    }
  },
  [ParamType.ChipTax]: { // BSMBusinessParamChipTax
    attrs: {
      chipTax: {
        type: ParamAttrType.Radio,
        enumId: DictIds.ChipTax,
        row: true,
        default: 1 // 1->人
      }
    }
  },
  [ParamType.WBVerificationGene]: { // BSMBusinessParamWBVerificationGene
    attrs: {
      geneCount: {
        type: ParamAttrType.Radio,
        enumId: DictIds.WBVerificationGene,
        default: 1 // 默认选中第一个
      }
    }
  },
  [ParamType.Cas9StableStrainConstruction]: { // BSMBusinessParamCas9StableStrainConstruction
    attrs: {
      needed: {
        label: '提示：双载体CAS9必需',
        type: ParamAttrType.Radio,
        enumId: DictIds.BooleanType,
        default: 1, // 1->是
        row: true
      }
    }
  },
  [ParamType.ProteomicsGroupings]: { // BSMBusinessParamProteomicsGrouping
    attrs: {
      proteomicsGroupings: {
        type: ParamAttrType.List,
        list: {
          groupName: {
            label: '组名',
            type: ParamAttrType.Input,
            placeholder: '请填写'
          },
          sampleCount: {
            label: '组内样本数',
            type: ParamAttrType.Number,
            default: 1
          },
          mixed: {
            label: '是否混样',
            type: ParamAttrType.Radio,
            enumId: DictIds.BooleanType,
            default: 2,
            row: true
          },
          comment: {
            label: '备注',
            type: ParamAttrType.Text
          }
        }
      }
    }
  }
}

function getDetailForDisplay (method, params, callback) {
  scClient.callRemoteMethod(method, params, false, response => {
    if (response.cellGUID) { // 乙方提供细胞
      response.cellChineseNamePub = '细胞中文名:' + response.cellChineseNamePub
      response.cellADMOIRatioName = '慢病毒感染难易度:' + response.cellADMOIRatioName
      response.cellADMOIValueName = '慢病毒感染MOI:' + response.cellADMOIValueName
      response.initMoney = '产品价格:' + response.initMoney
    } else if (response.lineIDName) { // 甲方提供实物
      response.receiveStatusName = '实物接受执行状态:' + response.receiveStatusName
      response.receiveWareQty = '实物数量:' + response.receiveWareQty
      response.receiveStatusDT = '实物接收反馈时间:' + response.receiveStatusDT
      response.receiveWareName = '实物名称:' + response.receiveWareName
      response.customerName = '客户名称:' + response.customerName
      response.customerNo = '客户编号:' + response.customerNo
    } else if (response.contractNo) { // 病毒／质粒
      response.employeeName = '业务员:' + response.employeeName
      response.customerName = '客户名称:' + response.customerName
      response.productName = '合同名称:' + response.productName
    } else if (response.antibodyGuid) { // 抗体
      response.geneID = '基因ID:' + response.geneID
      response.inventoryQty = '当前管数:' + response.inventoryQty
      response.unitQty = '规格(ul):' + response.unitQty
    }
    callback(response)
  })
}

export default {
  ParamType,
  ParamAttrType,
  ParamMeta,
  ExtraInfo,
  Position,
  GroupingTypes,
  CellLineKey,
  BooleanContent,
  createMetaType,
  DictIds,
  ParamAttrDataType
}
