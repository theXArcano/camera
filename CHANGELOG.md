# Changelog

Mudanças relevantes do Lentes. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e as versões seguem o [SemVer](https://semver.org/lang/pt-BR/).

## [1.2.0] - 2026-11-22

### Adicionado

- Seleção na galeria igual à do app Fotos: tocar e segurar seleciona, arrastar marca várias, e a rolagem automática acompanha quando o dedo chega na borda.
- Barra de seleção com Salvar e Apagar, e uma confirmação de apagar no estilo do iOS.
- Estrutura do projeto em módulos (`js/`, `css/`, `icons/`), testes unitários, testes de ponta a ponta com câmera simulada, ESLint, Prettier e CI no GitHub Actions.
- Modelos de issue para relatar problemas e modelos de iPhone testados.

### Alterado

- Apagar uma captura no visualizador agora usa a mesma confirmação do iOS.

## [1.1.0] - 2026-11-22

### Adicionado

- Galeria interna com salvamento automático de cada foto e vídeo, que funciona offline.
- Envio em lote para o app Fotos, com marcação do que já foi salvo.
- A câmera abre sozinha ao iniciar o app.

### Corrigido

- Minimizar o app não desliga mais a câmera, o que evitava um novo pedido de permissão a cada volta.

## [1.0.0] - 2026-11-22

### Adicionado

- Câmera por lente separada, com religamento automático após corte por temperatura.
- Detecção de imagem preta, diagnóstico das câmeras reconhecidas pelo iOS e atalhos de zoom digital.
- Foto em resolução máxima e gravação de vídeo em MP4 com som.
- Funcionamento offline como app de Tela de Início.
