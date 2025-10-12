const axios = require("axios");
const API = axios.create({
  baseURL:"https://emkc.org/api/v2/piston"
})

const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  typescript: "5.0.3",
  python: "3.10.0",
  java: "15.0.2", 
  csharp: "6.12.0",
  cpp: "10.2.0", // lowercase, no spaces
};

exports.runTheCode = async(language , sourceCode )=>{
  const res = await API.post("execute" , {
    language : language,
    version: LANGUAGE_VERSIONS[language],
    files : [
      {
        content : sourceCode
      }
    ]
  });
  
  return res.data.run;

};