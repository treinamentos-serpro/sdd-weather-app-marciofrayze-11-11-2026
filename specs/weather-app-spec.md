# Especificação — Weather App

**Status:** rascunho baseado no briefing e em `specs/discovery.md`. As perguntas em aberto abaixo precisam ser respondidas antes de decisões dependentes delas serem tratadas como definitivas.

## Overview

O produto é uma aplicação de previsão do tempo para que usuários pesquisem cidades, consultem o clima atual e uma previsão de cinco dias, e alternem a unidade de temperatura entre Celsius e Fahrenheit. A aplicação também deve ser utilizável em dispositivos móveis.

A especificação limita-se ao que foi solicitado e às convenções explícitas do projeto. Ela não escolhe fonte de dados, define uma lista completa de informações meteorológicas, nem fixa plataformas, idiomas ou metas de qualidade que não foram decididos. Esses pontos permanecem rastreados em **Open Questions**.

## Functional Requirements

- **FR-1 — Buscar cidades:** o sistema deve permitir que o usuário informe uma cidade para iniciar uma busca. A busca deve permitir que o usuário escolha uma cidade correspondente antes de consultar seu clima. Critérios de correspondência, apresentação dos resultados e estratégia de desambiguação precisam ser definidos.
- **FR-2 — Consultar clima atual:** após a seleção de uma cidade, o sistema deve apresentar informações do clima atual associadas à cidade selecionada. A temperatura deve poder ser apresentada na unidade escolhida pelo usuário. As demais medidas e condições a exibir ainda não foram especificadas.
- **FR-3 — Consultar previsão de cinco dias:** após a seleção de uma cidade, o sistema deve apresentar uma previsão que cubra cinco dias. Se os cinco dias incluem a data atual, a granularidade temporal e os valores apresentados por dia ainda precisam ser definidos.
- **FR-4 — Alternar unidade de temperatura:** o usuário deve poder alternar entre Celsius (°C) e Fahrenheit (°F). A temperatura exibida no clima atual e na previsão deve refletir a unidade selecionada. O escopo para outras medidas, a unidade inicial e a persistência da escolha ainda precisam ser decididos.
- **FR-5 — Comunicar estados da interface:** conforme as convenções do projeto, a interface deve comunicar carregamento, erro e ausência de resultados/dados quando esses estados ocorrerem. O conteúdo exato das mensagens e as ações de recuperação devem ser definidos na solução de UX.

## User Stories

- **US-1 — Encontrar uma cidade:** como usuário, quero buscar uma cidade e selecionar o resultado correto para consultar o clima da localidade desejada.
- **US-2 — Ver o clima atual:** como usuário, quero consultar o clima atual da cidade selecionada para entender as condições informadas para ela.
- **US-3 — Planejar os próximos dias:** como usuário, quero ver uma previsão cobrindo cinco dias para consultar as condições futuras da cidade selecionada.
- **US-4 — Escolher uma unidade familiar:** como usuário, quero alternar entre Celsius e Fahrenheit para ler as temperaturas na unidade que prefiro.
- **US-5 — Usar em um dispositivo móvel:** como usuário em dispositivo móvel, quero conseguir realizar a busca, consultar o clima e alternar a unidade para usar as funções principais fora de um computador.

## Acceptance Criteria

Os critérios abaixo são verificáveis sem antecipar decisões ainda não tomadas. Quando um critério depende de uma questão aberta, essa dependência está indicada.

- **AC-1 — Busca iniciada:** dado que a aplicação está disponível, quando o usuário informa uma cidade e inicia a busca, então a aplicação apresenta resultados correspondentes ou comunica que não encontrou resultados. O formato de entrada e a regra de correspondência dependem da decisão sobre busca e geocodificação.
- **AC-2 — Seleção de localidade:** dado que a busca retornou uma ou mais cidades, quando o usuário seleciona um resultado, então essa cidade passa a ser a localidade consultada. Se houver resultados homônimos, a interface deve permitir distinguir e selecionar a localidade desejada; os campos de desambiguação ainda precisam ser definidos.
- **AC-3 — Clima atual:** dado que uma cidade foi selecionada e há dados disponíveis, quando a consulta termina, então a interface apresenta o clima atual dessa cidade e a temperatura em uma das duas unidades suportadas. Os campos meteorológicos além da temperatura permanecem pendentes.
- **AC-4 — Previsão de cinco dias:** dado que uma cidade foi selecionada e há dados disponíveis, quando a consulta termina, então a interface apresenta dados de previsão associados a essa cidade e que cubram cinco dias. A interpretação exata dos cinco dias e os campos por dia dependem de decisão de produto.
- **AC-5 — Alternância de unidade:** dado que temperaturas estão visíveis, quando o usuário alterna de Celsius para Fahrenheit ou de Fahrenheit para Celsius, então as temperaturas do clima atual e da previsão passam a ser exibidas na unidade selecionada. O critério numérico de conversão e arredondamento deve ser definido na implementação derivada, preservando a precisão dos dados disponíveis.
- **AC-6 — Carregamento:** dado que uma busca ou consulta está em andamento, então a interface comunica que os dados estão sendo carregados e não apresenta o resultado como concluído antes de recebê-lo.
- **AC-7 — Falha ou ausência de dados:** dado que uma consulta falha ou não retorna dados utilizáveis, então a interface comunica que não foi possível apresentar o resultado. O texto e a disponibilidade de uma ação de nova tentativa dependem de decisão de UX.
- **AC-8 — Uso móvel:** dado que o usuário acessa a aplicação em um dispositivo móvel suportado, então consegue executar a busca, selecionar uma cidade, consultar clima e previsão e alternar unidades. A lista de dispositivos, navegadores e dimensões suportados precisa ser acordada para tornar a validação objetiva.
- **AC-9 — Acessibilidade de interação:** em conformidade com as convenções do projeto, os controles principais devem ter nomes acessíveis e permitir navegação e operação por teclado. Critérios adicionais de acessibilidade ainda precisam ser definidos.

## Non-Functional Requirements

- **NFR-1 — Usabilidade em dispositivos móveis (confirmado):** as funções principais devem ser utilizáveis em dispositivos móveis. Breakpoints, dimensões mínimas, navegadores e dispositivos-alvo não foram informados e precisam ser definidos antes de estabelecer uma matriz de compatibilidade.
- **NFR-2 — Acessibilidade de teclado e semântica (convenção do projeto):** controles devem usar semântica e rótulos acessíveis e oferecer suporte a teclado, conforme as instruções do repositório. Um padrão formal de conformidade e critérios de contraste ainda não foram especificados.
- **NFR-3 — Estados de interação (convenção do projeto):** a interface deve tratar carregamento, erro e estado vazio, sem deixar a busca ou a consulta sem feedback quando não há dados para apresentar.
- **NFR-4 — Desempenho, disponibilidade e atualização:** não há metas quantitativas ou política de atualização definidas. Limites e critérios para esses atributos devem ser acordados antes de serem usados como critérios de aceite.
- **NFR-5 — Idioma, privacidade e funcionamento offline:** o briefing não define idiomas, coleta de localização, retenção de preferências, cache ou suporte offline. Nenhuma garantia nesses aspectos é assumida nesta especificação.

## Edge Cases

- **Busca sem resultados:** informar ausência de resultados; o conteúdo e a ação seguinte ainda precisam ser definidos.
- **Cidade com nomes repetidos:** permitir que o usuário identifique a localidade desejada antes da consulta; os atributos apresentados para distingui-las são uma decisão em aberto.
- **Entrada vazia ou somente espaços:** não iniciar uma busca sem um nome de cidade utilizável; a validação visual e a mensagem precisam ser definidas.
- **Falha de rede ou indisponibilidade da fonte:** comunicar que a consulta não pôde ser concluída. Cache e nova tentativa não estão definidos.
- **Resposta sem dados suficientes:** não apresentar informações ausentes como se fossem válidas; informar que não há dados utilizáveis para a parte afetada.
- **Previsão incompleta:** se a fonte não fornecer todos os cinco dias, comunicar a limitação em vez de sugerir cobertura completa. A política de fallback precisa ser definida.
- **Mudança de unidade durante consulta:** aplicar a unidade atualmente selecionada às temperaturas exibidas quando os dados estiverem disponíveis, sem misturar °C e °F na mesma apresentação.
- **Limites do período de cinco dias:** a inclusão do dia atual e os efeitos de fuso horário podem mudar quais datas são exibidas; ambos dependem de decisão de produto e da fonte selecionada.
- **Tela móvel estreita:** busca, resultados, temperaturas, previsão e controle de unidade devem permanecer acessíveis sem que a função principal dependa de interação exclusiva de desktop. Os limites exatos de tela ainda precisam ser definidos.

## Assumptions

- A aplicação permite selecionar a cidade retornada pela busca; sem essa seleção, não há uma localidade definida para consultar.
- Celsius e Fahrenheit se referem à unidade de temperatura, e a alternância deve atualizar as temperaturas visíveis tanto no clima atual quanto na previsão.
- Não há outras suposições de produto confirmadas. Em particular, esta especificação não assume provedor, unidade inicial, persistência, geolocalização automática, idioma, autenticação ou funcionamento offline.

## Risks

| Risco | Probabilidade inicial | Impacto | Mitigação proposta |
| --- | --- | --- | --- |
| Cidades homônimas podem resultar na consulta da localidade errada. | Média | Alto | Definir critérios de desambiguação e validar a seleção antes de carregar os dados meteorológicos. |
| Indisponibilidade, latência ou limites da fonte podem impedir ou atrasar os resultados. | A avaliar | Alto | Selecionar a fonte e definir tratamento de falha, atualização e limites de uso antes da implementação. |
| Uma interpretação diferente de "cinco dias" pode gerar uma previsão com datas ou granularidade inesperadas. | Média | Médio | Resolver inclusão do dia atual, granularidade e fuso horário nos critérios de produto. |
| A unidade pode ser aplicada de forma inconsistente entre clima atual e previsão. | Média | Médio | Tratar a unidade como preferência comum para todas as temperaturas e verificar os dois contextos nos testes. |
| A experiência móvel pode falhar em telas, navegadores ou dispositivos não considerados. | A avaliar | Médio | Definir a matriz de suporte e validar os fluxos principais nela. |
| Dados parciais ou ausência de dados podem ser confundidos com uma previsão completa. | A avaliar | Alto | Definir estados de erro e dados parciais e evitar apresentar cobertura incompleta como completa. |

As probabilidades são estimativas preliminares, não dados medidos. Devem ser revistas após as decisões sobre fonte, dispositivos e comportamento de falha.

## Out of Scope

Não fazem parte do escopo confirmado pelo briefing atual. Podem ser reconsiderados se houver uma decisão explícita de produto:

- Geolocalização automática do usuário.
- Login, contas ou sincronização entre dispositivos.
- Favoritos, histórico de cidades ou persistência de pesquisas.
- Notificações ou alertas meteorológicos.
- Mapas, radar, imagens de satélite ou dados históricos.
- Operação offline ou cache de previsões.
- Detalhes meteorológicos além dos que forem definidos nas perguntas em aberto.

## Open Questions

1. Qual fonte deve fornecer geocodificação e dados meteorológicos? Quais cobertura, frequência de atualização, limites e custos são aceitáveis?
2. Como a busca deve interpretar nomes, acentos e entradas parciais? Quais informações devem distinguir cidades homônimas?
3. Quais campos devem aparecer no clima atual e em cada dia da previsão?
4. Os cinco dias incluem hoje ou começam amanhã? A previsão será diária ou horária, e qual fuso horário define as datas?
5. A alternância C/F vale somente para temperatura ou também para outros valores relacionados? Qual unidade deve ser selecionada inicialmente?
6. A unidade escolhida deve persistir após recarregar ou reabrir a aplicação? Se sim, por quanto tempo e onde?
7. É desejada geolocalização automática? Em que momento seria solicitada e qual alternativa existe para quem negar a permissão?
8. Quais dispositivos, navegadores e tamanhos de tela móveis são suportados?
9. Qual idioma ou conjunto de idiomas deve ser usado? Quais convenções de data, hora e descrição meteorológica são necessárias?
10. Qual é o comportamento esperado em falha de rede, falha da fonte, dados parciais ou dados desatualizados? Deve haver ação de nova tentativa ou cache?
11. Quais metas quantitativas de desempenho, disponibilidade, acessibilidade e atualização dos dados devem ser critérios de aceite?
12. A aplicação precisa de autenticação, histórico, favoritos ou alguma forma de persistência além da preferência de unidade?
