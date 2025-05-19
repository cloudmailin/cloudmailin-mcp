// CloudMailin MCP server implementation
import { z } from "zod";
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios from 'axios';

// Define constants
const API_BASE_URL = 'https://api.cloudmailin.com/api/v0.1';

// A class to handle CloudMailin API interactions
class CloudMailinClient {
  private accountId: string;
  private apiKey: string;

  constructor(accountId: string, apiKey: string) {
    this.accountId = accountId;
    this.apiKey = apiKey;
  }

  // Helper method to make authenticated API requests
  private async request<T>(path: string, params?: Record<string, string>): Promise<T> {
    console.error("request", path, params);
    const url = `${API_BASE_URL}/${this.accountId}/${path}`;
    const response = await axios({
      method: 'get',
      url,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      params
    });
    console.error("response", response.data);
    return response.data as T;
  }

  // Get all addresses in the account
  async getAddresses() {
    return this.request('/addresses');
  }

  // Get messages for a specific address
  async getMessages(addressId: string, q?: string) {
    const path = `incoming_statuses`;
    let query = q || "*"
    return this.request(path, {
      address_id: addressId,
      query: query
    });
  }
}

// Main function to set up and start the MCP server
async function main() {
  // Get API credentials from environment variables
  const accountId = process.env.CLOUDMAILIN_ACCOUNT_ID || '';
  const apiKey = process.env.CLOUDMAILIN_API_KEY || '';

  // Create an MCP server
  const server = new McpServer({
    name: "CloudMailin MCP",
    version: "0.0.1",
    description: "Access CloudMailin API to manage email addresses and messages",
    publisher: {
      name: "CloudMailin MCP",
      url: "https://cloudmailin.com"
    },
    capabilities: {
      tools: [
        {
          name: "listAddresses",
          description: "Lists all email addresses in your CloudMailin account",
        },
        {
          name: "listMessages",
          description: "Lists all messages for an address. Requires address ID obtained from listAddresses.",
        }
      ]
    }
  });

  // Create the CloudMailin client if credentials are available
  let client: CloudMailinClient | null = null;
  if (accountId && apiKey) {
    client = new CloudMailinClient(accountId, apiKey);
  }

  // Add a tool to list all addresses
  server.tool(
    "listAddresses",
    {},
    async () => {
      if (!client) {
        return {
          content: [{
            type: "text",
            text: "Error: CLOUDMAILIN_ACCOUNT_ID and CLOUDMAILIN_API_KEY environment variables must be set"
          }],
          isError: true
        };
      }

      const addresses = await client.getAddresses();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(addresses, null, 2)
        }]
      };
    }
  );

  // Add a tool to list messages for a specific address
  server.tool(
    "listMessages",
    {
      addressId: z.string()
        .describe("Address ID to filter messages. Must be obtained from listAddresses."),
      query: z.string().describe(
        "Search query to filter messages. Uses elasticsearch query sytax and can filter by: " +
        "status (http status code returned by HTTP server), " +
        "status_category (sucessful, delayed, rejected, max_size) " +
        "to (email address), from (email address), subject, created_at (date)" +
        "* for no filter"
      ).optional()
    },
    async (params) => {
      if (!client) {
        return {
          content: [{
            type: "text",
            text: "Error: CLOUDMAILIN_ACCOUNT_ID and CLOUDMAILIN_API_KEY environment variables must be set"
          }],
          isError: true
        };
      }

      const messages = await client.getMessages(params.addressId, params.query);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(messages, null, 2)
        }]
      };
    }
  );

  // Create a transport for the server
  const transport = new StdioServerTransport();

  // Connect the server to the transport
  await server.connect(transport);

  console.error("CloudMailin MCP Server running on stdio");
}

// Run the server
main().catch((error) => {
  console.error("Error starting CloudMailin MCP Server", error);
  process.exit(1);
});
