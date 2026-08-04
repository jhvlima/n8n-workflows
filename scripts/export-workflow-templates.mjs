#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildVersionedWorkflows } from './build-versioned-workflows.mjs';

const requiredEnvironment = [
  'N8N_API_URL',
  'N8N_API_KEY',
  'N8N_CORE_WORKFLOW_ID',
  'N8N_NOTION_CONTEXT_WORKFLOW_ID',
  'N8N_AI_WORKFLOW_ID',
  'N8N_PUBLISHER_WORKFLOW_ID',
  'N8N_BOOTSTRAP_WORKFLOW_ID',
  'N8N_BOOTSTRAP_FORM_WORKFLOW_ID',
  'N8N_MAINTENANCE_WORKFLOW_ID',
];

const missing = requiredEnvironment.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
}

const apiUrl = process.env.N8N_API_URL.replace(/\/$/, '');
const workflowIds = {
  core: process.env.N8N_CORE_WORKFLOW_ID,
  notionContext: process.env.N8N_NOTION_CONTEXT_WORKFLOW_ID,
  ai: process.env.N8N_AI_WORKFLOW_ID,
  publisher: process.env.N8N_PUBLISHER_WORKFLOW_ID,
  bootstrap: process.env.N8N_BOOTSTRAP_WORKFLOW_ID,
  bootstrapForm: process.env.N8N_BOOTSTRAP_FORM_WORKFLOW_ID,
  maintenance: process.env.N8N_MAINTENANCE_WORKFLOW_ID,
};

const outputFiles = {
  core: 'core-documentation.json',
  notionContext: 'notion-project-context.json',
  ai: 'ai-enrichment.json',
  publisher: 'github-publisher.json',
  bootstrap: 'bootstrap-documentation.json',
  bootstrapForm: 'bootstrap-form.json',
  maintenance: 'daily-maintenance.json',
};

const portableConfigurations = {
  core: {
    nodeName: 'Configuração',
    fields: [
      ['requiredTag', "={{ String($json.requiredTag ?? 'docs-internal') }}"],
      ['projectTagPrefix', "={{ String($json.projectTagPrefix ?? 'project:') }}"],
      ['projectSlug', "={{ String($json.projectSlug ?? '').trim().toLowerCase() }}"],
      ['aiMode', 'bootstrap'],
      ['documentationMode', "={{ String($json.documentationMode ?? 'core') }}"],
    ],
  },
  notionContext: {
    nodeName: 'Configuração Notion',
    fields: [
      ['notionRootUrl', "={{ String($json.notionRootUrl ?? '').trim() }}"],
      ['maxPages', 100, 'number'],
      ['maxCharsPerPage', 20000, 'number'],
      ['maxSummaryCharsPerPage', 4000, 'number'],
      ['maxTotalChars', 40000, 'number'],
      ['notionApiVersion', '2026-03-11'],
    ],
  },
  bootstrap: {
    nodeName: 'Configuração Bootstrap',
    fields: [
      ['projectSlug', "={{ String($json.projectSlug ?? '').trim().toLowerCase() }}"],
      ['notionRootUrl', "={{ String($json.notionRootUrl ?? '').trim() }}"],
      ['aiMode', 'bootstrap'],
      ['owner', "={{ String($json.owner ?? 'YOUR_GITHUB_USER') }}"],
      ['repository', "={{ String($json.repository ?? 'YOUR_REPOSITORY') }}"],
      ['branch', "={{ String($json.branch ?? 'docs/generated') }}"],
      ['forceBootstrap', '={{ Boolean($json.forceBootstrap ?? false) }}', 'boolean'],
      ['documentationMode', 'bootstrap'],
    ],
  },
  bootstrapForm: {
    nodeName: 'Configuração do formulário',
    includeOtherFields: true,
    fields: [
      ['requiredTag', 'docs-internal'],
      ['projectTagPrefix', 'project:'],
      ['projectSlug', ''],
      ['aiMode', 'bootstrap'],
      ['documentationMode', 'form-discovery'],
      ['owner', 'YOUR_GITHUB_USER'],
      ['repository', 'YOUR_REPOSITORY'],
      ['branch', 'docs/generated'],
    ],
  },
  maintenance: {
    nodeName: 'Configuração Maintenance',
    fields: [
      ['requiredTag', "={{ String($json.requiredTag ?? 'docs-internal') }}"],
      ['projectTagPrefix', "={{ String($json.projectTagPrefix ?? 'project:') }}"],
      ['projectSlug', "={{ String($json.projectSlug ?? '') }}"],
      ['aiMode', 'bootstrap'],
      ['owner', "={{ String($json.owner ?? 'YOUR_GITHUB_USER') }}"],
      ['repository', "={{ String($json.repository ?? 'YOUR_REPOSITORY') }}"],
      ['branch', "={{ String($json.branch ?? 'docs/generated') }}"],
      ['documentationMode', 'maintenance'],
    ],
  },
};

async function fetchWorkflow(id) {
  const response = await fetch(`${apiUrl}/workflows/${id}`, {
    headers: { 'X-N8N-API-KEY': process.env.N8N_API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar workflow ${id}: HTTP ${response.status}`);
  }

  return response.json();
}

function replaceInstanceReferences(value) {
  if (typeof value === 'string') {
    return value
      .replaceAll('jhvlima/n8n-workflows', 'YOUR_GITHUB_USER/YOUR_REPOSITORY')
      .replaceAll('test/n8n-docs', 'docs/generated');
  }

  if (Array.isArray(value)) return value.map(replaceInstanceReferences);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, replaceInstanceReferences(entry)]),
    );
  }

  return value;
}

function sanitizeNode(node, workflowKind) {
  const clean = replaceInstanceReferences(structuredClone(node));
  delete clean.credentials;

  const portableConfiguration = portableConfigurations[workflowKind];
  if (portableConfiguration?.nodeName === clean.name) {
    const currentAssignments = clean.parameters?.assignments?.assignments ?? [];
    clean.type = 'n8n-nodes-base.set';
    clean.typeVersion = 3.4;
    clean.parameters = {
      assignments: {
        assignments: portableConfiguration.fields.map(([name, value, type = 'string']) => ({
          id: currentAssignments.find((entry) => entry.name === name)?.id ?? `${workflowKind}-${name}`,
          name,
          value,
          type,
        })),
      },
      ...(portableConfiguration.includeOtherFields ? { includeOtherFields: true } : {}),
      options: {},
    };
  }

  if (clean.type === 'n8n-nodes-base.executeWorkflow') {
    const target = /publicar/i.test(clean.name)
        ? 'publisher'
        : /notion|reuniões/i.test(clean.name)
          ? 'notionContext'
        : /ia|enriquecimento/i.test(clean.name)
          ? 'ai'
          : /bootstrap/i.test(clean.name)
            ? 'bootstrap'
            : 'core';
    const targets = {
      core: {
        placeholder: 'SELECT_CORE_WORKFLOW_AFTER_IMPORT',
        name: 'Core - Documentação n8n (Dry Run)',
      },
      notionContext: {
        placeholder: 'SELECT_NOTION_CONTEXT_WORKFLOW_AFTER_IMPORT',
        name: 'Notion - Contexto de Reuniões do Projeto',
      },
      ai: {
        placeholder: 'SELECT_AI_WORKFLOW_AFTER_IMPORT',
        name: 'AI - Enriquecimento da Documentação n8n',
      },
      publisher: {
        placeholder: 'SELECT_PUBLISHER_WORKFLOW_AFTER_IMPORT',
        name: 'Publisher - GitHub n8n-workflows',
      },
      bootstrap: {
        placeholder: 'SELECT_BOOTSTRAP_WORKFLOW_AFTER_IMPORT',
        name: 'Bootstrap - Documentação n8n',
      },
    };

    clean.parameters.workflowId = {
      __rl: true,
      value: targets[target].placeholder,
      mode: 'list',
      cachedResultName: targets[target].name,
    };
  }

  if (['bootstrap', 'bootstrapForm', 'maintenance'].includes(workflowKind) && clean.type === 'n8n-nodes-base.code') {
    clean.parameters.jsCode = clean.parameters.jsCode
      .replace(/input\.owner\?\?'[^']*'/g, "input.owner??'YOUR_GITHUB_USER'")
      .replace(/input\.repository\?\?'[^']*'/g, "input.repository??'YOUR_REPOSITORY'")
      .replace(/input\.branch\?\?'[^']*'/g, "input.branch??'docs/generated'");
  }

  return clean;
}

function createPortableWorkflow(workflow, workflowKind) {
  const settings = {};
  if (workflow.settings?.executionOrder) settings.executionOrder = workflow.settings.executionOrder;
  if (workflow.settings?.callerPolicy) settings.callerPolicy = workflow.settings.callerPolicy;
  if (workflow.settings?.timezone) settings.timezone = workflow.settings.timezone;

  return {
    name: workflow.name,
    nodes: workflow.nodes.map((node) => sanitizeNode(node, workflowKind)),
    connections: replaceInstanceReferences(structuredClone(workflow.connections)),
    settings,
  };
}

const outputDirectory = path.resolve('workflows/n8n-2.28.6');
await mkdir(outputDirectory, { recursive: true });

for (const [workflowKind, workflowId] of Object.entries(workflowIds)) {
  const workflow = await fetchWorkflow(workflowId);
  const portable = createPortableWorkflow(workflow, workflowKind);
  const outputPath = path.join(outputDirectory, outputFiles[workflowKind]);
  await writeFile(outputPath, `${JSON.stringify(portable, null, 2)}\n`, 'utf8');
  console.log(`Exportado: ${outputPath}`);
}

await buildVersionedWorkflows();
