# Caminho de Luz

Aplicativo de estudo espírita e reflexão cristã, instalável na tela inicial do celular como PWA. HTML, CSS e JavaScript sem dependências de execução.

## Executar

Com Node.js 22+ e Python 3: `npm test`, `npm run build` e `npm start`. Abra http://localhost:8080. O conteúdo publicado está em `dist/`; não abra index.html via file://, pois instalação e modo offline precisam de um servidor.

## Publicar no Vercel

Importe este repositório no Vercel, mantenha a pasta raiz do projeto e Framework Preset **Other**. O arquivo vercel.json configura automaticamente a saída `dist`. Não precisa de banco de dados, token, variável de ambiente ou chave de API. Novos commits na branch de produção podem gerar novas publicações pela integração GitHub/Vercel.

## Instalar no celular

Abra o endereço HTTPS publicado pelo Vercel. No Chrome Android, use o menu Instalar aplicativo ou Adicionar à tela inicial. O logo, o manifest e o service worker estão incluídos.

## Conteúdo e funcionamento

- 24 reflexões originais inspiradas no Evangelho e três trechos bíblicos com fontes.
- Seis estudos guiados, sínteses de obras e referências históricas.
- Catálogo com 33 edições de audiolivros, incluindo links comerciais e uma edição gratuita em inglês; o catálogo não representa 33 gravações gratuitas hospedadas.
- Narração dos estudos pelas vozes disponíveis no navegador.
- Música clássica, sacra e player externo de O Homem de Nazareth.
- Diário, favoritos e cartões; armazenamento local no navegador.

Após o primeiro carregamento, o conteúdo local fica disponível offline. Players externos, músicas e sites de fontes precisam de internet. A reprodução depende da plataforma e da região; existem links alternativos. Não são redistribuídas gravações protegidas nem letras de músicas.

## Seus registros

Diário, favoritos e progresso ficam no navegador, sem criptografia ou sincronização. Os registros do endereço antigo NÃO aparecem automaticamente no Vercel, pois cada domínio tem seu próprio armazenamento. Exporte o diário no app antigo antes da mudança. Não há importação automática. Limpar os dados do navegador pode apagar os registros.

Lembretes funcionam com o aplicativo aberto ou ao voltar a ele. Para lembretes com o app fechado, use a exportação para calendário oferecida nas preferências.

## Verificação

`npm test` executa o teste de regressão com DOM simulado. Não substitui validação de reprodução, notificações e instalação em dispositivos reais.
