# Lentes: câmera traseira do iPhone não funciona? Use a lente que ainda funciona

[![CI](https://github.com/theXArcano/camera/actions/workflows/ci.yml/badge.svg)](https://github.com/theXArcano/camera/actions/workflows/ci.yml)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)

**Abrir o app:** https://thexarcano.github.io/camera/

Lentes é um app de câmera gratuito que roda no Safari, sem App Store e sem computador. Ele foi feito para quem tem uma câmera do iPhone que parou de funcionar: tela preta, câmera travando, câmera desligando sozinha por superaquecimento ou uma lente que sumiu do app Câmera.

O app abre **cada lente separadamente**. Se a câmera principal (1x) morreu mas a ultra-angular (0,5x) ou a teleobjetiva ainda funcionam, você volta a tirar foto e gravar vídeo com a câmera traseira.

> Projeto independente, sem nenhuma ligação com a Apple. "iPhone" é marca da Apple Inc. e aparece aqui só para descrever com quais aparelhos o app funciona.

---

## Você está com algum destes problemas?

- Câmera do iPhone não funciona e a tela fica preta
- Câmera traseira do iPhone não abre, mas a frontal funciona
- iPhone esquentando e a câmera desligando sozinha
- A câmera abre por alguns segundos e depois congela ou fica preta
- O app Câmera trava quando você escolhe o 1x
- A câmera traseira não funciona no app Câmera, mas funciona no Instagram, no WhatsApp ou em outro app
- Sumiu uma lente: só aparece o 0,5x, ou só a frontal
- Foi à assistência técnica, ouviu que é aquecimento perto do processador e ainda não conseguiu deixar o celular para consertar

Se você se identificou, vale testar o Lentes antes de ficar só com a câmera de selfie.

---

## Por que isso acontece

O app Câmera da Apple liga **várias câmeras ao mesmo tempo** para trocar de lente automaticamente entre 0,5x, 1x e 3x. Quando um desses módulos tem defeito ou esquenta demais, o iOS pode desligar a câmera inteira e você vê só uma tela preta.

Apps que abrem **uma lente por vez**, com resolução e taxa de quadros mais baixas, gastam menos energia e esquentam menos. Por isso, em muitos casos, a câmera volta a funcionar fora do app nativo. O Lentes foi feito para isso.

---

## O que o app faz

| Recurso                | Descrição                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Lentes separadas       | Mostra um botão para cada câmera que o iOS reconhece (0,5x, 1x, teleobjetiva, frontal), para você testar uma de cada vez     |
| Religa sozinho         | Quando o iPhone corta a câmera por temperatura, o app tenta de novo, esperando um pouco mais a cada tentativa                |
| Detecta tela preta     | Avisa quando a lente está sem imagem e reabre a câmera depois de 12 segundos                                                 |
| Foto                   | Na resolução máxima que a lente entregar (ex.: 4032×3024 na ultra-angular)                                                   |
| Vídeo                  | Grava em MP4 com som. Se a câmera cair no meio, o trecho já gravado é salvo                                                  |
| Salva sozinho          | Toda foto e vídeo fica guardado na galeria do app na hora, mesmo offline. Depois você manda tudo de uma vez para o app Fotos |
| Seleção igual ao Fotos | Toque e segure para selecionar, arraste o dedo para marcar várias, e salve ou apague em lote                                 |
| Zoom digital           | Atalhos 0,5x, 1x e 2x quando só a ultra-angular funciona                                                                     |
| Qualidade              | Máxima, Média (1080p) ou Leve (720p). A Leve esquenta menos                                                                  |
| Funciona offline       | Depois de adicionado à Tela de Início, abre sem internet                                                                     |
| Diagnóstico            | Lista as câmeras que o iOS reconhece e registra cada corte, para você mostrar ao técnico                                     |

---

## Como instalar no iPhone (1 minuto, sem computador)

1. Abra **https://thexarcano.github.io/camera/** no **Safari**, com internet.
2. Toque em **Compartilhar** (o quadrado com a seta) e depois em **Adicionar à Tela de Início**.
3. Abra o **Lentes** pelo ícone novo e toque em **Abrir câmera**.
4. Permita o acesso à câmera e, no modo vídeo, ao microfone.

Pronto. Daqui em diante ele abre mesmo no modo avião.

### Para o iPhone parar de pedir permissão toda vez

Vá em **Ajustes → Apps → Safari → Câmera → Permitir**. Para gravar vídeo com som sem perguntar, faça o mesmo em **Ajustes → Apps → Safari → Microfone → Permitir**.

No iOS 17 ou anterior, o caminho é **Ajustes → Safari → Câmera**.

Isso libera a câmera para os sites que você abre no Safari, não só para o Lentes. Se preferir, deixe em "Perguntar" e aceite o pedido ao abrir o app.

### Como salvar no app Fotos

Depois de tirar a foto ou gravar o vídeo, toque em **Salvar** e escolha **Salvar Imagem** ou **Salvar Vídeo**.

---

## Como descobrir qual lente ainda funciona

1. Desligue o iPhone, tire a capinha e deixe uns 15 minutos num lugar fresco. **Não coloque na geladeira**, porque a umidade pode estragar a placa.
2. Ligue o celular e abra o Lentes antes de qualquer outro app.
3. Toque em cada botão de lente e espere uns 10 segundos em cada um.
4. Abra o **Diagnóstico** para ver quais câmeras o iOS está reconhecendo.

**Como ler o resultado**

- **A lente aparece e mostra imagem:** ela funciona. Use essa lente no dia a dia.
- **A lente aparece, mas fica preta:** o módulo pode estar com defeito ou quente demais. Deixe esfriar e teste de novo.
- **A lente nem aparece na lista:** o iOS não está detectando aquele módulo. Nenhum app consegue usar essa câmera, e o caminho é a assistência técnica (troca do módulo de câmera ou reparo do conector ou da placa).

---

## Por que é um app do Safari, e o que isso limita

O Lentes roda no Safari em vez de ser baixado da App Store. É isso que permite instalar de graça, sem computador e sem reinstalar a cada 7 dias, como acontece com apps de iPhone instalados fora da loja com uma conta grátis de desenvolvedor. Em troca, o iOS impõe alguns limites a apps que rodam no Safari:

| Limite                                        | Por quê                                                                    | O que o Lentes faz                                                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Pede permissão da câmera ao abrir             | O iOS não guarda a permissão de câmera para apps da Tela de Início         | Abre a câmera sozinho e não a desliga ao minimizar. Para não perguntar mais, use o caminho em Ajustes acima |
| Não salva direto no app Fotos                 | Só apps da App Store podem gravar no Fotos sem você tocar em nada          | Guarda tudo na galeria do app na hora e manda para o Fotos em lote, com um toque em "Salvar"                |
| Usa só as câmeras que o iOS informa           | Nenhum app, da loja ou não, consegue ligar um módulo que o iOS não detecta | Mostra no Diagnóstico exatamente quais câmeras o iOS está vendo                                             |
| Sem correção de distorção, HDR e modo noturno | O processamento de imagem da Apple fica dentro do app Câmera               | Entrega a imagem direta da lente na resolução máxima                                                        |

## Privacidade

Nada sai do seu iPhone. O app não tem servidor, não tem conta e não envia fotos, vídeos nem dados de uso para lugar nenhum. As capturas ficam no armazenamento do próprio app até você salvá-las no Fotos ou apagá-las.

## Limitações (honestas)

- O app **não consegue** ligar uma câmera que o próprio iOS desligou ou deixou de reconhecer. Ele aproveita o que ainda funciona.
- O zoom digital na ultra-angular corta a imagem, então o 1x e o 2x têm menos detalhe do que a câmera principal original.
- A ultra-angular de vários modelos tem foco fixo: objetos muito próximos ficam desfocados.
- As bordas da foto da ultra-angular ficam um pouco curvas, porque o app não corrige a distorção da lente como o app nativo faz.
- Este app é um quebra-galho. **Aquecimento perto do processador costuma piorar com o tempo**, então leve o aparelho a uma assistência quando puder.

---

## Compatibilidade

- iPhone com iOS 14.3 ou mais recente, no Safari
- Testado num iPhone 14 Plus com a câmera principal sem funcionar e a ultra-angular funcionando
- Também abre no Android (Chrome), embora tenha sido pensado para iPhone

---

## Para desenvolvedores

PWA estática em módulos JavaScript nativos: sem build e sem dependências em produção.

```
.
├── index.html              marcação da interface
├── css/app.css             estilos
├── js/
│   ├── main.js             ponto de entrada
│   ├── camera.js           lente, religamento, imagem preta, zoom
│   ├── recorder.js         gravação de vídeo (MediaRecorder)
│   ├── gallery.js          galeria, salvamento automático, envio ao Fotos
│   ├── selection.js        gestos de seleção estilo app Fotos
│   ├── media-store.js      IndexedDB
│   ├── share.js            folha de compartilhar
│   ├── lenses.js           regras puras sobre lentes e zoom
│   ├── ui.js · log.js · prefs.js
├── sw.js                   modo offline
├── manifest.webmanifest    instalação na Tela de Início
├── icons/
├── tests/
│   ├── unit/               node --test, sem dependências
│   └── e2e/                Playwright com câmera simulada
├── docs/ARQUITETURA.md
└── .github/                CI, modelos de issue e de pull request
```

```bash
npm install
npm start           # http://localhost:8080
npm run check       # ESLint + Prettier + testes unitários
npm run test:e2e    # testes de ponta a ponta
```

Cada push e cada pull request passam pelo CI (lint, formatação, testes unitários e de ponta a ponta). Veja [docs/ARQUITETURA.md](docs/ARQUITETURA.md) para as decisões de projeto e [CONTRIBUTING.md](CONTRIBUTING.md) para as regras de contribuição.

Para publicar uma cópia sua, faça um fork e ative o GitHub Pages em **Settings → Pages → Branch: main**.

Relatos de outros modelos de iPhone são bem-vindos nas [Issues](https://github.com/theXArcano/camera/issues/new/choose).

## Licença

[MIT](LICENSE) © Gabriel Mendes Mouta

---

### In English

**iPhone rear camera not working, showing a black screen, or shutting down from overheating?** Lentes is a free web camera app that opens each iPhone lens on its own (ultra wide, wide, telephoto). Use it when one camera module has failed and the others still work. It reconnects automatically after thermal shutdowns, takes full-resolution photos, records MP4 video, and works offline once added to the Home Screen. Open https://thexarcano.github.io/camera/ in Safari.

---

**Buscas relacionadas:** câmera do iPhone não funciona · câmera traseira do iPhone tela preta · iPhone câmera preta · câmera do iPhone parou de funcionar · iPhone esquentando câmera desliga · câmera do iPhone superaquecimento · câmera do iPhone trava · iPhone 11 / 12 / 13 / 14 / 15 câmera não funciona · câmera principal do iPhone com defeito · usar câmera ultra-angular do iPhone · app de câmera para iPhone com câmera quebrada · iphone camera not working black screen · iphone rear camera overheating
