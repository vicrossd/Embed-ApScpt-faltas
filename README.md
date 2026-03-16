# Controle de Faltas — versão Supabase + GitHub Pages

Esta é a versão nova do frontend para o projeto de controle de faltas.

## O que mudou em relação à versão anterior

A versão anterior usava:

- **Google Apps Script** como backend
- **Google Sheets** como armazenamento
- tentativa de consumo da API a partir do frontend hospedado no GitHub Pages

A nova versão usa:

- **Supabase** como backend e banco de dados
- **GitHub Pages** para hospedar o frontend
- visual mais escuro, pensado para combinar com o **Notion**
- cores individuais por matéria, vindas da tabela `materias`

## Por que esta versão existe

A versão com Apps Script funcionou parcialmente, mas houve problemas de autenticação/publicação, especialmente com conta institucional e acesso externo. Esta versão substitui o backend por algo mais previsível para uso em embed e acesso público.

## Arquivos desta versão

- `index.html` — estrutura da interface
- `style.css` — visual escuro estilo Notion
- `script.js` — integração com a API REST do Supabase
- `README.md` — instruções e diferenças da versão anterior

## Estrutura esperada no Supabase

### Tabela `materias`
Campos esperados:

- `id`
- `nome`
- `cor`
- `ordem`

### Tabela `faltas`
Campos esperados:

- `id`
- `materia_id`
- `delta`
- `created_at`

## Como publicar esta atualização no GitHub

### Opção 1 — atualizar direto a `main`
Substitua no repositório:

- `index.html`
- `style.css`
- `script.js`
- `README.md`

Como o GitHub Pages já está apontando para `main`, a **URL do site continua a mesma**. O conteúdo é que será atualizado.

### Opção 2 — usar uma branch
Crie uma branch, por exemplo:

- `supabase-ui`

Faça a troca dos arquivos nela e depois faça merge para `main`.

Isso é útil se você quiser revisar tudo antes. O Pages só muda quando o conteúdo entrar na branch que ele publica.

## Como configurar a interface

1. Abra o site publicado no GitHub Pages
2. Cole:
   - a **Project URL** do Supabase
   - a **anon public key**
3. Clique em **Salvar configuração**
4. Clique em **Carregar**

Se tudo estiver correto, os cards das matérias aparecem.

## Como personalizar o visual

### Cores globais
No arquivo `style.css`, edite o bloco:

```css
:root {
  --bg: #191919;
  --panel: #202124;
  --panel-2: #26282c;
  --text: #f1f1ef;
  --muted: #9b9a97;
  --border: #2d2f33;
}
```

### Cor individual por matéria
A cor do card vem do campo `cor` da tabela `materias`.

Exemplo:

- `#38bdf8`
- `#22c55e`
- `#f87171`

Para mudar a cor de uma matéria, altere o valor na própria tabela do Supabase.

### Ocultar o painel de configuração
A interface tem um botão **Ocultar painel**. Isso ajuda a deixar o embed mais limpo no Notion depois que tudo já estiver configurado.

## Observações

- O contador mostrado em cada card é a soma dos registros da tabela `faltas`
- `+ Falta` insere `delta = 1`
- `− Desfazer` insere `delta = -1`
- isso preserva o histórico, em vez de sobrescrever um número bruto

## Próximo passo sugerido

Depois de subir os arquivos, configure a `Project URL` e a `anon key` do Supabase e teste um registro de falta.
