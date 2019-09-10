# Mapas eleitorais

Desenha mapas de votação dos Deputados Federais brasileiros.

Este projeto utiliza a API e ideias extraídas diretamente da [Datapedia](https://eleicoes.datapedia.info/). Caso deseje uma ferramenta interativa para visualização desses mapas, [visite-a](https://eleicoes.datapedia.info/candidato/comparacao).

## Como usar

Execute o comando na raiz do projeto:

```bash
./bin/gerar-mapas-eleitorais
```

Para mais detalhes:

```bash
./bin/gerar-mapas-eleitorais --help
```

## Resultado

As imagens serão geradas no diretório correspondente ao ano da eleição, com os nomes dos arquivos sendo o `<cpf>.svg`
