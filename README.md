# CloudMailin MCP

An MCP (Model Context Protocol) server for integrating with the CloudMailin API.
This currently uses the stdio transport and needs to be installed locally.

## Overview

This project implements an MCP server that allows AI models to interact with the
CloudMailin API, enabling access to email data through the Model Context
Protocol. It provides tools for:

- [Listing all email addresses in a CloudMailin account](#listaddresses)
- [Listing all messages for a given address](#listmessages)

## Running the MCP Server

To run the server, you need to provide your CloudMailin API credentials as
environment variables. First, build the project:

```bash
npm install
npm run build
```

Then run the built server:

```bash
CLOUDMAILIN_ACCOUNT_ID=your_account_id CLOUDMAILIN_API_KEY=your_api_key node build/index.js
```

You can also integrate with Cursor / Claude Desktop for production use by adding
the following to your config file (e.g. `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "cloudmailin": {
      "type": "stdio",
      "command": "node",
      "args": [
        "/workspaces/cloudmailin-mcp/build/index.js"
      ],
      "env": {
        "CLOUDMAILIN_ACCOUNT_ID": "your_account_id",
        "CLOUDMAILIN_API_KEY": "your_api_key"
      }
    }
  }
}
```

> Be sure to adjust the path if necessary, this path assumes you're just running
> via containers.

## Development

For development, you can run the server directly from TypeScript using Node.js
22.7+ with the experimental transform types flag:

```bash
CLOUDMAILIN_ACCOUNT_ID=your_account_id CLOUDMAILIN_API_KEY=your_api_key node --experimental-transform-types ./src/index.ts
```

Or use the provided npm script:

```bash
CLOUDMAILIN_ACCOUNT_ID=your_account_id CLOUDMAILIN_API_KEY=your_api_key npm run dev
```

To use Cursor in development mode, add the following to your `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "cloudmailin": {
      "type": "stdio",
      "command": "npm",
      "args": [
        "--prefix",
        "/workspaces/cloudmailin-mcp",
        "run",
        "dev"
      ],
      "env": {
        "CLOUDMAILIN_ACCOUNT_ID": "test_account",
        "CLOUDMAILIN_API_KEY": "test_key"
      }
    }
  }
}
```

You can also run the inspector to see the MCP server in action:

```bash
npx @modelcontextprotocol/inspector node --experimental-transform-types ./src/index.ts
```

## Available Tools

The MCP server provides tools to interact with the CloudMailin API.

### listAddresses

Lists all inbound email addresses in your CloudMailin account.

Example Response:
```json
{
  "addresses": [
    {
      "id": "address_id",
      "address": "example@cloudmailin.net",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```

### listMessages

Lists all messages for an inbound address. You can optionally provide an
`addressId` parameter and a `query` parameter to filter messages for a specific
address.

The `query` parameter follows the elasticsearch querystring syntax and exposes
the following fields:

| Field            | Description/Values                      |
|------------------|-----------------------------------------|
| `status`         | The HTTP status code your HTTP server returned |
| `status_category`| `successful`, `delayed`, `failed`        |
| `from`           | The email address of the sender          |
| `to`             | The email address of the recipient       |
| `subject`        | The subject of the email                |
| `body`           | The body of the email                   |
| `created_at`     | The date and time of the email          |

An example query to find all messages in the last 24 hours:

```
status_category:delayed AND created_at:[now-1d/d TO now]
```

Example Response:
```json
{
  "messages": [
    {
      "id": "message_id",
      "sender": "sender@example.com",
      "recipient": "example@cloudmailin.net",
      "subject": "Test Email",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ]
}
```
