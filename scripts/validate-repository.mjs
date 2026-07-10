#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'README.md',
  '.env.example',
  '.github/workflows/validate.yml',
  'docs/INSTALLATION.md',
  'docs/CONFIGURATION.md',
  'docs/ARCHITECTURE.md',
  'docs/CONTRIBUTING-DOCUMENTS.md',
  'docs/SECURITY.md',
  'scripts/export-workflow-templates.mjs',
  'scripts/validate-repository.mjs',
  'workflows/core-documentation.json',
  'workflows/ai-enrichment.json',
  'workflows/github-publisher.json',
];

const errors = [];

for (const file of requiredFiles) {
  if (!existsSync(path.join(root, file))) errors.push(`Arquivo obrigatório ausente: ${file}`);
}

function containsCredentials(value) {
  if (!value || typeof value !== 'object') return false;
  if (Object.hasOwn(value, 'credentials')) return true;
  return Object.values(value).some(containsCredentials);
}

for (const file of requiredFiles.filter((name) => name.endsWith('.json'))) {
  const fullPath = path.join(root, file);
  if (!existsSync(fullPath)) continue;

  let workflow;
  try {
    workflow = JSON.parse(readFileSync(fullPath, 'utf8'));
  } catch (error) {
    errors.push(`${file}: JSON inválido (${error.message})`);
    continue;
  }

  const keys = Object.keys(workflow).sort();
  const expectedKeys = ['connections', 'name', 'nodes', 'settings'];
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    errors.push(`${file}: campos de topo inesperados: ${keys.join(', ')}`);
  }

  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    errors.push(`${file}: não possui nós`);
  }

  if (containsCredentials(workflow)) {
    errors.push(`${file}: contém referência de credencial`);
  }

  for (const node of workflow.nodes ?? []) {
    if (node.type !== 'n8n-nodes-base.executeWorkflow') continue;
    const target = node.parameters?.workflowId?.value;
    if (!String(target).startsWith('SELECT_')) {
      errors.push(`${file}: o nó ${node.name} contém ID de subworkflow específico da instância`);
    }
  }
}

function listFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    if (entry === '.git') return [];
    const fullPath = path.join(directory, entry);
    return statSync(fullPath).isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

for (const file of listFiles(root).filter((name) => name.endsWith('.md'))) {
  const content = readFileSync(file, 'utf8');
  const links = [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);

  for (const link of links) {
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    const target = decodeURIComponent(link.split('#')[0]);
    const resolved = path.resolve(path.dirname(file), target);
    if (!existsSync(resolved)) {
      errors.push(`${path.relative(root, file)}: link local inexistente: ${link}`);
    }
  }
}

const secretPatterns = [
  ['GitHub token', /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/],
  ['OpenAI key', /\bsk-[A-Za-z0-9_-]{20,}/],
  ['Google key', /\bAIza[A-Za-z0-9_-]{20,}/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['Bearer token', /Bearer\s+(?!TOKEN\b|PLACEHOLDER\b)[A-Za-z0-9._~+\/-]{20,}/i],
];

for (const file of listFiles(root)) {
  const content = readFileSync(file, 'utf8');
  for (const [label, pattern] of secretPatterns) {
    if (pattern.test(content)) errors.push(`${path.relative(root, file)}: possível ${label}`);
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log('Validação concluída: templates portáteis e nenhum segredo conhecido encontrado.');
