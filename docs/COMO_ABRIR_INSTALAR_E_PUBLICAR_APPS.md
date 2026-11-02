# GitHub: abrir, instalar e publicar apps por link
**Guia operacional | `ninjaDX27` | 02/11/2026**

> **Não existe um botão universal para instalar qualquer repositório do GitHub.** Um repositório pode conter código-fonte, um programa com instalador, uma aplicação web, uma GitHub App ou apenas documentação. O procedimento depende do projeto.

## 1. Escolher o método certo

| O que encontraste | Abre pelo link? | O que fazer |
| --- | --- | --- |
| Website estático com GitHub Pages | Sim, quando publicado | Abrir o endereço `https://OWNER.github.io/REPO/`; não precisas de instalar |
| App web React/Vue/Next.js | Pode abrir em Codespaces ou ser publicada em Vercel | Requer construir/executar e, por vezes, contas e variáveis de ambiente |
| Programa desktop / Android | Sim, **se** existir instalador assinado em Releases | Abrir `Releases`, escolher o ficheiro correto e verificar proveniência e assinatura |
| Biblioteca Python/Node | Não é uma app de utilização direta | Seguir README e documentação de pacotes, instalar em ambiente isolado |
| GitHub App (Marketplace) | Sim, instalação na tua conta | Rever permissões e escolher *Only select repositories* |
| ZIP com código | Não significa app executável | Extrair, ler README, avaliar dependências, executar/build segundo instruções |

## 2. Abrir o código pelo navegador (sem instalar nada)

- Repositório: https://github.com/ninjaDX27/cro-landing-pages
- Editor VS Code no navegador: https://github.dev/ninjaDX27/cro-landing-pages

O `github.dev` permite **editar** código, mas **não executa um servidor de aplicações**. Para correr código na cloud utiliza Codespaces.

## 3. Executar uma app web com GitHub Codespaces (sem instalar Node no teu PC)

1. Abre **https://codespaces.new/ninjaDX27/cro-landing-pages**.
2. Confirma a conta GitHub e cria o Codespace. A configuração `.devcontainer` instala as dependências com `npm ci`.
3. Abre o terminal e executa `npm run dev -- --host 0.0.0.0`.
4. No separador **Ports**, encontra a porta **4175**; usa **Open in Browser**.
5. O resultado é uma **app de desenvolvimento temporária**, não um website público permanente.
6. Termina o Codespace quando não o estiveres a usar. Os limites mensais e a faturação dependem do teu plano.

**Atenção:** esta aplicação usa taxas e bancos **fictícios**, não propostas reais de crédito.

**Outros links úteis:**
- Abrir MarTech Tracking Lab em Codespaces: https://codespaces.new/ninjaDX27/martech-tracking-architecture (executar `npm test`, `npm run simulate`).
- Abrir Analytics Dashboards Lab em Codespaces: https://codespaces.new/ninjaDX27/analytics-dashboards (executar `npm test`, `npm run generate`).
- Abrir o teu portefólio no editor web: https://github.dev/ninjaDX27/diogopinto

## 4. Publicar uma app web com um link Vercel

Exemplo real do repositório **CRO Landing Pages**:

[Deploy com Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FninjaDX27%2Fcro-landing-pages)

1. Abre o link; inicia sessão ou cria conta Vercel.
2. Dá acesso ao GitHub **apenas ao repositório necessário**.
3. Confirma importação, framework Vite e comando de build `npm run build`.
4. Confirma que o output directory é `dist`, se não for detetado automaticamente.
5. Revê variáveis de ambiente exigidas (neste demo, não existem credenciais reais obrigatórias).
6. Clica em Deploy e **verifica o URL que a plataforma fornecer**.

A Vercel pode pedir autorização e cobrar pelo uso consoante plano; não existe deploy garantido só por abrir o link.

**Não uses este procedimento para uma aplicação de crédito real sem revisão jurídica, segurança, proteção de dados e informação bancária validada.**

## 5. Publicar o teu portefólio com GitHub Pages

- Definições: https://github.com/ninjaDX27/diogopinto/settings/pages
- Workflow preparado: https://github.com/ninjaDX27/diogopinto/actions/workflows/deploy-pages.yml
- **Estado observado em 02/11/2026:** a execução falhou porque o site Pages **não estava ativado**; o código do site existe.

Procedimento recomendado para o workflow já criado:
1. Abre **Settings → Pages → Build and deployment → Source**.
2. Escolhe **GitHub Actions** (este repositório já tem um workflow próprio).
3. Guarda.
4. Vai a **Actions → Deploy portfolio to GitHub Pages → Run workflow** ou reexecuta a tentativa anterior.
5. Confirma o URL que o GitHub apresentar em **Settings → Pages**.

O padrão de URL esperado é `https://ninjadx27.github.io/diogopinto/`, **não confirmado como publicado**.

> Não é possível ativar GitHub Pages automaticamente apenas com `GITHUB_TOKEN` no `actions/configure-pages@v5`: a criação inicial por `enablement: true` requer credencial diferente com permissões adequadas. Evita adicionar um Personal Access Token apenas para contornar um clique de configuração.

## 6. Instalar programas através de GitHub Releases

1. Visita o **repositório original e reconhecido** do software.
2. Abre a secção **Releases**; escolhe uma versão estável apropriada.
3. Expande **Assets** e identifica o instalador compatível (Windows, macOS, Linux ou Android, quando disponibilizado).
4. Verifica **hash SHA-256**, assinatura digital, notas de lançamento e instruções oficiais, quando disponíveis.
5. Só executa depois de verificar o editor. Um ZIP do **Code → Download ZIP** normalmente contém **código-fonte**, não um instalador.
6. Evita executar `curl | bash` ou scripts de terceiros sem leitura e verificação da origem.

**Não é seguro assumir que um repositório tem uma app pronta a instalar só por conter uma pasta `src`.**

## 7. Instalar uma GitHub App na tua conta

1. Usa https://github.com/marketplace?type=apps ou o link oficial `https://github.com/apps/NOME-DA-APP/installations/new`.
2. Seleciona conta pessoal; escolhe **Only select repositories** em vez de **All repositories**, salvo necessidade justificada.
3. Revê permissões de **Contents, Issues, Actions, Secrets, Administration** e preços.
4. Confirma apenas quando a app for de um fornecedor confiável.
5. Consulta https://github.com/settings/installations para gerir ou revogar.

GitHub Apps **não são apps de telemóvel**; são integrações que usam acesso aos repositórios ou eventos do GitHub.

## 8. Executar no teu computador (alternativa)

**CRO Vue/Vite:**

```bash
git clone https://github.com/ninjaDX27/cro-landing-pages.git
cd cro-landing-pages
npm ci
npm test
npm run dev
```

**Projeto Python:** abre https://github.com/ninjaDX27/diogopinto/tree/main/projects/customer-repurchase-propensity para comandos de geração de dados sintéticos e treino. Não publiques dados reais de clientes.

## 9. Checklist de segurança antes de instalar/publicar

- Verificar autor original, licença, última alteração, releases e documentação.
- Analisar dependências e alertas de segurança; não assumir que o número de estrelas comprova segurança.
- Não publicar ficheiros `.env`, tokens, chaves, documentos bancários ou PII.
- Nunca colar chaves secretas em parâmetros de URLs ou snippets públicos.
- Rever custos da cloud e configurar limites de utilização.
- Usar autenticação, acesso mínimo e rever permissões do GitHub App.
- Para dados financeiros e modelos preditivos, usar ambientes de demonstração e clarificar limitações.
- Antes de enviar a recrutadores, testar a instalação do zero e documentar os resultados.

## Documentação oficial

- GitHub Pages: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- GitHub Codespaces deep links: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/setting-up-your-repository/facilitating-quick-creation-and-resumption-of-codespaces
- Editor web: https://docs.github.com/en/codespaces/the-githubdev-web-based-editor
- GitHub Apps: https://docs.github.com/en/apps/using-github-apps/installing-a-github-app-from-a-third-party
- Vercel Deploy Button: https://vercel.com/docs/deploy-button
- Github Codespaces billing: https://docs.github.com/en/billing/concepts/product-billing/github-codespaces
- Download source and release: https://docs.github.com/en/repositories/working-with-files/using-files/downloading-files-from-github
