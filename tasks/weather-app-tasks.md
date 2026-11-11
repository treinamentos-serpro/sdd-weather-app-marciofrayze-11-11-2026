# Backlog — Weather App

**Entrada:** `plans/weather-app-plan.md`
**Status:** tarefas propostas. As decisões de produto pendentes são gates antes das tarefas que dependem delas; não implementar comportamento ainda não aprovado.

## Entregável 1 — Decisões e fundação

### T-01 — Definir provedor e contrato meteorológico

- **Descrição:** reconciliar a pergunta sobre fonte de dados na spec com a diretriz do repositório para Open-Meteo e fechar o contrato mínimo do clima atual e da previsão.
- **Critérios de aceite:**
  - A fonte de dados é aprovada ou substituída por decisão explícita.
  - Ficam definidos os campos do clima atual e por dia, a granularidade da previsão, se os cinco dias incluem hoje e a política de fuso horário.
  - `specs/weather-app-spec.md` e `plans/weather-app-plan.md` refletem as mesmas decisões e parâmetros.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Infra.

### T-02 — Definir preferências e critérios de experiência

- **Descrição:** fechar as decisões de interação e qualidade necessárias para que UI, mensagens e testes tenham critérios concretos.
- **Critérios de aceite:**
  - Ficam definidos unidade inicial e persistência da unidade, idioma, informações para distinguir cidades homônimas, navegadores/tamanhos de tela alvo e comportamento esperado em erro ou nova tentativa.
  - Requisitos ainda sem decisão são explicitamente adiados, sem serem tratados como implementados.
  - Spec e plano são atualizados consistentemente.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `specs/weather-app-spec.md`, `plans/weather-app-plan.md`.
- **Tipo:** Infra.

### T-03 — Preparar setup de testes unitários

- **Descrição:** completar o setup já referenciado por Vitest para testes de componentes e utilitários.
- **Critérios de aceite:**
  - `tests/setup.ts` existe e configura os matchers do Testing Library para Vitest.
  - Vitest carrega o setup definido em `vite.config.ts` sem erro.
  - Um teste de exemplo em `tests/unit/` é descoberto e passa por `pnpm test`.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `tests/setup.ts`, `tests/unit/setup.test.ts`, `vite.config.ts` (somente se o setup atual precisar de ajuste).
- **Tipo:** Infra.

## Entregável 2 — Modelos e serviços de dados

### T-04 — Definir modelos internos de clima

- **Descrição:** criar tipos TypeScript para cidade, observação atual, previsão diária, unidade e estado do fluxo, sem expor o payload bruto do provedor à UI.
- **Critérios de aceite:**
  - Tipos representam os campos aprovados em T-01 e T-02.
  - Campos que podem faltar na resposta externa são modelados como opcionais ou tratados na normalização.
  - O projeto compila em modo strict sem tipos `any` para os contratos principais.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data.

### T-05 — Implementar conversão de temperatura

- **Descrição:** implementar conversão pura a partir dos valores canônicos em Celsius e formatação conforme as decisões de precisão.
- **Critérios de aceite:**
  - Conversão de Celsius para Fahrenheit segue a fórmula acordada.
  - Valores de origem não são mutados nem convertidos cumulativamente ao alternar unidades.
  - Valores ausentes ou não finitos não são formatados como temperaturas válidas.
- **Dependências:** T-02, T-04.
- **Arquivos prováveis:** `src/utils/temperature.ts`.
- **Tipo:** Data.

### T-06 — Testar conversão e formatação de temperatura

- **Descrição:** cobrir os casos normais e limites da função de conversão com testes unitários.
- **Critérios de aceite:**
  - Testes cobrem conversões conhecidas nas duas escalas e a precisão aprovada.
  - Testes cobrem valor ausente e valor não finito conforme o contrato de T-05.
  - `pnpm test` executa os testes sem acessar rede.
- **Dependências:** T-03, T-05.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Tipo:** Test.

### T-07 — Implementar busca de cidades via geocoding

- **Descrição:** encapsular a chamada de busca ao provedor aprovado e normalizar resultados para o modelo `City`.
- **Critérios de aceite:**
  - O serviço envia o termo de busca e os parâmetros decididos, construindo a URL com `URLSearchParams`.
  - A resposta é convertida para `City` e preserva dados suficientes para desambiguação.
  - O serviço aceita `AbortSignal` e trata status HTTP inválido e resposta sem resultados sem acessar a UI.
- **Dependências:** T-01, T-04.
- **Arquivos prováveis:** `src/services/openMeteo.ts`, `src/types/weather.ts`.
- **Tipo:** Data.

### T-08 — Testar serviço de geocoding

- **Descrição:** validar a normalização e os erros do serviço de busca com respostas simuladas.
- **Critérios de aceite:**
  - Testes cobrem resposta válida com uma e várias cidades e lista vazia.
  - Testes cobrem erro HTTP, falha de rede, JSON inválido e cancelamento.
  - Nenhum teste depende de chamada real à API.
- **Dependências:** T-03, T-07.
- **Arquivos prováveis:** `tests/unit/openMeteo.test.ts`.
- **Tipo:** Test.

### T-09 — Implementar consulta de clima e previsão

- **Descrição:** encapsular a consulta meteorológica por coordenadas, validando e normalizando clima atual e previsão para cinco dias.
- **Critérios de aceite:**
  - O serviço solicita os campos e período aprovados em T-01.
  - Dados são associados às coordenadas consultadas e normalizados para os modelos internos.
  - Resposta incompleta ou inválida segue uma política explícita, e a chamada aceita `AbortSignal`.
- **Dependências:** T-01, T-04.
- **Arquivos prováveis:** `src/services/openMeteo.ts`, `src/types/weather.ts`.
- **Tipo:** Data.

### T-10 — Testar serviço de previsão

- **Descrição:** cobrir respostas meteorológicas válidas e falhas da API usando `fetch` simulado.
- **Critérios de aceite:**
  - Testes verificam parâmetros, normalização e cobertura das datas conforme a regra decidida em T-01.
  - Testes cobrem payload incompleto, HTTP não-2xx, falha de rede, JSON inválido e cancelamento.
  - Os testes são determinísticos e não acessam a API real.
- **Dependências:** T-03, T-09.
- **Arquivos prováveis:** `tests/unit/openMeteo.test.ts`.
- **Tipo:** Test.

## Entregável 3 — Interface e fluxo

### T-11 — Criar estrutura base da aplicação

- **Descrição:** conectar a entrada React à tela principal e preparar estilos responsivos e semânticos para os fluxos do app.
- **Critérios de aceite:**
  - A aplicação inicia pelo `src/main.tsx` e renderiza `App` sem erro.
  - A tela base respeita o tema e as dependências já configuradas no projeto.
  - O layout não impede o uso das funções principais em viewport móvel.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/index.css`.
- **Tipo:** UI.

### T-12 — Criar busca e seleção de cidades

- **Descrição:** implementar formulário de busca e apresentação selecionável dos resultados, incluindo identificação suficiente de localidades homônimas.
- **Critérios de aceite:**
  - Usuário pode submeter uma busca por teclado e por controle visível.
  - Entrada vazia não inicia requisição.
  - Resultados podem ser selecionados e distinguidos conforme os campos definidos em T-02.
  - Busca vazia e erro têm estado visível e acessível.
- **Dependências:** T-02, T-04, T-11.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`, `src/components/CityResults.tsx`, `src/components/WeatherStatus.tsx`.
- **Tipo:** UI.

### T-13 — Coordenar busca e consulta no hook

- **Descrição:** implementar o estado e as ações que conectam busca, seleção, consulta meteorológica e feedback de loading/erro/vazio.
- **Critérios de aceite:**
  - O estado representa fases válidas sem combinações contraditórias.
  - Selecionar uma cidade carrega clima atual e previsão e associa os dados à cidade selecionada.
  - Nova busca/seleção cancela ou descarta respostas obsoletas; elas não sobrescrevem os dados atuais.
  - Falhas e ausência de resultados podem ser apresentadas pela UI sem expor detalhes internos.
- **Dependências:** T-04, T-07, T-09, T-11.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Tipo:** Data.

### T-14 — Exibir clima atual e previsão

- **Descrição:** criar componentes de apresentação para a temperatura atual e os cinco dias, usando os campos aprovados.
- **Critérios de aceite:**
  - Clima atual e dias de previsão correspondem à cidade selecionada.
  - A previsão apresenta cinco dias segundo a regra aprovada em T-01.
  - Dados ausentes não são apresentados como valores válidos e estados indisponíveis são comunicados.
  - Componentes recebem dados por props e não fazem chamadas HTTP.
- **Dependências:** T-01, T-04, T-11.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/FiveDayForecast.tsx`, `src/components/WeatherStatus.tsx`.
- **Tipo:** UI.

### T-15 — Implementar controle de unidade

- **Descrição:** permitir alternar entre Celsius e Fahrenheit e propagar a escolha às temperaturas atuais e previstas.
- **Critérios de aceite:**
  - O controle expõe as duas opções com nomes acessíveis e suporta teclado.
  - Alternar a opção atualiza todas as temperaturas visíveis sem nova requisição.
  - Unidade inicial e eventual persistência seguem as decisões de T-02.
- **Dependências:** T-02, T-05, T-11.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/App.tsx`.
- **Tipo:** UI.

### T-16 — Integrar os fluxos na tela principal

- **Descrição:** compor busca, seleção, estado do clima, previsão e alternância de unidade em um fluxo completo.
- **Critérios de aceite:**
  - Usuário pode buscar e selecionar uma cidade, consultar clima atual e cinco dias e alternar a unidade.
  - Loading, vazio e erro são comunicados nos fluxos correspondentes.
  - Controles principais têm nomes acessíveis e funcionam por teclado.
  - Dados de outra cidade não permanecem identificados como se fossem da seleção atual.
- **Dependências:** T-12, T-13, T-14, T-15.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/WeatherStatus.tsx`.
- **Tipo:** UI.

## Entregável 4 — Verificação integrada

### T-17 — Testar interações dos componentes

- **Descrição:** validar as interações principais da tela com Testing Library e `user-event`.
- **Critérios de aceite:**
  - Testes cobrem busca, seleção, loading, vazio e erro.
  - Testes verificam clima atual, cinco dias e atualização das temperaturas ao alternar unidades.
  - Controles principais são localizáveis por role/label e podem ser operados por teclado.
  - Testes simulam serviços e não dependem da rede externa.
- **Dependências:** T-03, T-16.
- **Arquivos prováveis:** `tests/components/WeatherApp.test.tsx`.
- **Tipo:** Test.

### T-18 — Validar fluxo E2E em desktop e mobile

- **Descrição:** automatizar o fluxo completo de busca até alternância de unidade em navegador, incluindo viewport móvel.
- **Critérios de aceite:**
  - Teste E2E cobre busca, seleção de cidade, clima atual, previsão de cinco dias e alternância C/F.
  - Testes cobrem ao menos um resultado vazio e uma falha de serviço.
  - Respostas externas são interceptadas para tornar a execução determinística.
  - O fluxo principal passa nos projetos desktop e mobile configurados no Playwright.
- **Dependências:** T-16.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`, `playwright.config.ts` (somente se necessário para executar o cenário).
- **Tipo:** Test.

## Observações de execução

- A ordem respeita dependências funcionais; T-01 e T-02 são gates de produto e podem ser concluídas em paralelo.
- Os testes unitários e E2E devem usar fixtures determinísticas; não depender da disponibilidade da Open-Meteo.
- Após tarefas que alterem `src/` ou `tests/`, executar `pnpm lint`, `pnpm build` e `pnpm test`; após T-18, executar também `pnpm test:e2e`.
- Se decisões de produto forem adiadas, atualizar os critérios de aceite afetados para indicar explicitamente o que fica fora da entrega, em vez de assumir comportamento.
