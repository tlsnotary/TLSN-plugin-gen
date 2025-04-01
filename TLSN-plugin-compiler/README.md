# TLSN-plugin-compiler
A base repo on tlsnotary plugin. Takes in a JSON code and returns wasm in artifacts

## How to Use the Project

This project is designed to compile TLSNotary plugins from JSON code and return WebAssembly (WASM) artifacts. Follow the steps below to use the project:

1. Clone the repository:
   ```sh
   git clone tlsn-plugin-compiler
   ```
   cd TLSN-plugin-compiler
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Build the project:
   ```sh
   npm run build
   ```

4. The compiled WASM artifacts will be available in the `dist` directory.

## Pipeline Actions

The pipeline actions for this project are defined in the `.github/workflows/build-pipeline.yml` file. The pipeline can be triggered manually or by an external POST request.

### Manual Trigger ( don't do that but you can do it)

To manually trigger the pipeline, navigate to the Actions tab in your GitHub repository, select the desired workflow, and click on the "Run workflow" button. Make sure you replace the default existing files with your plugin code. You have to replace config.json, index.d.ts and index.ts with your plugin code. 

### External POST Request

The pipeline can also be triggered by sending a POST request to the GitHub API. The expected format for the POST request is described in the next section. You have to use your own access token for that. 

## Expected POST Request Format

To trigger the pipeline using an external POST request, send a request to the following URL:
```
https://api.github.com/repos/hackertron/TLSN-plugin-compiler/dispatches
```

The request should include the following headers:
```
Accept: application/vnd.github.v3+json
Authorization: token YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
Content-Type: application/json
```

The body of the request should be in JSON format and include the `event_type` and `client_payload` fields. Here is an example:

```json
{
  "event_type": "build_pipeline",
  "client_payload": {
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
    "index.d.ts": "declare module 'main' {\\n    export function start(): I32;\\n    export function two(): I32;\\n    export function parseAnimeQuoteResp(): I32;\\n    export function three(): I32;\\n    export function config(): I32;\\n}\\n\\ndeclare module 'extism:host' {\\n    interface user {\\n        redirect(ptr: I64): void;\\n        notarize(ptr: I64): I64;\\n    }\\n}",
    "index.ts": "import icon from '../assets/icon.png';\\nimport config_json from '../config.json';\\nimport { redirect, notarize, outputJSON, getCookiesByHost, getHeadersByHost } from './utils/hf.js';\\n\\nexport function config() {\\n  outputJSON({\\n    ...config_json,\\n    icon: icon\\n  });\\n}\\n\\nfunction isValidHost(urlString: string) {\\n  const url = new URL(urlString);\\n  return url.hostname === 'animechan.io';\\n}\\n\\nexport function start() {\\n  if (!isValidHost(Config.get('tabUrl'))) {\\n    redirect('https://animechan.io');\\n    outputJSON(false);\\n    return;\\n  }\\n  outputJSON(true);\\n}\\n\\nexport function two() {\\n  const headers = getHeadersByHost('animechan.io');\\n\\n  outputJSON({\\n    url: 'https://animechan.io/api/v1/quotes/random',\\n    method: 'GET',\\n    headers: {\\n      'Accept': 'application/json',\\n    },\\n  });\\n}\\n\\nexport function parseAnimeQuoteResp() {\\n  const bodyString = Host.inputString();\\n  const params = JSON.parse(bodyString);\\n\\n  if (params.data) {\\n    outputJSON(params.data);\\n  } else {\\n    outputJSON(false);\\n  }\\n}\\n\\nexport function three() {\\n  const params = JSON.parse(Host.inputString());\\n\\n  if (!params) {\\n    outputJSON(false);\\n  } else {\\n    const id = notarize({\\n      ...params,\\n      getSecretResponse: 'parseAnimeQuoteResp',\\n    });\\n    outputJSON(id);\\n  }\\n}",
    "utils/hf.js": "function redirect(url) {\\n  const { redirect } = Host.getFunctions();\\n  const mem = Memory.fromString(url);\\n  redirect(mem.offset);\\n}\\n\\nfunction notarize(options) {\\n  const { notarize } = Host.getFunctions();\\n  const mem = Memory.fromString(JSON.stringify(options));\\n  const idOffset = notarize(mem.offset);\\n  const id = Memory.find(idOffset).readString();\\n  return id;\\n}\\n\\nfunction outputJSON(json) {\\n  Host.outputString(\\n    JSON.stringify(json),\\n  );\\n}\\n\\nfunction getHeadersByHost(hostname) {\\n  const headers = JSON.parse(Config.get('headers'));\\n  if (!headers[hostname]) throw new Error(`cannot find headers for ${hostname}`);\\n  return headers[hostname];\\n}\\n\\nmodule.exports = {\\n  redirect,\\n  notarize,\\n  outputJSON,\\n  getHeadersByHost,\\n};"
  }
}
```

## Example Payload Structure and Usage

The `payload.json` file contains an example payload that can be used to trigger the pipeline. Here is the structure and usage of the example payload:

```json
{
  "config": {
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
  "index.d.ts": "declare module 'main' {\\n    export function start(): I32;\\n    export function two(): I32;\\n    export function parseAnimeQuoteResp(): I32;\\n    export function three(): I32;\\n    export function config(): I32;\\n}\\n\\ndeclare module 'extism:host' {\\n    interface user {\\n        redirect(ptr: I64): void;\\n        notarize(ptr: I64): I64;\\n    }\\n}",
  "index.ts": "import icon from '../assets/icon.png';\\nimport config_json from '../config.json';\\nimport { redirect, notarize, outputJSON, getCookiesByHost, getHeadersByHost } from './utils/hf.js';\\n\\nexport function config() {\\n  outputJSON({\\n    ...config_json,\\n    icon: icon\\n  });\\n}\\n\\nfunction isValidHost(urlString: string) {\\n  const url = new URL(urlString);\\n  return url.hostname === 'animechan.io';\\n}\\n\\nexport function start() {\\n  if (!isValidHost(Config.get('tabUrl'))) {\\n    redirect('https://animechan.io');\\n    outputJSON(false);\\n    return;\\n  }\\n  outputJSON(true);\\n}\\n\\nexport function two() {\\n  const headers = getHeadersByHost('animechan.io');\\n\\n  outputJSON({\\n    url: 'https://animechan.io/api/v1/quotes/random',\\n    method: 'GET',\\n    headers: {\\n      'Accept': 'application/json',\\n    },\\n  });\\n}\\n\\nexport function parseAnimeQuoteResp() {\\n  const bodyString = Host.inputString();\\n  const params = JSON.parse(bodyString);\\n\\n  if (params.data) {\\n    outputJSON(params.data);\\n  } else {\\n    outputJSON(false);\\n  }\\n}\\n\\nexport function three() {\\n  const params = JSON.parse(Host.inputString());\\n\\n  if (!params) {\\n    outputJSON(false);\\n  } else {\\n    const id = notarize({\\n      ...params,\\n      getSecretResponse: 'parseAnimeQuoteResp',\\n    });\\n    outputJSON(id);\\n  }\\n}",
  "utils/hf.js": "function redirect(url) {\\n  const { redirect } = Host.getFunctions();\\n  const mem = Memory.fromString(url);\\n  redirect(mem.offset);\\n}\\n\\nfunction notarize(options) {\\n  const { notarize } = Host.getFunctions();\\n  const mem = Memory.fromString(JSON.stringify(options));\\n  const idOffset = notarize(mem.offset);\\n  const id = Memory.find(idOffset).readString();\\n  return id;\\n}\\n\\nfunction outputJSON(json) {\\n  Host.outputString(\\n    JSON.stringify(json),\\n  );\\n}\\n\\nfunction getHeadersByHost(hostname) {\\n  const headers = JSON.parse(Config.get('headers'));\\n  if (!headers[hostname]) throw new Error(`cannot find headers for ${hostname}`);\\n  return headers[hostname];\\n}\\n\\nmodule.exports = {\\n  redirect,\\n  notarize,\\n  outputJSON,\\n  getHeadersByHost,\\n};"
}
```

To trigger the pipeline using this payload, you can use the `triggerpipeline.js` script provided in the repository. Update the `GITHUB_TOKEN` variable with your GitHub personal access token and run the script:

```sh
node triggerpipeline.js
```
