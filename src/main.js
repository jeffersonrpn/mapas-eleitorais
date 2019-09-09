const fs = require("fs");
const request = require("request-promise");
const csv = require("csv-parser");
const d3 = require("d3");
const topojson = require("topojson");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

import chalk from "chalk";

function createMap(candidate) {
  const width = 640;
  const height = 512;
  const dir = "./" + candidate.election.year;
  const file = candidate.cpf + ".svg";

  const fakeDom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
  let body = d3.select(fakeDom.window.document).select("body");

  let svg = body
    .append("div")
    .attr("class", "container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  let g = svg.append("g").attr("class", "shape-group");

  let projection = d3
    .geoAlbers()
    .center([-55, -2])
    .rotate([0, 0])
    .parallels([0, 0])
    .scale(1400);

  let path = d3.geoPath().projection(projection);

  const colorScale = d3.schemeGnBu[9];
  colorScale[0] = "#f3f3f3";

  const color = d3
    .scaleThreshold()
    .domain([0.00005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1])
    .range(colorScale);

  let brFile = fs.readFileSync("br.json");
  let br = JSON.parse(brFile);

  br.objects.Munic.geometries = br.objects.Munic.geometries.filter(
    geom => geom.properties.uf === candidate.location
  );

  const municipios = topojson.feature(br, br.objects.Munic);

  // Centralizar mapa
  projection.scale(1).translate([0, 0]);
  const bounds = path.bounds(municipios);
  const scaleFactor =
    0.95 /
    Math.max(
      (bounds[1][0] - bounds[0][0]) / width,
      (bounds[1][1] - bounds[0][1]) / height
    );
  const translateFactor = [
    (width - scaleFactor * (bounds[1][0] + bounds[0][0])) / 2,
    (height - scaleFactor * (bounds[1][1] + bounds[0][1])) / 2
  ];
  projection.scale(scaleFactor).translate(translateFactor);

  g.selectAll(".municipio")
    .data(municipios.features)
    .enter()
    .append("path")
    .attr("class", d => "m-" + d.id)
    .attr("d", path)
    .attr("stroke-width", "0.5")
    .attr("stroke", "#dfdfdf")
    .attr("fill", d => "#000");
  request(
    "https://eleicoes.datapedia.info/api/votes/bystate/" +
      candidate.election.id +
      "/" +
      candidate.id +
      "/" +
      candidate.location
  ).then(result => {
    const votes = JSON.parse(result);
    votes.map(vote => {
      g.selectAll(".m-" + vote.location_code + "").attr(
        "fill",
        color(vote.votable_votes / vote.total_votes)
      );
    });

    // Output
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    const outputLocation = dir + "/" + file;
    fs.writeFileSync(outputLocation, body.select(".container").html());
    return true;
  });
}

function getCandidates(options, filter) {
  return new Promise(resolve => {
    console.log("Carregando lista de Deputados Federais.");
    request
      .get(
        "https://eleicoes.datapedia.info/api/candidates/post/" +
        6 + // Código para Deputados Federais no TSE
          "/" +
          options.ano +
          "/" +
          options.uf +
          "/0"
      )
      .then(result => {
        result = JSON.parse(result);
        let filtered = result.rows;
        if (filter.length > 0) {
          filtered = result.rows.filter(candidate =>
            filter.includes(candidate.cpf)
          );
        }
        console.log(
          chalk.green(filtered.length) +
            "/" +
            result.count +
            " candidatos encontrados."
        );
        resolve(filtered);
      });
  });
}

export function createMapsFromOptions(options) {
  console.log(
    "Gerando mapas eleitorais para " +
      chalk.green(options.uf) +
      " " +
      chalk.green(options.ano)
  );
  getCandidates(options, []).then(candidates => {
    console.log("Carregando votos...");
    candidates.forEach(candidate => {
      createMap(candidate);
    });
    console.log(chalk.green("Pronto!"));
  });
}

export function createMapsFromCSV(options) {
  console.log(
    "Gerando mapas eleitorais para " +
      chalk.green(options.uf) +
      " " +
      chalk.green(options.ano)
  );
  console.log(
    "Carregando filtro   (" +
      chalk.green(options.csv) +
      ")"
  );
  let cpfs = [];
  fs.createReadStream(options.csv)
    .pipe(
      csv({ separator: ",", mapHeaders: ({ header }) => header.toLowerCase() })
    )
    .on("data", row => {
      cpfs.push(row["cpf"]);
    })
    .on("end", () => {
      getCandidates(options, cpfs).then(candidates => {
        console.log("Carregando votos...");
        candidates.forEach(candidate => {
          createMap(candidate);
        });
        console.log(chalk.green("Pronto!"));
      });
    })
    .on("error", () => {
      console.log(chalk.red("Erro na leitura do arquivo."));
    });
}
