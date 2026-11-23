# Como contribuir

Obrigado por querer ajudar. O Lentes existe para quem está com uma câmera do iPhone quebrada, então toda mudança precisa continuar simples, leve e funcionando offline.

## Relatos são a contribuição mais valiosa

Se você testou num iPhone com defeito na câmera, abra uma issue com o modelo **Relato de modelo testado**. Saber quais modelos e defeitos funcionam ajuda outras pessoas a decidir se vale tentar.

## Ambiente

Requisitos: Node.js 20 ou mais recente.

```bash
npm install
npm start              # serve em http://localhost:8080
npm run check          # lint + formatação + testes unitários
npm run test:e2e       # testes de ponta a ponta com câmera simulada
```

A câmera só funciona em `https` ou em `localhost`. Para testar no iPhone, publique num fork com GitHub Pages ou use um túnel https.

## Regras do projeto

- **Sem etapa de build.** O app é HTML, CSS e módulos JavaScript servidos como estão. Isso mantém o GitHub Pages e o modo offline simples.
- **Sem dependências em produção.** Bibliotecas só como `devDependencies` (ferramentas de teste e qualidade).
- **Lógica pura fica separada do DOM** (`js/lenses.js`, `js/selection.js`, `js/share.js`) e tem teste unitário.
- **Arquivo novo em `js/`, `css/` ou `icons/` precisa entrar no `PRECACHE` do `sw.js`.** O teste `tests/unit/sw.test.js` falha se esquecer.
- **Mudou qualquer arquivo do app? Aumente `VERSION` no `sw.js`**, senão os celulares continuam com a versão antiga guardada.
- Textos da interface em português do Brasil, frases curtas e sem jargão.

## Commits e pull requests

- Mensagens de commit no imperativo e em português: `Corrige religamento após minimizar`.
- Um assunto por pull request, com o checklist do modelo preenchido.
- Registre a mudança em `CHANGELOG.md`, na seção da próxima versão.
