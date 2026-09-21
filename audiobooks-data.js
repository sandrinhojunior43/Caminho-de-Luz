// Catalog metadata only. No commercial audio files or publisher descriptions are copied.
// Each source is the reviewed product page. Checked 2026-09-20.
window.CDL_AUDIOBOOKS_DATA = (()=>{
const audible=(slug,id)=>'https://www.audible.com.br/pd/'+slug+'-Audiolivro/'+id;
const rows=[
['espiritos','O Livro dos Espíritos','Allan Kardec','Codificação','Di Ramon e Gabriela Villaboim','Audible',audible('O-livro-dos-Espiritos','B0CBMSGCDM')],
['mediuns','O Livro dos Médiuns','Allan Kardec','Codificação','Di Ramon','Audible','https://www.audible.com.br/pd/O-Livro-dos-Mediuns-Audiolivro/B0CBMSRXH6?intent=discovery'],
['evangelho','O Evangelho segundo o Espiritismo','Allan Kardec','Codificação','Di Ramon e Anália Martins','Audible',audible('O-Evangelho-Segundo-o-Espiritismo','B0CBMTXTJC')],
['ceu','O Céu e o Inferno','Allan Kardec','Codificação','Sérgio Grell','Ubook','https://www.ubook.com/audiobook/106702/o-ceu-e-o-inferno'],
['genese','A Gênese','Allan Kardec','Codificação','Sérgio Grell','Audible',audible('A-Genese','B0CBMV7FVW')],
['postumas','Obras Póstumas','Allan Kardec','Obras complementares','Di Ramon','Audible',audible('Obras-Postumas','B0CBMP775K')],
['o-que','O que é o Espiritismo (Integral)','Allan Kardec','Introdução','','Everand','https://pt.everand.com/audiobook/848353368/O-que-e-o-Espiritismo-Integral'],
['se-abrindo','Se abrindo pra vida','Zíbia Gasparetto','Audionovela','Elenco de atores','Audible',audible('Se-Abrindo-Pra-Vida','B0CBYC68KL')],
['nosso-lar','Nosso Lar — A vida no mundo espiritual','Chico Xavier','Literatura mediúnica','Walmir Correa do Nascimento','Tocalivros','https://www.tocalivros.com/audiolivro/nosso-lar-a-vida-no-mundo-espiritual-francisco-candido-xavier-walmir-correa-do-nascimento-feb-editora'],
['emmanuel','Emmanuel','Chico Xavier','Reflexões','Gustavo Rocha','Audible',audible('Emmanuel','B0BTKCMKJ1')],
['ha-dois','Há Dois Mil Anos','Chico Xavier','Romance mediúnico','Elenco de narradores','Audible',audible('Ha-Dois-Mil-Anos','B0CBMX83Z6')],
['alma','Alma e Coração','Chico Xavier','Reflexões','Sérvulo Augusto','Tocalivros','https://dtel.tocalivros.com/audiolivro/alma-e-coracao-chico-xavier-servulo-augusto-pensamento'],
['cartilha','Cartilha do Bem','Chico Xavier','Mensagem breve','Walmir Nascimento e Tuka Villa-Lobos','Tocalivros','https://bibliotecamodelo.tocalivros.com/audiolivro/cartilha-do-bem-francisco-candido-xavier-walmir-nascimento-e-tuka-villa-lobo-feb-editora'],
['depois','Depois da Morte','Léon Denis','Filosofia espírita','Pedro Lopes','Ubook','https://www.ubook.com/audiobook/722576/depois-da-morte'],
['kardec-bio','Kardec, a biografia','Marcel Souto Maior','Biografia','','Audible',audible('Kardec-a-biografia','B0BNLG4W85')],
['vidas-chico','As vidas de Chico Xavier','Marcel Souto Maior','Biografia','','Audible','https://www.audible.com.br/pd/As-vidas-de-Chico-Xavier-Audiolivro/B0DNC7Q1H4?intent=discovery'],
['kardec-filme','Kardec — A história por trás do filme','Wagner de Assis e Marcel Souto Maior','Biografia','Fernando Peron','Audible',audible('Kardec','B0BW4P74RX')],
['sausse','Biografia de Allan Kardec','Henri Sausse','Biografia','','Audible',audible('Biografia-de-Allan-Kardec','B0CJ3ZSC5R')],
['fascinante','A Fascinante História de Chico Xavier','Luis Eduardo de Souza','Biografia','Thiago Ubaldo','Audible',audible('A-Fascinante-Historia-de-Chico-Xavier','B0CJ7J183D')],
['divaldo','A Mensagem Espiritual de Divaldo Franco','George De Marco','Biografia','','Audible','https://www.audible.com.br/pd/A-Mensagem-Espiritual-de-Divaldo-Franco-Audiolivro/B0DW88SFRB?intent=discovery'],
['sacrificio','Sacrifício por amor','Umberto Fabbri','Romance espírita','Ricardo Barcelos','Storytel','https://www.storytel.com/br/books/sacrif%C3%ADcio-por-amor-734340'],
['despertar','O despertar de uma nova era (Integral)','Izoldino Resende','Literatura mediúnica','Di Ramon','Storytel','https://www.storytel.com/br/books/o-despertar-de-uma-nova-era-integral-1129828'],
['estrela','Estrela de luz','Izoldino Resende','Literatura mediúnica','Barros Batista','Audible',audible('Estrela-de-luz','B0BYKVZ95G')],
['orai','Orai e Vigiai — Preces','Osmar Barbosa','Preces','','Storytel','https://www.storytel.com/br/books/orai-e-vigiai-preces-2436242'],
['entre-vidas','Entre Nossas Vidas','Osmar Barbosa','Romance espiritualista','','Storytel','https://www.storytel.com/br/books/entre-nossas-vidas-2471646'],
['lado-azul','O Lado Azul da Vida','Osmar Barbosa','Romance espiritualista','','Storytel','https://www.storytel.com/br/books/o-lado-azul-da-vida-1805327'],
['amigo','Amigo fiel','Osmar Barbosa','Romance espiritualista','','Storytel','https://www.storytel.com/br/books/amigo-fiel-1226148'],
['amanha','O Amanhã nos Pertence','Osmar Barbosa','Romance espiritualista','','Storytel','https://www.storytel.com/br/books/o-amanh%C3%A3-nos-pertence-1719596'],
['vida-visao','A vida na visão do espiritismo','Alexandre Caldini','Introdução','','Audible',audible('A-vida-na-visao-do-espiritismo','B0CC95ZNCC')],
['morte-visao','A Morte na Visão do Espiritismo','Alexandre Caldini','Introdução','','Storytel','https://www.storytel.com/br/books/a-morte-na-vis%C3%A3o-do-espiritismo-1497167'],
['emocoes','Emoções que Curam','Wanderley Oliveira, Chris Quites e César Oliveira','Reflexões','','Audible',audible('Emocoes-que-Curam','B0D6FRBGT8')],
['lider','O Líder Espírita — Liderança para a Nova Era','Maria Elisabeth da Silva Barbieri e Gabriel Nogueira Salum','Estudo e atuação','Sergio Meneguello','Tocalivros','https://bibliotecamodelo.tocalivros.com/audiolivro/o-lider-espirita-lideranca-para-a-nova-era-maria-elisabeth-da-silva-barbieri-sergio-meneguello-fergs-editora']
];
const data=rows.map(([id,title,author,category,narrator,provider,url])=>({id,title,author,category,narrator,language:'pt',access:'paid',links:[{label:provider,url}],note:provider==='Tocalivros'&&url.includes('bibliotecamodelo')?'Acesso por biblioteca conveniada; confira elegibilidade na plataforma.':provider==='Tocalivros'&&url.includes('dtel.')?'Acesso vinculado à biblioteca DTEL; confira elegibilidade na plataforma.':'Confira compra, assinatura e amostra na plataforma.'}));
const z=data.find(b=>b.id==='se-abrindo');z.spirit='Lucius (autoria espiritual atribuída)';z.note='Adaptação dramatizada. O player Spotify pode oferecer apenas amostras, conforme conta e região.';z.embed='https://open.spotify.com/embed/album/4a14cNRhEAV6Gp5iVGw6JI';z.links.push({label:'Spotify',url:'https://open.spotify.com/intl-pt/album/4a14cNRhEAV6Gp5iVGw6JI'});
data.find(b=>b.id==='nosso-lar').spirit='André Luiz (autoria espiritual atribuída)';
for(const id of ['ha-dois','emmanuel'])data.find(b=>b.id===id).spirit='Emmanuel (autoria espiritual atribuída)';
data.find(b=>b.id==='emocoes').spirit='Ermance Dufaux (autoria espiritual atribuída)';
data.unshift({id:'spirits-en',title:"The Spirits’ Book — O Livro dos Espíritos",author:'Allan Kardec',category:'Codificação',narrator:'Voluntários LibriVox',language:'en',access:'free',duration:'16h25',note:'Gravação em inglês. Tradução de Anna Blackwell. Livro completo em 34 faixas, disponibilizado pelo LibriVox.',embed:'https://archive.org/embed/spirits_book_2201_librivox',links:[{label:'LibriVox',url:'https://librivox.org/the-spirits-book-by-allan-kardec/'},{label:'Internet Archive',url:'https://archive.org/details/spirits_book_2201_librivox'}]});
return data;
})();
