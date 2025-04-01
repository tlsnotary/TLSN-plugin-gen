const axios = require('axios');

// Replace with your actual repository owner, repo, and personal access token
const GITHUB_OWNER = 'hackertron';
const GITHUB_REPO = 'TLSN-plugin-compiler';
const GITHUB_TOKEN = 'GITHUB_PERSONAL_ACCESS_TOKEN';

const triggerPipeline = async (payload) => {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`;

  try {
    const response = await axios.post(
      url,
      {
        event_type: 'build_pipeline',
        client_payload: payload
      },
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Pipeline triggered successfully:', response.status);
  } catch (error) {
    console.error('Error triggering the pipeline:', error.response ? error.response.data : error.message);
  }
};

// Example payload to send
const payload = {
  "config.json": {
    "title": "Anime Quote Notarization",
    "description": "Notarize the response from the Anime Quote API",
    "steps": [
        {
            "title": "Fetch a random anime quote",
            "cta": "Get Quote",
            "action": "start"
        },
        {
            "title": "Collect API response",
            "description": "Retrieve the quote from the API",
            "cta": "Check response",
            "action": "two"
        },
        {
            "title": "Notarize the quote",
            "cta": "Notarize",
            "action": "three",
            "prover": true
        }
    ],
    "hostFunctions": [
        "redirect",
        "notarize"
    ],
    "cookies": [],
    "headers": [
        "animechan.io"
    ],
    "requests": [
        {
            "url": "https://animechan.io/api/v1/quotes/random",
            "method": "GET"
        }
    ]
},
  "index.d.ts": "declare module 'main' {\n    export function start(): I32;\n    export function two(): I32;\n    export function parseAnimeQuoteResp(): I32;\n    export function three(): I32;\n    export function config(): I32;\n}\n\ndeclare module 'extism:host' {\n    interface user {\n        redirect(ptr: I64): void;\n        notarize(ptr: I64): I64;\n    }\n}",
  "index.ts": "import icon from '../assets/icon.png';\nimport config_json from '../config.json';\nimport { redirect, notarize, outputJSON, getCookiesByHost, getHeadersByHost } from './utils/hf.js';\n\nexport function config() {\n  outputJSON({\n    ...config_json,\n    icon: icon\n  });\n}\n\nfunction isValidHost(urlString: string) {\n  const url = new URL(urlString);\n  return url.hostname === 'animechan.io';\n}\n\nexport function start() {\n  if (!isValidHost(Config.get('tabUrl'))) {\n    redirect('https://animechan.io');\n    outputJSON(false);\n    return;\n  }\n  outputJSON(true);\n}\n\nexport function two() {\n  const headers = getHeadersByHost('animechan.io');\n\n  outputJSON({\n    url: 'https://animechan.io/api/v1/quotes/random',\n    method: 'GET',\n    headers: {\n      'Accept': 'application/json',\n    },\n  });\n}\n\nexport function parseAnimeQuoteResp() {\n  const bodyString = Host.inputString();\n  const params = JSON.parse(bodyString);\n\n  if (params.data) {\n    outputJSON(params.data);\n  } else {\n    outputJSON(false);\n  }\n}\n\nexport function three() {\n  const params = JSON.parse(Host.inputString());\n\n  if (!params) {\n    outputJSON(false);\n  } else {\n    const id = notarize({\n      ...params,\n      getSecretResponse: 'parseAnimeQuoteResp',\n    });\n    outputJSON(id);\n  }\n}",
  "utils/hf.js": "function redirect(url) {\n  const { redirect } = Host.getFunctions();\n  const mem = Memory.fromString(url);\n  redirect(mem.offset);\n}\n\nfunction notarize(options) {\n  const { notarize } = Host.getFunctions();\n  const mem = Memory.fromString(JSON.stringify(options));\n  const idOffset = notarize(mem.offset);\n  const id = Memory.find(idOffset).readString();\n  return id;\n}\n\nfunction outputJSON(json) {\n  Host.outputString(\n    JSON.stringify(json),\n  );\n}\n\nfunction getHeadersByHost(hostname) {\n  const headers = JSON.parse(Config.get('headers'));\n  if (!headers[hostname]) throw new Error(`cannot find headers for ${hostname}`);\n  return headers[hostname];\n}\n\nmodule.exports = {\n  redirect,\n  notarize,\n  outputJSON,\n  getHeadersByHost,\n};"
};

triggerPipeline(payload);
