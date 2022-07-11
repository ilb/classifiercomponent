const classifierHiddenStatuses = ['ON_CHECK', 'BAIL_VERIFICATION', 'FORMATION_AGREEMENT', 'REJECT'];

export default {
  classifier: {
    processor: 'ClassifierProcessor',
    access: {
      hidden: classifierHiddenStatuses,
      editable: '*'
    }
  },
  blocks: [
    {
      code: 'UNKNOWN_BLOCK'
    },
    {
      name: 'Создание заявки',
      code: 'OFFER_CREATE_BLOCK',
      open: ['CREATION', 'CREATED', 'ON_CHECK', 'REJECT', 'CONTINUE_QUESTIONNAIRE', 'CLIENT_VERIFICATION'],
      collapsed: true
    },
    {
      name: 'Проверка залога',
      code: 'BAIL_VERIFICATION_BLOCK',
      open: ['APPROVED', 'BAIL_VERIFICATION'],
      collapsed: true
    },
    {
      name: 'Документы на авто',
      code: 'AUTO_DOCUMENTS_BLOCK',
      open: ['LOADING_DOCUMENTS', 'FORMATION_AGREEMENT'],
      collapsed: true
    },
    {
      name: 'Документы на доп. сервисы',
      code: 'SERVICES_DOCUMENTS_BLOCK',
      open: ['LOADING_DOCUMENTS', 'FORMATION_AGREEMENT'],
      collapsed: true
    },
    {
      name: 'Оформление сделки',
      code: 'DEAL_PROCESSING_BLOCK',
      open: ['DEAL_PROCESSING', 'SIGNING_DOCUMENTS'],
      collapsed: true
    },
    {
      code: 'OTHER_BLOCK'
    }
  ],
  documents: [
    {
      code: 'UNKNOWN',
      block: 'UNKNOWN_BLOCK',
      name: 'Не распознано',
      type: 'otherDocuments',
      processor: 'ClassifierProcessor',
      access: {
        hidden: classifierHiddenStatuses,
        editable: '*'
      }
    },
    {
      code: 'DOCS_FOR_TREATY_TEMPLATE',
      name: 'Пакет документов на получение кредита[шаблоны]',
      type: 'docsForTreatyTemplate',
      access: {
        show: [],
        editable: []
      }
    },
    {
      code: 'BORROWER_QUESTIONNAIRE_TEMPLATE',
      name: 'Анкета клиента - заемщика банка [шаблон]',
      type: 'borrowerQuestionnaireTemplate',
      access: {
        show: [],
        editable: []
      }
    },
    {
      code: 'LOAN_APPLICATION_TEMPLATE',
      name: 'Заявка на кредит+заявление на страхование [шаблон]',
      type: 'loanApplicationTemplate',
      access: {
        show: [],
        editable: []
      }
    },
    {
      code: 'ADD_PRODUCTS_LOAN_TEMPLATE',
      name: 'Доп продукты для кредита РНБ[шаблоны]',
      type: 'loanApplicationTemplate',
      access: {
        show: [],
        editable: []
      }
    },
    {
      code: 'STATEMENTS_TEMPLATE',
      name: 'Заявления[шаблоны]',
      type: 'loanApplicationTemplate',
      access: {
        show: [],
        editable: []
      }
    },
    {
      code: 'BORROWER_QUESTIONNAIRE_LOAN_APPLICATION_CONSENT_TEMPLATE',
      name: 'Анкета клиента + Заявка на кредит+Заявление на страхование+Согласие [шаблон]',
      type: 'loanApplicationTemplate',
      access: {
        show: [],
        editable: []
      }
    },
    {
      code: 'PASPORT',
      block: 'OFFER_CREATE_BLOCK',
      name: 'Паспорт',
      type: 'passport',
      required: ['CREATION', 'CREATED', 'ON_CHECK', 'CONTINUE_QUESTIONNAIRE'],
      processor: 'OfferFailureProcessor',
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE']
      }
    },
    {
      code: 'ANKETA',
      name: 'Анкета',
      type: 'buyerQuestionnaire',
      accept: [
        'image/*',
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.oasis.opendocument.text',
        'application/zip',
        'application/x-tika-ooxml',
        'application/x-tika-msoffice',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.oasis.opendocument.spreadsheet'
      ],
      access: {
        show: [],
        editable: []
      }
    },
    {
      code: 'SOGLASIE',
      block: 'OFFER_CREATE_BLOCK',
      name: 'Согласие',
      type: 'offerAgreement',
      required: ['CREATED', 'ON_CHECK', 'CONTINUE_QUESTIONNAIRE', 'LOADING_DOCUMENTS'],
      processor: 'OfferFailureProcessor',
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE', 'LOADING_DOCUMENTS']
      }
    },
    {
      code: 'FOTOGRAFIYA',
      block: 'OFFER_CREATE_BLOCK',
      name: 'Фото',
      type: 'buyerPhoto',
      required: ['ON_CHECK', 'CONTINUE_QUESTIONNAIRE', 'DEAL_PROCESSING'],
      processor: 'OfferFailureProcessor',
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'CONTINUE_QUESTIONNAIRE', 'CLIENT_VERIFICATION', 'DEAL_PROCESSING']
      }
    },
    {
      code: 'PTS',
      block: 'BAIL_VERIFICATION_BLOCK',
      name: 'ПТС',
      type: 'vehiclePassport',
      required: ['APPROVED', 'BAIL_VERIFICATION', 'LOADING_DOCUMENTS'],
      processor: 'BailFailureProcessor',
      access: {
        hidden: ['CREATION', 'CREATED', 'ON_CHECK', 'CONTINUE_QUESTIONNAIRE', 'CLIENT_VERIFICATION'],
        editable: ['APPROVED', 'LOADING_DOCUMENTS']
      }
    },
    {
      code: 'VODITELSKOE_UDOSTOVERENIE',
      block: 'OFFER_CREATE_BLOCK',
      name: 'В/удостоверение',
      type: 'driverLicense',
      processor: 'FailureProcessor',
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'APPROVED', 'LOADING_DOCUMENTS', 'CONTINUE_QUESTIONNAIRE', 'CLIENT_VERIFICATION']
      }
    },
    {
      code: 'SNILS',
      block: 'OFFER_CREATE_BLOCK',
      name: 'СНИЛС',
      type: 'snils',
      processor: 'FailureProcessor',
      access: {
        show: '*',
        editable: ['CREATION', 'CREATED', 'APPROVED', 'LOADING_DOCUMENTS', 'CONTINUE_QUESTIONNAIRE', 'CLIENT_VERIFICATION']
      }
    },
    {
      code: 'STS',
      block: 'BAIL_VERIFICATION_BLOCK',
      name: 'СТС',
      type: 'sts',
      processor: 'StsProcessor',
      access: {
        hidden: ['CREATION', 'CREATED', 'ON_CHECK', 'REJECT', 'REFUSE_FROM_LOAN', 'CANCELED', 'CONTINUE_QUESTIONNAIRE', 'CLIENT_VERIFICATION'],
        editable: ['APPROVED', 'LOADING_DOCUMENTS']
      }
    },
    {
      code: 'FOTOGRAFIYA_AUTO',
      block: 'BAIL_VERIFICATION_BLOCK',
      name: 'Фото автомобиля',
      type: 'vehiclePhoto',
      processor: 'BailFailureProcessor',
      access: {
        hidden: ['CREATION', 'CREATED', 'ON_CHECK', 'REJECT', 'REFUSE_FROM_LOAN', 'CANCELED', 'CONTINUE_QUESTIONNAIRE', 'CLIENT_VERIFICATION'],
        editable: ['APPROVED', 'LOADING_DOCUMENTS']
      }
    },
    {
      code: 'SERTIFIKAT_ZAYAVLENIE_DOP',
      block: 'SERVICES_DOCUMENTS_BLOCK',
      name: 'Сертификат',
      tooltip: 'Заявление/Заказ-наряд',
      type: 'applicationAdditionalProducts',
      processor: 'AdditionEquipmentProcessor',
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS', 'DEAL_PROCESSING']
      }
    },
    {
      code: 'DOGOVOR_KUPLI-PRODAZHI',
      block: 'AUTO_DOCUMENTS_BLOCK',
      name: 'ДКП',
      type: 'saleContractAndCheck',
      processor: 'AgreementFailureProcessor',
      required: ['LOADING_DOCUMENTS', 'FORMATION_AGREEMENT', 'DEAL_PROCESSING'],
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS', 'DEAL_PROCESSING']
      }
    },
    {
      code: 'PREV_DOGOVOR_KUPLI-PRODAZHI',
      block: 'AUTO_DOCUMENTS_BLOCK',
      name: 'ДКП и Акт с пред. собственником',
      tooltip: 'ДКП и Акт с предыдущим собственником, договор комиссии',
      type: 'prevSaleContractAndCheck',
      processor: 'AgreementFailureProcessor',
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS']
      }
    },
    {
      code: 'SCHETA_NA_OPLATU',
      block: 'AUTO_DOCUMENTS_BLOCK',
      name: 'Счет на оплату',
      type: 'invoice',
      processor: 'AgreementFailureProcessor',
      required: ['LOADING_DOCUMENTS', 'FORMATION_AGREEMENT'],
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS']
      }
    },
    {
      code: 'OPLATA_PERVONACHALNOGO_VZNOSA',
      block: 'AUTO_DOCUMENTS_BLOCK',
      name: 'Оплата ПВ',
      type: 'firstPayment',
      processor: 'FirstPaymentProcessor',
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS']
      }
    },
    {
      code: 'DOGOVOR_KOMISSII_AGENTSKIY',
      block: 'AUTO_DOCUMENTS_BLOCK',
      name: 'Агентский договор',
      type: 'commissionContract',
      processor: 'AgreementFailureProcessor',
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS']
      }
    },
    {
      code: 'SCHETA_NA_OPLATU_SERVICES',
      block: 'SERVICES_DOCUMENTS_BLOCK',
      name: 'Счет на оплату',
      type: 'servicesInvoice',
      processor: 'AdditionEquipmentProcessor',
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS', 'DEAL_PROCESSING']
      }
    },
    {
      code: 'KASKO',
      block: 'SERVICES_DOCUMENTS_BLOCK',
      name: 'КАСКО и счет',
      type: 'kasko',
      processor: 'KaskoProcessor',
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS']
      }
    },
    {
      code: 'DOVERENNOST_NA_PRODAZHU_AVTOMOBILYA',
      block: 'AUTO_DOCUMENTS_BLOCK',
      name: 'Доверенность',
      type: 'powerAttorney',
      processor: 'AgreementFailureProcessor',
      access: {
        hidden: [
          'CREATION',
          'CREATED',
          'ON_CHECK',
          'REJECT',
          'APPROVED',
          'REFUSE_FROM_LOAN',
          'CANCELED',
          'CONTINUE_QUESTIONNAIRE',
          'CLIENT_VERIFICATION'
        ],
        editable: ['LOADING_DOCUMENTS']
      }
    },
    {
      code: 'ZAYAVLENIYA_BROKER',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Поручительство ООО БРОКЕР',
      type: 'statementBroker',
      processor: 'StatementsProcessor',
      tooltip: 'Заявление в ООО Брокер, Соглашение о подсудности, Согласие ООО Брокер',
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'KREDITNYY_DOGOVOR',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Кредитный договор',
      type: 'loanAgreement',
      processor: 'DefaultProcessor',
      required: ['DEAL_PROCESSING'],
      tooltip: 'Индивидуальные условия, Заявление на переодическое перечисление ДС, Заявление на перевод средств со счета ФЛ, Заявление об открытии счёта',
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'SERTIFIKAT',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Юридическая защита',
      type: 'certificate',
      processor: 'JuridicalDefenceProcessor',
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'DOGOVOR_MEDITSINSKOGO_STRAKHOVANIYA',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Защитник',
      type: 'medicalInsuranceContract',
      required: ['DEAL_PROCESSING'],
      processor: 'DefenderProcessor',
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'ZAYAVLENIYE_O_PREDOSTAVLENII_KREDITA',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Заявление о предоставлении кредита',
      type: 'loanApplication',
      processor: 'DefaultProcessor',
      required: ['DEAL_PROCESSING'],
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'ANKETA_ZAYEMSHCHIKA',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Анкета',
      type: 'borrowerQuestionnaire',
      processor: 'DefaultProcessor',
      required: ['DEAL_PROCESSING'],
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'AKT_PRIEMA_PEREDACHI_AVTO',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Акт приема-передачи',
      type: 'acceptanceCertificate',
      processor: 'DefaultProcessor',
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'CHECK_LIST_PO_MAYAKU',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Чек Лист по маяку',
      type: 'lighthouseChecklist',
      processor: 'DefaultProcessor',
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'FOTO_YASTANOVKI_MAYAKA',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Фото установки маяка',
      type: 'lighthousePhoto',
      processor: 'DefaultProcessor',
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'OTKAZ_OT_SDACHI_PTS',
      block: 'DEAL_PROCESSING_BLOCK',
      name: 'Отказ от сдачи ПТС',
      type: 'refusalVehiclePassport',
      processor: 'DefaultProcessor',
      access: {
        show: ['DEAL_PROCESSING', 'CHECK_DEAL_PROCESSING'],
        editable: ['DEAL_PROCESSING']
      }
    },
    {
      code: 'OTHER',
      block: 'OTHER_BLOCK',
      name: 'Прочее',
      tooltip: 'Документы, которые распознались, но не могут быть загружены в необходимую вкладку',
      type: 'otherDocuments',
      processor: 'FailureProcessor',
      access: {
        show: '*',
        readonly: classifierHiddenStatuses
      }
    }
  ]
};
