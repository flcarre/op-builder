#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as path from 'path';
import * as fs from 'fs/promises';
import { z } from 'zod';
import YAML from 'yaml';

const server = new Server(
  {
    name: 'orchestrator',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const ExecuteWorkflowSchema = z.object({
  workflowName: z.string(),
  variables: z.record(z.any()).optional(),
});

const ListWorkflowsSchema = z.object({});

const GetWorkflowInfoSchema = z.object({
  workflowName: z.string(),
});

const ListAgentsSchema = z.object({});

const GetAgentInfoSchema = z.object({
  agentName: z.string(),
});

async function getProjectRoot(): Promise<string> {
  return process.cwd();
}

async function listWorkflows(): Promise<Array<{ name: string; description?: string }>> {
  const projectRoot = await getProjectRoot();
  const workflowsDir = path.join(projectRoot, '.ai/workflows');

  try {
    const files = await fs.readdir(workflowsDir);
    const workflows = [];

    for (const file of files) {
      if (file.endsWith('.yaml')) {
        const content = await fs.readFile(path.join(workflowsDir, file), 'utf-8');
        const workflow = YAML.parse(content);
        workflows.push({
          name: file.replace('.yaml', ''),
          description: workflow.description || '',
        });
      }
    }

    return workflows;
  } catch (error) {
    return [];
  }
}

async function getWorkflowInfo(workflowName: string): Promise<any> {
  const projectRoot = await getProjectRoot();
  const workflowPath = path.join(projectRoot, '.ai/workflows', `${workflowName}.yaml`);

  try {
    const content = await fs.readFile(workflowPath, 'utf-8');
    const workflow = YAML.parse(content);

    return {
      name: workflow.name,
      description: workflow.description || '',
      steps: workflow.steps.length,
      stepDetails: workflow.steps.map((step: any) => ({
        name: step.name,
        agent: step.agent,
        onError: step.onError || 'fail',
        retries: step.retries || 0,
      })),
      variables: workflow.variables || {},
    };
  } catch (error: any) {
    throw new Error(`Workflow "${workflowName}" not found: ${error.message}`);
  }
}

async function executeWorkflow(
  workflowName: string,
  variables: Record<string, any> = {}
): Promise<any> {
  const projectRoot = await getProjectRoot();
  const workflowPath = path.join(projectRoot, '.ai/workflows', `${workflowName}.yaml`);

  try {
    const content = await fs.readFile(workflowPath, 'utf-8');
    const workflow = YAML.parse(content);

    return {
      status: 'simulated',
      message: 'Workflow execution is simulated in this MCP server',
      workflow: {
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps.length,
      },
      variables,
      note: 'To execute workflows with real agents, use the Orchestrator TypeScript API directly',
      example: `
import { WorkflowEngine } from '.ai/orchestrator';

const engine = new WorkflowEngine('.ai/workflows', stepExecutor);
const result = await engine.executeWorkflow('${workflowName}', ${JSON.stringify(variables)});
      `,
    };
  } catch (error: any) {
    throw new Error(`Failed to execute workflow: ${error.message}`);
  }
}

async function listAgents(): Promise<Array<{ name: string; description: string; tools: string[] }>> {
  const projectRoot = await getProjectRoot();
  const agentsDir = path.join(projectRoot, '.ai/agents');

  try {
    const dirs = await fs.readdir(agentsDir);
    const agents = [];

    for (const dir of dirs) {
      try {
        const configPath = path.join(agentsDir, dir, 'config.json');
        const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
        agents.push({
          name: config.name,
          description: config.description,
          tools: config.tools,
        });
      } catch {
        continue;
      }
    }

    return agents;
  } catch (error) {
    return [];
  }
}

async function getAgentInfo(agentName: string): Promise<any> {
  const projectRoot = await getProjectRoot();
  const agentDir = path.join(projectRoot, '.ai/agents', agentName);

  try {
    const configPath = path.join(agentDir, 'config.json');
    const promptPath = path.join(agentDir, 'system-prompt.md');

    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'));
    const prompt = await fs.readFile(promptPath, 'utf-8');

    return {
      name: config.name,
      description: config.description,
      tools: config.tools,
      outputFormat: config.outputFormat,
      systemPromptLength: prompt.length,
      systemPromptPreview: prompt.substring(0, 500) + '...',
    };
  } catch (error: any) {
    throw new Error(`Agent "${agentName}" not found: ${error.message}`);
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_workflows',
        description: 'List all available workflows in .ai/workflows/',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_workflow_info',
        description: 'Get detailed information about a specific workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowName: {
              type: 'string',
              description: 'Name of the workflow (without .yaml extension)',
            },
          },
          required: ['workflowName'],
        },
      },
      {
        name: 'execute_workflow',
        description: 'Execute a workflow with given variables (simulated in MCP)',
        inputSchema: {
          type: 'object',
          properties: {
            workflowName: {
              type: 'string',
              description: 'Name of the workflow to execute',
            },
            variables: {
              type: 'object',
              description: 'Variables to pass to the workflow',
            },
          },
          required: ['workflowName'],
        },
      },
      {
        name: 'list_agents',
        description: 'List all available specialized agents',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_agent_info',
        description: 'Get detailed information about a specific agent',
        inputSchema: {
          type: 'object',
          properties: {
            agentName: {
              type: 'string',
              description: 'Name of the agent (architect, developer, tester, reviewer)',
            },
          },
          required: ['agentName'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_workflows': {
        const workflows = await listWorkflows();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  workflows,
                  total: workflows.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_workflow_info': {
        const parsed = GetWorkflowInfoSchema.parse(args);
        const info = await getWorkflowInfo(parsed.workflowName);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      case 'execute_workflow': {
        const parsed = ExecuteWorkflowSchema.parse(args);
        const result = await executeWorkflow(
          parsed.workflowName,
          parsed.variables || {}
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_agents': {
        const agents = await listAgents();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  agents,
                  total: agents.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_agent_info': {
        const parsed = GetAgentInfoSchema.parse(args);
        const info = await getAgentInfo(parsed.agentName);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Orchestrator MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
