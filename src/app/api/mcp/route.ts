import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { API_ERRORS } from '@/constants/api-errors';
import { jsonError, withApiErrors } from '@/lib/api-response';
import { bearerToken, resolveTokenUser } from '@/lib/api-tokens';
import { isLocalRequest } from '@/lib/local-request';
import { buildMcpServer } from '@/lib/mcp-server';

export const runtime = 'nodejs';

export const POST = withApiErrors(async (request: Request) => {
  if (!isLocalRequest(request)) return jsonError(403, API_ERRORS.localOnly);
  const userId = await resolveTokenUser(bearerToken(request));
  if (!userId) return jsonError(401, API_ERRORS.unauthorizedToken);
  const server = buildMcpServer(userId);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    return await transport.handleRequest(request);
  } finally {
    await server.close();
  }
});

const methodNotAllowed = () => jsonError(405, API_ERRORS.methodNotAllowed);

export const GET = methodNotAllowed;

export const DELETE = methodNotAllowed;
