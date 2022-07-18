/**
 * Разбиение одного массива на несколько по length элементов
 *
 * @param arr
 * @param length
 * @return {[]}
 */
export const chunkArray = (arr, length) => {
  let chunks = [];
  let i = 0;
  let n = arr.length;

  while (i < n) {
    chunks.push(arr.slice(i, i += length));
  }

  return chunks;
}

/**
 * Перебирает classifies и заменяет на other все классы не содержащиеся в availableClasses
 *
 * @param classifies
 * @param availableClasses
 * @return {*}
 */
export const prepareClassifies = (classifies, availableClasses) => {
  return classifies.map(pageClass => {
    const code = getDossierCode(pageClass);

    return availableClasses.includes(code) ? code : 'other';
  });
}

export const timeoutPromise = async (promise, err, timeout) => {
  return new Promise(function(resolve,reject) {
    promise.then(resolve,reject);
    setTimeout(reject.bind(null, err), timeout * 1000);
  });
};

function getDossierCode(code) {
  const codes = {
    'UNKNOWN': 'unknown',
    'DOCS_FOR_TREATY_TEMPLATE': 'docsForTreatyTemplate',
    'BORROWER_QUESTIONNAIRE_TEMPLATE': 'borrowerQuestionnaireTemplate',
    'LOAN_APPLICATION_TEMPLATE': 'loanApplicationTemplate',
    'ADD_PRODUCTS_LOAN_TEMPLATE': 'loanApplicationTemplate',
    'STATEMENTS_TEMPLATE': 'loanApplicationTemplate',
    'BORROWER_QUESTIONNAIRE_LOAN_APPLICATION_CONSENT_TEMPLATE': 'loanApplicationTemplate',
    'PASPORT': 'passport',
    'ANKETA': 'buyerQuestionnaire',
    'SOGLASIE': 'offerAgreement',
    'FOTOGRAFIYA': 'buyerPhoto',
    'PTS': 'vehiclePassport',
    'VODITELSKOE_UDOSTOVERENIE': 'driverLicense',
    'SNILS': 'snils',
    'STS': 'sts',
    'FOTOGRAFIYA_AUTO': 'vehiclePhoto',
    'SERTIFIKAT_ZAYAVLENIE_DOP': 'applicationAdditionalProducts',
    'DOGOVOR_KUPLI-PRODAZHI': 'saleContractAndCheck',
    'PREV_DOGOVOR_KUPLI-PRODAZHI': 'prevSaleContractAndCheck',
    'SCHETA_NA_OPLATU': 'invoice',
    'OPLATA_PERVONACHALNOGO_VZNOSA': 'firstPayment',
    'DOGOVOR_KOMISSII_AGENTSKIY': 'commissionContract',
    'SCHETA_NA_OPLATU_SERVICES': 'servicesInvoice',
    'KASKO': 'kasko',
    'DOVERENNOST_NA_PRODAZHU_AVTOMOBILYA': 'powerAttorney',
    'ZAYAVLENIYA_BROKER': 'statementBroker',
    'KREDITNYY_DOGOVOR': 'loanAgreement',
    'SERTIFIKAT': 'certificate',
    'DOGOVOR_MEDITSINSKOGO_STRAKHOVANIYA': 'medicalInsuranceContract',
    'ZAYAVLENIYE_O_PREDOSTAVLENII_KREDITA': 'loanApplication',
    'ANKETA_ZAYEMSHCHIKA': 'borrowerQuestionnaire',
    'AKT_PRIEMA_PEREDACHI_AVTO': 'acceptanceCertificate',
    'CHECK_LIST_PO_MAYAKU': 'lighthouseChecklist',
    'FOTO_YASTANOVKI_MAYAKA': 'lighthousePhoto',
    'OTKAZ_OT_SDACHI_PTS': 'refusalVehiclePassport',
    'OTHER': 'otherDocuments',
  }

  return codes[code];
}