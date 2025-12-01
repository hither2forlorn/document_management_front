const conditions = {
  LessThen: 1,
  GreaterThen: 2,
  Concate: 3,
  AutoFill: 4,
};

//    const AutoCompleteField = [
//   {
//     value: null,
//     name: "---Please Select---",
//   },
//   {
//     value: 1,
//     name: "Account Name",
//   },
//   {
//     value: 2,
//     name: "CIF",
//   },
// ];

const AutoCompleteField = {
  AccountName: "Account Name",
  Branch: "Branch",
  CIF: "CIF",
  SchemeCode: "Scheme Code",
  IDNumber: "ID Number",
  RegistrationIDNumber: "Registration ID Number",
};

const conditionsType = [
  {
    value: null,
    name: "None",
  },
  {
    value: 1,
    name: "Is lessThen",
  },
  {
    value: 2,
    name: "Is greaterThen",
  },
  {
    value: 3,
    name: "Concate",
  },
  {
    value: 4,
    name: "AutoFill",
  },
];

const DocConcateConditions = [
  {
    docId: "documentName",
    label: "Document Name",
  },
];

module.exports = {
  conditions,
  conditionsType,
  DocConcateConditions,
  AutoCompleteField,
};
