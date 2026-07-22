#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { buildVersionedWorkflows } from './build-versioned-workflows.mjs';

const root = process.cwd();
const workflowFileNames = [
  'core-documentation.json',
  'ai-enrichment.json',
  'github-publisher.json',
  'bootstrap-documentation.json',
  'bootstrap-form.json',
  'daily-maintenance.json',
];
const workflowVariants = ['n8n-2.28.6', 'n8n-1.121.2'];
const workflowFiles = workflowVariants.flatMap((variant) =>
  workflowFileNames.map((fileName) => `workflows/${variant}/${fileName}`));
const requiredProjectReadmeHeadings = [
  '## Contexto geral do projeto',
  '### Identificação',
  '#### Nome do projeto',
  '#### Tipo de projeto',
  '#### Data de início',
  '#### Término do projeto',
  '#### Responsáveis',
  '#### Repositório',
  '### Cliente ou empresa',
  '#### Nome do cliente',
  '#### Descrição da empresa',
  '#### Perfil e dinâmica de relacionamento',
  '##### Flexibilidade com prazos',
  '##### Frequência de respostas',
  '##### Pedidos fora do escopo',
  '### Descrição do produto',
  '## Identificação técnica',
  '### Nome do agente ou automação',
  '### Plataforma',
  '## O que a automação faz',
  '### Objetivo',
  '### Quem usa',
  '### Onde roda',
  '### O que dispara a automação',
  '### Fluxo principal',
  '## Como foi construída',
  '### Modelo',
  '### Integrações e APIs',
  '### Banco de dados',
  '### Gravação explicada',
  '## Workflows documentados',
  '## Arquitetura do fluxo',
  '## Prompts e lógicas do agente',
  '## Tools',
  '## Bugs conhecidos',
  '## Pontos que precisam de confirmação',
];
const requiredSeparatedReadmeHeadings = [
  '## Visão geral',
  '## Componentes',
  '## Fluxo principal',
  '## Entradas e saídas',
  '### Entradas',
  '### Saídas',
  '## Integrações',
  '## Operação',
  '## Arquitetura',
  '## Documentação detalhada',
];
const requiredTechnicalDocumentHeadings = [
  '## Visão técnica',
  '## Objetivo e escopo',
  '## Usuários e canais',
  '## Gatilhos e entradas',
  '## Fluxo principal',
  '## Workflows documentados',
  '## Arquitetura do fluxo',
  '## Integrações e APIs',
  '## Modelo e lógica de IA',
  '## Dados e persistência',
  '## Saídas',
  '## Operação e observabilidade',
  '## Tratamento de erros',
  '## Limitações técnicas',
  '## Pontos técnicos que precisam de confirmação',
];
const requiredInternalDocumentHeadings = [
  '## Identificação do projeto',
  '### Nome do projeto',
  '### Tipo de projeto',
  '### Data de início',
  '### Término ou status',
  '### Responsáveis',
  '### Repositório',
  '## Cliente ou empresa',
  '### Nome do cliente',
  '### Descrição da empresa',
  '### Perfil e dinâmica de relacionamento',
  '#### Flexibilidade com prazos',
  '#### Frequência de respostas',
  '#### Pedidos fora do escopo',
  '## Descrição do produto',
  '## Escopo e decisões',
  '## Riscos internos',
  '## Pendências internas',
];
const requiredDecisionsAndLearningsHeadings = [
  '## Como usar',
  '## Registro',
  '#### Contexto',
  '#### Decisão ou aprendizado',
  '#### Alternativas consideradas',
  '#### Consequências',
  '#### Evidências e referências',
  '#### Ações futuras',
];
const requiredReviewGuideHeadings = [
  '### Objetivo',
  '### Estrutura que deve ser revisada',
  '### Dados humanos obrigatórios',
  '### Validação técnica',
  '### Segurança',
  '### Como preparar o PR',
  '### Critérios para aprovação',
  '### Como finalizar',
];
const requiredWorkflowDocumentHeadings = [
  '## Papel no projeto',
  '## Gatilhos e entradas',
  '## Etapas principais',
  '## Integrações e credenciais',
  '## Dependências',
  '## Saídas',
  '## Tratamento de erros',
  '## Limitações e pontos de confirmação',
];
const requiredFiles = [
  'README.md',
  'projects/README.md',
  '.env.example',
  '.github/workflows/validate.yml',
  'docs/INSTALLATION.md',
  'docs/CONFIGURATION.md',
  'docs/ARCHITECTURE.md',
  'docs/CONTRIBUTING-DOCUMENTS.md',
  'docs/LIFECYCLE.md',
  'docs/MAINTAINING-TEMPLATES.md',
  'docs/COMPATIBILITY.md',
  'docs/SECURITY.md',
  'docs/inputs/README.md',
  'docs/inputs/core.md',
  'docs/inputs/ai-enrichment.md',
  'docs/inputs/github-publisher.md',
  'docs/inputs/bootstrap.md',
  'docs/inputs/bootstrap-form.md',
  'docs/inputs/daily-maintenance.md',
  'scripts/export-workflow-templates.mjs',
  'scripts/build-versioned-workflows.mjs',
  'scripts/validate-repository.mjs',
  ...workflowFiles,
];

const errors = [];

const configurationNodes = {
  'core-documentation.json': 'Configuração',
  'bootstrap-documentation.json': 'Configuração Bootstrap',
  'bootstrap-form.json': 'Configuração do formulário',
  'daily-maintenance.json': 'Configuração Maintenance',
};

for (const file of requiredFiles) {
  if (!existsSync(path.join(root, file))) errors.push(`Arquivo obrigatório ausente: ${file}`);
}

const projectsReadmePath = path.join(root, 'projects/README.md');
if (existsSync(projectsReadmePath)) {
  const projectsReadme = readFileSync(projectsReadmePath, 'utf8');
  const startMarker = '<!-- n8n-docs:pr-review:start -->';
  const endMarker = '<!-- n8n-docs:pr-review:end -->';
  const startIndex = projectsReadme.indexOf(startMarker);
  const endIndex = projectsReadme.indexOf(endMarker);
  if (startIndex < 0 || endIndex < startIndex) {
    errors.push('projects/README.md: marcadores da seção #pr-review ausentes ou fora de ordem');
  }
  if (projectsReadme.indexOf(startMarker, startIndex + startMarker.length) >= 0
    || projectsReadme.indexOf(endMarker, endIndex + endMarker.length) >= 0) {
    errors.push('projects/README.md: marcadores da seção #pr-review duplicados');
  }
  const reviewGuide = startIndex >= 0 && endIndex > startIndex
    ? projectsReadme.slice(startIndex, endIndex + endMarker.length)
    : '';
  if (!reviewGuide.includes('<a id="pr-review"></a>')
    || !reviewGuide.includes('## Roteiro de revisão dos PRs de documentação n8n')) {
    errors.push('projects/README.md: seção gerenciada #pr-review incompleta');
  }
  let previousReviewHeading = -1;
  for (const heading of requiredReviewGuideHeadings) {
    const index = reviewGuide.indexOf(heading);
    if (index < 0) errors.push(`projects/README.md#pr-review: seção obrigatória ausente: ${heading}`);
    else if (index <= previousReviewHeading) errors.push(`projects/README.md#pr-review: seção fora de ordem: ${heading}`);
    else previousReviewHeading = index;
  }
}
if (existsSync(path.join(root, 'PR_REVIEW.md'))) {
  errors.push('PR_REVIEW.md: arquivo legado deve ser incorporado a projects/README.md');
}

function containsCredentials(value) {
  if (!value || typeof value !== 'object') return false;
  if (Object.hasOwn(value, 'credentials')) return true;
  return Object.values(value).some(containsCredentials);
}

for (const file of workflowFiles) {
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
  const isN8n11212 = file.includes('/n8n-1.121.2/');
  const expectedKeys = isN8n11212
    ? ['active', 'connections', 'name', 'nodes', 'settings', 'versionId']
    : ['connections', 'name', 'nodes', 'settings'];
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    errors.push(`${file}: campos de topo inesperados: ${keys.join(', ')}`);
  }

  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    errors.push(`${file}: não possui nós`);
  }

  if (containsCredentials(workflow)) {
    errors.push(`${file}: contém referência de credencial`);
  }

  const inputSticky = workflow.nodes?.find(
    (node) => node.type === 'n8n-nodes-base.stickyNote'
      && /credenciais/i.test(String(node.parameters?.content))
      && /inputs|configuração/i.test(String(node.parameters?.content)),
  );
  if (!inputSticky) {
    errors.push(`${file}: não possui Sticky Note de inputs e credenciais`);
  }

  const fileName = path.basename(file);
  const configurationNodeName = configurationNodes[fileName];
  if (configurationNodeName) {
    const configurationNode = workflow.nodes?.find((node) => node.name === configurationNodeName);
    if (configurationNode?.type !== 'n8n-nodes-base.set') {
      errors.push(`${file}: ${configurationNodeName} precisa ser um Edit Fields`);
    }
  }

  for (const node of workflow.nodes ?? []) {
    if (node.type !== 'n8n-nodes-base.executeWorkflow') continue;
    const target = node.parameters?.workflowId?.value;
    if (!String(target).startsWith('SELECT_')) {
      errors.push(`${file}: o nó ${node.name} contém ID de subworkflow específico da instância`);
    }
  }

  if (isN8n11212) {
    if (workflow.active !== false) errors.push(`${file}: precisa ser importado inativo no n8n 1.121.2`);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(workflow.versionId)) {
      errors.push(`${file}: versionId inválido para o n8n 1.121.2`);
    }

    for (const node of workflow.nodes ?? []) {
      if (node.type === 'n8n-nodes-base.executeWorkflowTrigger' && node.typeVersion !== 1.1) {
        errors.push(`${file}: ${node.name} precisa usar Execute Workflow Trigger 1.1`);
      }
      if (node.type === 'n8n-nodes-base.form' && node.typeVersion !== 2.3) {
        errors.push(`${file}: ${node.name} precisa usar Form 2.3`);
      }
      if (node.type === '@n8n/n8n-nodes-langchain.lmChatGoogleGemini' && node.typeVersion !== 1) {
        errors.push(`${file}: ${node.name} precisa usar Google Gemini 1`);
      }
      if (node.type === 'n8n-nodes-base.formTrigger') {
        if (node.typeVersion !== 2.3) errors.push(`${file}: ${node.name} precisa usar Form Trigger 2.3`);
        if (node.parameters?.authentication !== 'basicAuth') {
          errors.push(`${file}: ${node.name} precisa usar Basic Auth no n8n 1.121.2`);
        }
        if (Object.hasOwn(node.parameters?.options ?? {}, 'includeUserInOutput')) {
          errors.push(`${file}: ${node.name} contém includeUserInOutput indisponível no n8n 1.121.2`);
        }
      }
    }
  }

  if (fileName === 'daily-maintenance.json') {
    const callsAi = workflow.nodes?.some(
      (node) => node.type === 'n8n-nodes-base.executeWorkflow'
        && /ia|enriquecimento/i.test(node.name),
    );
    if (callsAi) errors.push(`${file}: Maintenance não pode chamar IA`);
    const technicalPublication = workflow.nodes?.find(
      (node) => node.name === 'Preparar publicação técnica',
    )?.parameters?.jsCode ?? '';
    if (!technicalPublication.includes("remote.documentationLayout??'legacy'")
      || !technicalPublication.includes('remote.documentationSchemaVersion??1')) {
      errors.push(`${file}: Maintenance não preserva o contrato de documentação no project.json`);
    }
  }

  if (fileName === 'github-publisher.json') {
    const prepareCode = workflow.nodes?.find(
      (node) => node.name === 'Preparar commit atômico',
    )?.parameters?.jsCode ?? '';
    if (!prepareCode.includes("if(!filePath.startsWith('projects/')||invalidSegment)")
      || prepareCode.includes('allowedRootFile')) {
      errors.push(`${file}: Publisher não limita a escrita a projects/**`);
    }
    if (!prepareCode.includes("filePath!=='PR_REVIEW.md'")
      || !prepareCode.includes("sha:null")) {
      errors.push(`${file}: Publisher não limita a remoção ao PR_REVIEW.md legado`);
    }
    for (const value of [
      'inputs.length!==1',
      'Caminho duplicado no mesmo commit',
      "mode:'100644'",
      "type:'blob'",
      'content:contentValue',
    ]) {
      if (!prepareCode.includes(value)) {
        errors.push(`${file}: preparação atômica ausente ou incompleta (${value})`);
      }
    }

    const requiredAtomicNodes = [
      ['Consultar referência da branch', 'GET', '/git/ref/heads/'],
      ['Consultar commit base', 'GET', '/git/commits/'],
      ['Criar árvore completa', 'POST', '/git/trees'],
      ['Criar commit único', 'POST', '/git/commits'],
      ['Atualizar referência da branch', 'PATCH', '/git/refs/heads/'],
    ];
    for (const [nodeName, expectedMethod, urlFragment] of requiredAtomicNodes) {
      const node = workflow.nodes?.find((candidate) => candidate.name === nodeName);
      const method = node?.parameters?.method ?? 'GET';
      if (!node || method !== expectedMethod || !String(node.parameters?.url ?? '').includes(urlFragment)) {
        errors.push(`${file}: operação Git atômica inválida em ${nodeName}`);
      }
      if (node && (node.parameters?.authentication !== 'predefinedCredentialType'
        || node.parameters?.nodeCredentialType !== 'githubApi')) {
        errors.push(`${file}: ${nodeName} precisa usar credencial githubApi`);
      }
    }

    const treeCode = workflow.nodes?.find(
      (node) => node.name === 'Preparar nova árvore',
    )?.parameters?.jsCode ?? '';
    const commitCode = workflow.nodes?.find(
      (node) => node.name === 'Preparar commit único',
    )?.parameters?.jsCode ?? '';
    const refCode = workflow.nodes?.find(
      (node) => node.name === 'Preparar atualização da referência',
    )?.parameters?.jsCode ?? '';
    const summaryCode = workflow.nodes?.find(
      (node) => node.name === 'Resumo da publicação',
    )?.parameters?.jsCode ?? '';
    if (!treeCode.includes('base_tree:baseTreeSha')) {
      errors.push(`${file}: nova tree não preserva a tree base da branch`);
    }
    if (!commitCode.includes('parents:[context.baseCommitSha]')) {
      errors.push(`${file}: commit único não referencia o commit base como parent`);
    }
    if (!refCode.includes('force:false')) {
      errors.push(`${file}: atualização da referência precisa usar force=false`);
    }
    if (!summaryCode.includes('commitsCreated:result.changed?1:0')) {
      errors.push(`${file}: resumo não garante zero ou um commit por execução`);
    }
    for (const staleNode of ['Loop por arquivo', 'Criar ou atualizar no GitHub', 'Consultar arquivo existente']) {
      if (workflow.nodes?.some((node) => node.name === staleNode)) {
        errors.push(`${file}: Publisher ainda contém escrita arquivo a arquivo (${staleNode})`);
      }
    }
  }

  if (fileName === 'core-documentation.json') {
    const extractorCode = workflow.nodes?.find(
      (node) => node.name === 'Extrair, sanitizar e gerar documentos',
    )?.parameters?.jsCode ?? '';
    const summaryCode = workflow.nodes?.find(
      (node) => node.name === 'Resumo do Core',
    )?.parameters?.jsCode ?? '';
    for (const value of [
      'projectTags.length===0',
      "reason:'missing-project-tag'",
      'projectTags.length>1',
      "kind:'ignored'",
    ]) {
      if (!extractorCode.includes(value)) {
        errors.push(`${file}: Core não implementa a regra de tag ausente/ambígua (${value})`);
      }
    }
    for (const value of ['ignoredWorkflows', 'ignoredWorkflowNames']) {
      if (!summaryCode.includes(value)) {
        errors.push(`${file}: resumo do Core não apresenta ${value}`);
      }
    }
  }

  if (fileName === 'bootstrap-documentation.json') {
    const aiCall = workflow.nodes?.find(
      (node) => node.type === 'n8n-nodes-base.executeWorkflow'
        && /ia|enriquecimento/i.test(node.name),
    );
    if (!aiCall) errors.push(`${file}: Bootstrap precisa chamar a IA`);

    const publisherCall = workflow.nodes?.find((node) => node.name === 'Publicar Bootstrap');
    if (publisherCall?.parameters?.workflowId?.value !== 'SELECT_PUBLISHER_WORKFLOW_AFTER_IMPORT') {
      errors.push(`${file}: Publicar Bootstrap precisa apontar para o Publisher portátil`);
    }
    const selectProjectCode = workflow.nodes?.find((node) => node.name === 'Selecionar projeto')
      ?.parameters?.jsCode ?? '';
    for (const value of ['repositoryContext', 'owner:cfg.owner', 'repository:cfg.repository', 'repositoryUrl', 'readmeUrl', "'/blob/'", "'/README.md'", 'documentationLayout:cfg.documentationLayout']) {
      if (!selectProjectCode.includes(value)) {
        errors.push(`${file}: Selecionar projeto não encaminha o contexto de repositório (${value})`);
      }
    }
    const bootstrapConfiguration = workflow.nodes?.find(
      (node) => node.name === 'Configuração Bootstrap',
    );
    const bootstrapFields = bootstrapConfiguration?.parameters?.assignments?.assignments ?? [];
    if (!bootstrapFields.some((field) => field.name === 'documentationLayout' && field.value === 'separated')) {
      errors.push(`${file}: Configuração Bootstrap não fixa documentationLayout=separated`);
    }
    const validateBootstrapCode = workflow.nodes?.find(
      (node) => node.name === 'Validar primeira execução',
    )?.parameters?.jsCode ?? '';
    if (!validateBootstrapCode.includes("cfg.documentationLayout!=='separated'")) {
      errors.push(`${file}: Bootstrap não valida o layout separado`);
    }
    const previousReadmeNode = workflow.nodes?.find(
      (node) => node.name === 'Consultar README anterior',
    );
    if (previousReadmeNode?.type !== 'n8n-nodes-base.github'
      || previousReadmeNode?.parameters?.operation !== 'get'
      || !String(previousReadmeNode?.parameters?.filePath).includes('/README.md')) {
      errors.push(`${file}: Bootstrap não consulta o README anterior no GitHub`);
    }
    if (previousReadmeNode?.onError !== 'continueRegularOutput') {
      errors.push(`${file}: ausência de README anterior precisa permitir o primeiro Bootstrap`);
    }
    for (const [nodeName, expectedPath] of [
      ['Consultar documento técnico anterior', '/docs/TECHNICAL.md'],
      ['Consultar documento interno anterior', '/docs/INTERNAL.md'],
      ['Consultar decisões e aprendizados anteriores', '/docs/DECISIONS_AND_LEARNINGS.md'],
      ['Consultar README da pasta projects', 'projects/README.md'],
      ['Consultar PR_REVIEW legado', 'PR_REVIEW.md'],
    ]) {
      const previousNode = workflow.nodes?.find((node) => node.name === nodeName);
      if (previousNode?.type !== 'n8n-nodes-base.github'
        || previousNode?.parameters?.operation !== 'get'
        || !String(previousNode?.parameters?.filePath).includes(expectedPath)
        || previousNode?.onError !== 'continueRegularOutput') {
        errors.push(`${file}: Bootstrap não consulta opcionalmente ${expectedPath}`);
      }
    }
    const attachPreviousCode = workflow.nodes?.find(
      (node) => node.name === 'Anexar documentação anterior',
    )?.parameters?.jsCode ?? '';
    for (const value of [
      'previousDocumentation',
      "decodeFile('Consultar README anterior')",
      "decodeFile('Consultar documento técnico anterior')",
      "decodeFile('Consultar documento interno anterior')",
      "decodeFile('Consultar decisões e aprendizados anteriores')",
      "decodeFile('Consultar README da pasta projects')",
      "decodeFile('Consultar PR_REVIEW legado')",
      'projectsIndexReadme',
      'decisionsAndLearnings',
      'legacyReviewFileExists',
      'maximumBytes=120000',
      'REDACTED_TOKEN',
      'REDACTED_VALUE',
      "documentationLayout:'separated'",
    ]) {
      if (!attachPreviousCode.includes(value)) {
        errors.push(`${file}: preparação do README anterior incompleta (${value})`);
      }
    }
    const selectedTarget = workflow.connections?.['Selecionar projeto']?.main?.[0]?.[0]?.node;
    const readmeTarget = workflow.connections?.['Consultar README anterior']?.main?.[0]?.[0]?.node;
    const technicalTarget = workflow.connections?.['Consultar documento técnico anterior']?.main?.[0]?.[0]?.node;
    const internalTarget = workflow.connections?.['Consultar documento interno anterior']?.main?.[0]?.[0]?.node;
    const decisionsTarget = workflow.connections?.['Consultar decisões e aprendizados anteriores']?.main?.[0]?.[0]?.node;
    const projectsReadmeTarget = workflow.connections?.['Consultar README da pasta projects']?.main?.[0]?.[0]?.node;
    const legacyReviewTarget = workflow.connections?.['Consultar PR_REVIEW legado']?.main?.[0]?.[0]?.node;
    const attachTarget = workflow.connections?.['Anexar documentação anterior']?.main?.[0]?.[0]?.node;
    if (selectedTarget !== 'Consultar README anterior'
      || readmeTarget !== 'Consultar documento técnico anterior'
      || technicalTarget !== 'Consultar documento interno anterior'
      || internalTarget !== 'Consultar decisões e aprendizados anteriores'
      || decisionsTarget !== 'Consultar README da pasta projects'
      || projectsReadmeTarget !== 'Consultar PR_REVIEW legado'
      || legacyReviewTarget !== 'Anexar documentação anterior'
      || attachTarget !== 'Executar enriquecimento inicial') {
      errors.push(`${file}: sequência de preservação dos documentos anteriores está desconectada`);
    }
    const publicationCode = workflow.nodes?.find(
      (node) => node.name === 'Preparar publicação inicial',
    )?.parameters?.jsCode ?? '';
    if (!publicationCode.includes("documentationLayout:'separated'")
      || !publicationCode.includes('documentationSchemaVersion:2')) {
      errors.push(`${file}: project.json publicado não registra o contrato separado`);
    }
    if (!publicationCode.includes("file==='projects/README.md'")
      || !publicationCode.includes('project.repositoryFiles')
      || !publicationCode.includes('project.repositoryDeletePaths')
      || !publicationCode.includes("file==='PR_REVIEW.md'")) {
      errors.push(`${file}: Bootstrap não migra o roteiro para projects/README.md`);
    }
  }

  if (fileName === 'bootstrap-form.json') {
    const trigger = workflow.nodes?.find((node) => node.name === 'Abrir formulário de documentação');
    const fields = trigger?.parameters?.formFields?.values ?? [];
    if (fields.some((field) => field.fieldName === 'confirmLoad')) {
      errors.push(`${file}: formulário ainda contém confirmação manual confirmLoad`);
    }
    const loadProjects = fields.find((field) => field.fieldName === 'loadProjects');
    if (loadProjects?.fieldType !== 'hiddenField' || String(loadProjects?.fieldValue) !== 'true') {
      errors.push(`${file}: formulário precisa do campo oculto loadProjects=true`);
    }
    if (workflow.nodes?.some((node) => node.name === 'Confirmar conclusão')) {
      errors.push(`${file}: tela final não deve ser nomeada como confirmação`);
    }
    const selectorCode = workflow.nodes?.find((node) => node.name === 'Preparar projetos para seleção')
      ?.parameters?.jsCode ?? '';
    if (!selectorCode.includes("fieldLabel:'Projeto'") || !selectorCode.includes("fieldType:'dropdown'")) {
      errors.push(`${file}: seleção dinâmica de projectSlug não encontrada`);
    }
    if (selectorCode.includes("fieldLabel:'Estilo do README'") || selectorCode.includes("fieldName:'readmeStyle'")) {
      errors.push(`${file}: formulário ainda pede um estilo, mas o pacote agora é sempre separado`);
    }
    if (!selectorCode.includes('publishedProjects')) {
      errors.push(`${file}: formulário não identifica projetos já publicados`);
    }
    if (isN8n11212 && /fieldName:'projectSlug'/.test(selectorCode)) {
      errors.push(`${file}: JSON do Form não pode usar fieldName dinâmico, incompatível com n8n 1.121.2`);
    }
    const selectionValidator = workflow.nodes?.find((node) => node.name === 'Validar seleção')
      ?.parameters?.jsCode ?? '';
    if (!selectionValidator.includes('$json.Projeto')) {
      errors.push(`${file}: validação não normaliza o campo Projeto da versão 1.121.2`);
    }
    for (const value of ['forceBootstrap:alreadyPublished', "documentationLayout:'separated'"]) {
      if (!selectionValidator.includes(value)) {
        errors.push(`${file}: validação do pacote separado incompleta (${value})`);
      }
    }
    const projectForm = workflow.nodes?.find((node) => node.name === 'Escolher projeto');
    if (projectForm?.parameters?.jsonOutput !== '={{ $json.formDefinition }}') {
      errors.push(`${file}: Escolher projeto precisa receber formDefinition diretamente`);
    }
  }

  if (fileName === 'ai-enrichment.json') {
    const prepareCode = workflow.nodes?.find((node) => node.name === 'Preparar dados sanitizados')
      ?.parameters?.jsCode ?? '';
    const agentPrompt = workflow.nodes?.find((node) => node.name === 'Gerar enriquecimento estruturado')
      ?.parameters?.text ?? '';
    const builderCode = workflow.nodes?.find((node) => node.name === 'Montar documento para revisão')
      ?.parameters?.jsCode ?? '';
    const parserExample = workflow.nodes?.find((node) => node.name === 'Parser estruturado')
      ?.parameters?.jsonSchemaExample ?? '';
    try {
      JSON.parse(parserExample);
    } catch (error) {
      errors.push(`${file}: exemplo do Parser estruturado não é JSON válido (${error.message})`);
    }
    for (const heading of requiredTechnicalDocumentHeadings) {
      if (!['## Workflows documentados', '## Arquitetura do fluxo'].includes(heading)) {
        if (!agentPrompt.includes(heading)) errors.push(`${file}: prompt técnico não exige ${heading}`);
        if (!parserExample.includes(heading)) errors.push(`${file}: schema técnico não exemplifica ${heading}`);
      }
      if (!builderCode.includes(heading)) errors.push(`${file}: montagem técnica não trata ${heading}`);
    }
    for (const heading of requiredInternalDocumentHeadings) {
      if (!agentPrompt.includes(heading)) errors.push(`${file}: prompt interno não exige ${heading}`);
      if (!parserExample.includes(heading)) errors.push(`${file}: schema interno não exemplifica ${heading}`);
      if (!builderCode.includes(heading)) errors.push(`${file}: montagem interna não valida ${heading}`);
    }
    for (const heading of requiredSeparatedReadmeHeadings) {
      if (!builderCode.includes(heading)) errors.push(`${file}: README de navegação não contém ${heading}`);
    }
    for (const value of [
      "extractSection(technicalMarkdown,'## Fluxo principal')",
      "extractSection(technicalMarkdown,'## Gatilhos e entradas')",
      "extractSection(technicalMarkdown,'## Saídas')",
      "extractSection(technicalMarkdown,'## Integrações e APIs')",
      "extractSection(technicalMarkdown,'## Operação e observabilidade')",
      "fence+'mermaid',architectureMermaid,fence",
      "docs/workflows/'+component.workflowSlug+'.md",
    ]) {
      if (!builderCode.includes(value)) errors.push(`${file}: README operacional não reutiliza o conteúdo validado (${value})`);
    }
    if (!agentPrompt.includes('workflow de entrada ou fluxo prioritário')) {
      errors.push(`${file}: prompt não orienta a identificação do fluxo prioritário`);
    }
    for (const heading of requiredReviewGuideHeadings) {
      if (!builderCode.includes(heading)) errors.push(`${file}: roteiro do PR não contém ${heading}`);
    }
    for (const heading of requiredWorkflowDocumentHeadings) {
      if (!agentPrompt.includes(heading)) errors.push(`${file}: prompt não exige ${heading} por workflow`);
      if (!parserExample.includes(heading)) errors.push(`${file}: schema não exemplifica ${heading} por workflow`);
      if (!builderCode.includes(heading)) errors.push(`${file}: montagem não valida ${heading} por workflow`);
    }
    for (const output of [
      "'README.md':readme",
      "'docs/TECHNICAL.md':technicalWithGenerated",
      "'docs/INTERNAL.md':internalMarkdown",
      "'docs/DECISIONS_AND_LEARNINGS.md':decisionsAndLearnings",
      "'projects/README.md':projectsReadme.trim()",
      'repositoryFiles',
      'repositoryDeletePaths',
      "humanFiles['docs/workflows/",
    ]) {
      if (!builderCode.includes(output)) errors.push(`${file}: saída humana ausente (${output})`);
    }
    if (!builderCode.includes("humanFiles['docs/workflows/")) {
      errors.push(`${file}: montagem não cria docs/workflows/<slug>.md`);
    }
    if (!builderCode.includes('missingDocuments.length')) {
      errors.push(`${file}: montagem não bloqueia documentação individual ausente`);
    }
    if (!builderCode.includes('documentationSchemaVersion:2')) {
      errors.push(`${file}: montagem não registra documentationSchemaVersion 2`);
    }
    if (!builderCode.includes('technicalDocumentSchemaVersion:1')
      || !builderCode.includes('internalDocumentSchemaVersion:1')) {
      errors.push(`${file}: montagem não registra as versões dos documentos separados`);
    }
    if (!builderCode.includes('workflowDocumentSchemaVersion:1')) {
      errors.push(`${file}: montagem não registra workflowDocumentSchemaVersion 1`);
    }
    if (!builderCode.includes('decisionsAndLearningsDocumentSchemaVersion:1')
      || !builderCode.includes('decisionsAndLearningsPreserved:Boolean(existingDecisionsAndLearnings)')) {
      errors.push(`${file}: montagem não registra nem preserva o contrato de decisões e aprendizados`);
    }
    if (!agentPrompt.includes('ID["rótulo"]')) {
      errors.push(`${file}: prompt não exige rótulos Mermaid entre aspas`);
    }
    if (!agentPrompt.includes('{{ JSON.stringify($json.aiInput) }}')) {
      errors.push(`${file}: prompt não incorpora o contexto sanitizado dinamicamente`);
    }
    if (!prepareCode.includes('previousDocumentation:candidate.previousDocumentation??null')) {
      errors.push(`${file}: preparação da IA não encaminha previousDocumentation`);
    }
    if (!prepareCode.includes("documentationLayout:'separated'")
      || !agentPrompt.includes('technicalMarkdown')
      || !agentPrompt.includes('internalMarkdown')) {
      errors.push(`${file}: IA não implementa o pacote técnico e interno separado`);
    }
    for (const value of [
      'preserve e reorganize todo conteúdo factual anterior',
      'readmeMarkdown pode conter o documento legado',
      'technicalMarkdown é o documento técnico anterior',
      'internalMarkdown é o documento interno anterior',
    ]) {
      if (!agentPrompt.includes(value)) {
        errors.push(`${file}: prompt não garante preservação da documentação anterior (${value})`);
      }
    }
    if (!prepareCode.includes('aiInput') || prepareCode.includes('requiredReadmeStructure') || prepareCode.includes('aiPrompt')) {
      errors.push(`${file}: Code de preparação deve tratar apenas dados, sem manter o template editorial`);
    }
    if (prepareCode.includes('projectsIndexReadme') || prepareCode.includes('decisionsAndLearnings')) {
      errors.push(`${file}: arquivos preservados não podem entrar no aiInput enviado ao modelo`);
    }
    if (!builderCode.includes("$('Preparar dados sanitizados').item.json")
      || !builderCode.includes('const {aiInput,previousDocumentation,projectsIndexReadme,decisionsAndLearnings:sourceDecisionsAndLearnings,legacyReviewFileExists,...base}=source;')
      || !builderCode.includes('previousDocumentationUsed')) {
      errors.push(`${file}: montagem não usa nem remove corretamente o contexto técnico aiInput`);
    }
    if (!builderCode.includes('normalizeMermaid')) {
      errors.push(`${file}: montagem não normaliza rótulos Mermaid para o GitHub`);
    }
    if (!builderCode.includes('rótulo retangular sem aspas')) {
      errors.push(`${file}: montagem não bloqueia rótulos Mermaid inseguros`);
    }
    if (!parserExample.includes('A[\\"Workflow principal\\"]')) {
      errors.push(`${file}: schema não exemplifica rótulos Mermaid entre aspas`);
    }
    for (const value of ['### Dados humanos obrigatórios', '### Validação técnica', '### Como preparar o PR', '### Critérios para aprovação', '### Como finalizar', 'pendingReviewItems:pending']) {
      if (!builderCode.includes(value)) errors.push(`${file}: roteiro de revisão incompleto (${value})`);
    }
    for (const value of [
      '../README.md#pr-review',
      'n8n-docs:pr-review:start',
      'n8n-docs:pr-review:end',
      'existingProjectsReadme',
      "source.legacyReviewFileExists?['PR_REVIEW.md']:[]",
      "existingDecisionsAndLearnings||decisionsTemplate",
    ]) {
      if (!builderCode.includes(value)) errors.push(`${file}: migração do roteiro para projects/README.md incompleta (${value})`);
    }
    if (builderCode.includes('docs/architecture.mmd')) {
      errors.push(`${file}: montagem ainda publica docs/architecture.mmd`);
    }
  }
}

try {
  await buildVersionedWorkflows({ check: true });
} catch (error) {
  errors.push(error.message);
}

const projectsDirectory = path.join(root, 'projects');
if (existsSync(projectsDirectory)) {
  for (const project of readdirSync(projectsDirectory)) {
    const readmePath = path.join(projectsDirectory, project, 'README.md');
    if (!existsSync(readmePath)) continue;
    const content = readFileSync(readmePath, 'utf8');
    const manifestPath = path.join(projectsDirectory, project, 'project.json');
    let manifest = null;
    if (existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      } catch (error) {
        errors.push(`projects/${project}/project.json: JSON inválido (${error.message})`);
      }
    }
    const separated = manifest?.documentationSchemaVersion === 2
      && manifest?.documentationLayout === 'separated';
    const requiredHeadings = separated
      ? requiredSeparatedReadmeHeadings
      : requiredProjectReadmeHeadings;
    let previousIndex = -1;
    for (const heading of requiredHeadings) {
      const index = content.indexOf(heading);
      if (index < 0) errors.push(`projects/${project}/README.md: seção obrigatória ausente: ${heading}`);
      else if (index <= previousIndex) errors.push(`projects/${project}/README.md: seção fora de ordem: ${heading}`);
      else previousIndex = index;
    }
    const architecturePath = path.join(projectsDirectory, project, 'docs', 'architecture.mmd');
    if (existsSync(architecturePath)) {
      errors.push(`projects/${project}/docs/architecture.mmd: arquivo obsoleto; o Mermaid deve ficar no documento humano principal do contrato`);
    }

    if (!manifest) continue;
    let technicalContent = content;
    if (separated) {
      for (const [relativePath, headings] of [
        ['docs/TECHNICAL.md', requiredTechnicalDocumentHeadings],
        ['docs/INTERNAL.md', requiredInternalDocumentHeadings],
        ['docs/DECISIONS_AND_LEARNINGS.md', requiredDecisionsAndLearningsHeadings],
      ]) {
        const documentPath = path.join(projectsDirectory, project, relativePath);
        if (!existsSync(documentPath)) {
          errors.push(`projects/${project}/${relativePath}: documento obrigatório ausente`);
          continue;
        }
        const document = readFileSync(documentPath, 'utf8');
        if (relativePath === 'docs/TECHNICAL.md') technicalContent = document;
        let previousHeadingIndex = -1;
        for (const heading of headings) {
          const index = document.indexOf(heading);
          if (index < 0) errors.push(`projects/${project}/${relativePath}: seção ausente: ${heading}`);
          else if (index <= previousHeadingIndex) {
            errors.push(`projects/${project}/${relativePath}: seção fora de ordem: ${heading}`);
          } else previousHeadingIndex = index;
        }
      }
      for (const link of ['docs/TECHNICAL.md', 'docs/INTERNAL.md', 'docs/DECISIONS_AND_LEARNINGS.md', '../README.md#pr-review']) {
        if (!content.includes(`](${link})`)) {
          errors.push(`projects/${project}/README.md: link ausente para ${link}`);
        }
      }
    }
    for (const workflow of manifest.workflows ?? []) {
      const relativeDocument = `docs/workflows/${workflow.workflowSlug}.md`;
      const documentPath = path.join(projectsDirectory, project, relativeDocument);
      const expectedLink = separated
        ? `](workflows/${workflow.workflowSlug}.md)`
        : `](${relativeDocument})`;
      if (!technicalContent.includes(expectedLink)) {
        errors.push(`projects/${project}: link ausente para ${relativeDocument}`);
      }
      if (!existsSync(documentPath)) {
        errors.push(`projects/${project}/${relativeDocument}: documento individual ausente`);
        continue;
      }
      const document = readFileSync(documentPath, 'utf8');
      if (!document.startsWith('# ')) {
        errors.push(`projects/${project}/${relativeDocument}: precisa começar com H1`);
      }
      let previousDocumentIndex = -1;
      for (const heading of requiredWorkflowDocumentHeadings) {
        const index = document.indexOf(heading);
        if (index < 0) errors.push(`projects/${project}/${relativeDocument}: seção ausente: ${heading}`);
        else if (index <= previousDocumentIndex) {
          errors.push(`projects/${project}/${relativeDocument}: seção fora de ordem: ${heading}`);
        } else previousDocumentIndex = index;
      }
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
