#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workflowFiles = [
  'core-documentation.json',
  'ai-enrichment.json',
  'github-publisher.json',
  'bootstrap-documentation.json',
  'bootstrap-form.json',
  'daily-maintenance.json',
];

const versionIds = {
  'core-documentation.json': '11212000-0000-4000-8000-000000000001',
  'ai-enrichment.json': '11212000-0000-4000-8000-000000000002',
  'github-publisher.json': '11212000-0000-4000-8000-000000000003',
  'bootstrap-documentation.json': '11212000-0000-4000-8000-000000000004',
  'bootstrap-form.json': '11212000-0000-4000-8000-000000000005',
  'daily-maintenance.json': '11212000-0000-4000-8000-000000000006',
};

function makeN8n11212Compatible(workflow, fileName) {
  const compatible = structuredClone(workflow);
  compatible.active = false;
  compatible.versionId = versionIds[fileName];

  compatible.nodes = compatible.nodes.map((node) => {
    const clean = structuredClone(node);

    if (clean.type === 'n8n-nodes-base.executeWorkflowTrigger') {
      clean.typeVersion = 1.1;
    }

    if (clean.type === 'n8n-nodes-base.formTrigger') {
      clean.typeVersion = 2.3;
      clean.parameters.authentication = 'basicAuth';
      delete clean.parameters.options?.includeUserInOutput;
    }

    if (clean.type === 'n8n-nodes-base.form') {
      clean.typeVersion = 2.3;
    }

    if (
      fileName === 'bootstrap-form.json'
      && clean.name === 'Preparar projetos para seleção'
      && typeof clean.parameters?.jsCode === 'string'
    ) {
      clean.parameters.jsCode = clean.parameters.jsCode
        .replace(/\n\s+fieldName:'(?:projectSlug|readmeStyle)',/g, '');
    }

    if (clean.type === '@n8n/n8n-nodes-langchain.lmChatGoogleGemini') {
      clean.typeVersion = 1;
    }

    if (clean.type === 'n8n-nodes-base.stickyNote' && typeof clean.parameters?.content === 'string') {
      clean.parameters.content = clean.parameters.content
        .replace('Exige login de usuário do n8n.', 'Exige autenticação HTTP Basic Auth.')
        .replace(
          'Configure autenticação `n8n User Auth` no Form Trigger.',
          'Configure **Basic Auth** e selecione uma credencial `HTTP Basic Auth` no Form Trigger.',
        );
    }

    return clean;
  });

  return compatible;
}

export async function buildVersionedWorkflows({ check = false } = {}) {
  const currentDirectory = path.resolve('workflows/n8n-2.28.6');
  const legacyDirectory = path.resolve('workflows/n8n-1.121.2');
  await mkdir(legacyDirectory, { recursive: true });

  const drift = [];
  for (const fileName of workflowFiles) {
    const source = JSON.parse(await readFile(path.join(currentDirectory, fileName), 'utf8'));
    const expected = `${JSON.stringify(makeN8n11212Compatible(source, fileName), null, 2)}\n`;
    const outputPath = path.join(legacyDirectory, fileName);

    if (check) {
      let actual = '';
      try {
        actual = await readFile(outputPath, 'utf8');
      } catch {
        // Reportado como divergência abaixo.
      }
      if (actual !== expected) drift.push(path.relative(process.cwd(), outputPath));
      continue;
    }

    await writeFile(outputPath, expected, 'utf8');
    console.log(`Gerado para n8n 1.121.2: ${outputPath}`);
  }

  if (drift.length > 0) {
    throw new Error(`Templates n8n 1.121.2 desatualizados: ${drift.join(', ')}`);
  }
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  await buildVersionedWorkflows({ check: process.argv.includes('--check') });
}
