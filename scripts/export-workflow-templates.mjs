#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const requiredEnvironment = [
  'N8N_API_URL',
  'N8N_API_KEY',
  'N8N_CORE_WORKFLOW_ID',
  'N8N_AI_WORKFLOW_ID',
  'N8N_PUBLISHER_WORKFLOW_ID',
];

const missing = requiredEnvironment.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`);
}

const apiUrl = process.env.N8N_API_URL.replace(/\/$/, '');
const workflowIds = {
  core: process.env.N8N_CORE_WORKFLOW_ID,
  ai: process.env.N8N_AI_WORKFLOW_ID,
  publisher: process.env.N8N_PUBLISHER_WORKFLOW_ID,
};

const outputFiles = {
  core: 'core-documentation.json',
  ai: 'ai-enrichment.json',
  publisher: 'github-publisher.json',
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

  if (clean.type === 'n8n-nodes-base.executeWorkflow') {
    const targetIsAi = /enriquecimento com ia/i.test(clean.name);
    const placeholder = targetIsAi ? 'SELECT_AI_WORKFLOW_AFTER_IMPORT' : 'SELECT_CORE_WORKFLOW_AFTER_IMPORT';
    const targetName = targetIsAi
      ? 'AI - Enriquecimento da Documentação n8n'
      : 'Core - Documentação n8n (Dry Run)';

    clean.parameters.workflowId = {
      __rl: true,
      value: placeholder,
      mode: 'list',
      cachedResultName: targetName,
    };
  }

  if (workflowKind === 'core' && clean.name === 'Configuração') {
    const assignments = clean.parameters?.assignments?.assignments ?? [];
    clean.parameters.assignments.assignments = assignments.filter(
      (assignment) => !['githubOwner', 'githubRepository'].includes(assignment.name),
    );
  }

  if (workflowKind === 'publisher' && clean.name === 'Expandir arquivos') {
    clean.parameters.jsCode = clean.parameters.jsCode
      .replace(/const owner = "[^"]+";/, 'const owner = "YOUR_GITHUB_USER";')
      .replace(/const repository = "[^"]+";/, 'const repository = "YOUR_REPOSITORY";')
      .replace(/const branch = "[^"]+";/, 'const branch = "docs/generated";');
  }

  return clean;
}

function createPortableWorkflow(workflow, workflowKind) {
  const settings = {};
  if (workflow.settings?.executionOrder) settings.executionOrder = workflow.settings.executionOrder;
  if (workflow.settings?.callerPolicy) settings.callerPolicy = workflow.settings.callerPolicy;

  return {
    name: workflow.name,
    nodes: workflow.nodes.map((node) => sanitizeNode(node, workflowKind)),
    connections: replaceInstanceReferences(structuredClone(workflow.connections)),
    settings,
  };
}

const outputDirectory = path.resolve('workflows');
await mkdir(outputDirectory, { recursive: true });

for (const [workflowKind, workflowId] of Object.entries(workflowIds)) {
  const workflow = await fetchWorkflow(workflowId);
  const portable = createPortableWorkflow(workflow, workflowKind);
  const outputPath = path.join(outputDirectory, outputFiles[workflowKind]);
  await writeFile(outputPath, `${JSON.stringify(portable, null, 2)}\n`, 'utf8');
  console.log(`Exportado: ${outputPath}`);
}
