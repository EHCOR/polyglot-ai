# Overview
A simple translation demo app that runs a Hugging Face model in-process using Transformers.js.

Built with Vite, Express, JS, HTML and CSS

## Prerequisites
- Node.js 18+
- npm

## Setup
Create an .env in the project root with the following:

| Variable | Description                                                                                          |
| --- |------------------------------------------------------------------------------------------------------|
| `ONNX_MODEL` | A text-generation model from Hugging Face. Must be ONNX-compatible and must support text generation. |
| `PORT` | The port the app is served on.                                                                       |
| `NODE_ENV` | Environment `development` or `production`.                                                           |

Example:
````env
ONNX_MODEL=onnx-community/Qwen3-0.6B-ONNX
PORT=3000
NODE_ENV=production
````

# Starting
Install the dependencies and run the project
````bash
npm install
npm run build
npm run server
````
App will be served to your selected port on local, ie:`http://localhost:3000`