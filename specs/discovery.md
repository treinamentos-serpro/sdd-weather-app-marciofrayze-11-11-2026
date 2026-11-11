# Discovery — Aplicação de previsão do tempo

## Contexto

O briefing solicita uma aplicação de previsão do tempo na qual usuários possam buscar cidades, consultar o clima atual, ver a previsão de 5 dias e alternar entre Celsius e Fahrenheit. O uso em dispositivos móveis também é um requisito. O briefing não define fonte de dados, público-alvo específico, plataforma, nem detalhes sobre quais informações meteorológicas devem ser exibidas.

## Requisitos Funcionais

- **RF1 — Buscar cidades:** permitir que o usuário pesquise cidades. O critério de busca, a seleção entre resultados homônimos e o comportamento sem resultados ainda precisam ser definidos.
- **RF2 — Consultar clima atual:** apresentar o clima atual da cidade selecionada. Quais medidas e condições compõem essa apresentação ainda precisam ser definidas.
- **RF3 — Consultar previsão de 5 dias:** apresentar uma previsão para cinco dias. A contagem dos dias e os dados exibidos em cada dia ainda precisam ser definidos.
- **RF4 — Alternar unidades:** permitir alternância entre Celsius e Fahrenheit. O escopo da conversão (por exemplo, quais valores são convertidos) e a persistência da preferência ainda precisam ser definidos.

## Requisitos Nao-Funcionais

- **RNF1 — Uso em dispositivos móveis:** a aplicação deve poder ser usada em dispositivos móveis. Dimensões de tela, navegadores suportados e critérios de validação da experiência ainda precisam ser definidos.

O briefing não especifica metas de desempenho, acessibilidade, disponibilidade, segurança, suporte a idiomas ou funcionamento offline. Esses aspectos não são tratados como requisitos confirmados e devem ser avaliados antes da especificação detalhada.

## Riscos

As estimativas abaixo são iniciais e devem ser revistas quando as decisões em aberto forem respondidas.

| Risco | Probabilidade inicial | Impacto potencial | Mitigacao proposta |
| --- | --- | --- | --- |
| Resultados de cidades homônimas podem levar a uma previsão da localidade errada. | Média | Alto | Definir como distinguir resultados e quais dados de localização apresentar para seleção. |
| Indisponibilidade ou atraso na fonte de dados pode impedir ou prejudicar a consulta. | A avaliar | Alto | Escolher a fonte e definir os comportamentos para erro, indisponibilidade e dados desatualizados. |
| Interpretações diferentes de "previsão de 5 dias" podem produzir resultados inconsistentes com a expectativa do usuário. | Média | Médio | Definir se a contagem inclui o dia atual e qual granularidade será apresentada. |
| Uma alternância de unidade aplicada apenas a parte dos valores pode gerar leitura inconsistente. | Média | Médio | Definir quais valores dependem da unidade e validar a consistência da exibição. |
| A experiência pode não funcionar bem em alguns dispositivos móveis ou tamanhos de tela. | A avaliar | Médio | Definir dispositivos e navegadores-alvo e validar a interface nesses contextos. |

## Perguntas em Aberto (Open Questions)

1. Qual fonte de dados meteorológicos e de localização deve ser usada? **Impacto:** determina cobertura, atualização, limites de uso, custos e dependências técnicas.
2. Como a busca de cidades deve funcionar e como o usuário escolhe entre cidades com o mesmo nome? **Impacto:** afeta a precisão da localização e o fluxo de busca.
3. O que deve ser exibido no clima atual (por exemplo, temperatura, condição, vento ou precipitação)? **Impacto:** define o conteúdo e a organização da tela.
4. Os cinco dias incluem o dia atual ou começam no dia seguinte? A previsão deve ser diária ou horária? **Impacto:** altera o período, a quantidade de dados e a apresentação.
5. Quais valores, além da temperatura, devem alternar entre Celsius e Fahrenheit? **Impacto:** evita unidades inconsistentes ou conversões inesperadas.
6. Qual deve ser a unidade inicial e a preferência deve ser mantida entre visitas? **Impacto:** define a experiência inicial e se é necessária persistência local.
7. A aplicação deve obter a localização do usuário automaticamente ou somente após uma busca? **Impacto:** afeta permissões, privacidade e o fluxo inicial.
8. Quais dispositivos, tamanhos de tela e navegadores móveis precisam ser suportados? **Impacto:** define escopo de compatibilidade e validação.
9. Quais idiomas devem estar disponíveis? **Impacto:** afeta textos, formatos de data e apresentação de unidades.
10. Qual comportamento é esperado quando não há rede ou a fonte de dados falha? **Impacto:** define estados de erro, possibilidade de nova tentativa e eventual necessidade de cache.
11. Há metas de desempenho, acessibilidade ou atualização dos dados? **Impacto:** sem critérios, não há como validar esses atributos de qualidade de forma objetiva.

## Suposicoes (Assumptions)

- Nenhuma suposição de produto foi confirmada além dos requisitos explicitamente descritos no briefing.
- Plataforma, fonte de dados, política de localização, conteúdo meteorológico, padrões de qualidade e persistência permanecem indefinidos; não devem ser tratados como decisões tomadas nesta etapa.
