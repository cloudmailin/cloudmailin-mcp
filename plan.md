I want to build an MCP server t CloudMailin. I'll include some nessesary files as outlined in the model contrext protocol .io website. Please ask me any relevant questions before we proceed:

@https://modelcontextprotocol.io/tutorials/building-mcp-with-llms
@https://modelcontextprotocol.io/llms-full.txt

Be sure to check the latest version of the typescript-sdk for the latest features.

@https://github.com/modelcontextprotocol/typescript-sdk

We want the MCP server to be run via npx in the short term. So it's not going to be a hosted server. Users will need to run it locally.

This is in beta so let's make the version 0.0.1.

We'll use typescript but let's also just compile ES2024 because we're going to expect node 22. Let's keep things in a single file for now as it's just a simple server.

We're building for cursor for now you run it similarly to this:

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
        "CLOUDMAILIN_ACCOUNT_ID": "test_account",
        "CLOUDMAILIN_API_KEY": "test_key"
      }
    }
  }
}
```

without building we can run like this:

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

Use typescript locally but add an example to the readme to build and run with node / npx.

We should be able to use node 22.7+ experimental transform types in development. This will mean the run command is actually similar to node --experimental-transform-types src/index.ts

This will probably mean imporitng "import { McpServer } from '@modelcontextprotocol/sdk/dist/index.js';" and probably "import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";"

Environment variables will be passed in as arguments to the MCP server and don't need any additional setup as cursor and co will set them.

Authentication will be handled by passing an ENV variable into the MCP server.
The CloudMailin API expects an account ID and an API key. The API key is passed in the Authorization header as a Bearer token. The Account ID is passed in the URL as a path parameter.

Full API documentation: @https://api.cloudmailin.com/api

I want to be able to list all messages in a given address: @https://api.cloudmailin.com/api#tag/Addresses/paths/~1incoming_statuses/get in order to do this we might need to get all addresses in the account: @https://api.cloudmailin.com/api#tag/Addresses/paths/~1addresses/get

We should register all of the tools as we create the server under capabilities.tools with a description and then we should fully implement them later with server.tool.

We don't ned to close the server if the ENV variables are not set, we can wait until they are required and then return an error for more helpful debugging.

We should make the code as simple as possible, we probably don't need things like zod, signal handling or anything that overly complicates the code.

### Development

The inspector can be used like this:
npx @modelcontextprotocol/inspector node --experimental-transform-types ./src/index.ts
