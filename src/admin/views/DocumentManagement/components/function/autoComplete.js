// import React, { useState } from "react";
// import AsyncSelect from "react-select/async";
// import axios from "axios";

// const AutoComplete = (props) => {
//   const [value, setValue] = useState("");
//   const [accountNumber, setAccountNumber] = useState("");
//   const [apiObject, setApiObject] = useState({});

//   const promiseOptions = async (inputValue) => {
//     if (inputValue.length === 14) {
//       const populateUrl = `http://10.1.3.49:80/setup/external-api`;
//       const data = await axios(populateUrl, {
//         method: "GET",
//         headers: {
//           "Access-Control-Allow-Origin": "http://10.1.3.49:3000",
//           "Content-Type": "application/json",
//           vary: "Accept-Encoding",
//         },
//         params: {
//           accNo: inputValue,
//         },
//       });

//       let output = data.data.data[0]; // Assuming the first item is what you need
//       console.log(output, "here o/p");

//       output.value = output.idNum || "";
//       output.label = output.label || "";
//       output.accountName = output.accountName || "";
//       output.cid = output.cid || "";
//       output.statusId = output.statusId || 1;

//       setValue(output.label);
//       setApiObject(output);

//       return [
//         {
//           value: output.idNum || "",
//           label: output.label || "",
//           accountName: output.accountName || "",
//           branch: output.branch || "",
//           schmCode: output.schmCode || "",
//           cid: output.cid || "",
//           idNum: output.idNum || "",
//           statusId: output.statusId || 1,
//         },
//       ];
//     }
//     return [];
//   };

//   const handleInputChange = async (newValue, actionMeta) => {
//     const { action, prevInputValue } = actionMeta;
//     if (action === "input-change" && newValue.length <= 14) {
//       setValue(newValue);
//       if (newValue.length === 14) {
//         await promiseOptions(newValue);
//       }
//     }
//   };

//   const handleChange = (selectedOption) => {
//     if (selectedOption) {
//       setAccountNumber(selectedOption.value);
//       props.handleInputChange([], props.name, selectedOption.value, apiObject, "4");
//     }
//   };

//   return (
//     <AsyncSelect
//       className=""
//       cacheOptions
//       isDisabled={props.disabled}
//       onInputChange={handleInputChange}
//       onChange={handleChange}
//       name={props.name}
//       loadOptions={promiseOptions}
//       value={{ label: value, value: value }}
//       defaultOptions
//     />
//   );
// };

// export default AutoComplete;

import React, { useState } from "react";
import AsyncSelect from "react-select/async";
import axios from "axios";

const AutoComplete = (props) => {
  const [value, setValue] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [apiObject, setApiObject] = useState({});
  const [options, setOptions] = useState([]);

  const loadOptions = (inputValue, callback) => {
    if (inputValue.length === 14) {
      const populateUrl = `https://dms.ebl.com.np/setup/external-api`;
      axios
        .get(populateUrl, {
          headers: {
            "Content-Type": "application/json",
            vary: "Accept-Encoding",
          },
          params: {
            accNo: inputValue,
          },
        })
        .then((response) => {
          const data = response.data.data[0];
          const formattedOptions = [
            {
              value: data.idNum || "",
              label: data.label || "",
              accountName: data.accountName || "",
              branch: data.branch || "",
              schmCode: data.schmCode || "",
              cid: data.cid || "",
              idNum: data.idNum || "",
              statusId: data.statusId || 1,
            },
          ];
          setOptions(formattedOptions);
          callback(formattedOptions);
        })
        .catch((error) => {
          console.error("Error fetching options:", error);
          setOptions([]);
          callback([]);
        });
    } else {
      setOptions([]);
      callback([]);
    }
  };

  const handleChange = (selectedOption) => {
    if (selectedOption) {
      setAccountNumber(selectedOption.value);
      setApiObject(selectedOption); // Update apiObject state
      setValue(selectedOption.label); // Set the label in the input field
      props.handleInputChange([], props.name, selectedOption.value, selectedOption, "4");
    }
  };

  return (
    <AsyncSelect
      className=""
      cacheOptions
      isDisabled={props.disabled}
      onChange={handleChange}
      name={props.name}
      loadOptions={loadOptions}
      value={{ label: value, value: value }}
      defaultOptions
    />
  );
};

export default AutoComplete;
