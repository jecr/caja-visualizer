import _ from 'lodash';
import { percentage } from './general';

/**
   * @description Calcula grado de entrada, grado de entrada y grado de cada nodo en la muestra final
   * @param {array} nodesArray - Array de nodos inicial
   * @param {array} linksArray - Array de enlaces inicial
   * @returns {array} Array de enlaces con grado (degree), grado de entrada (inDegree) y grado de salida (outDegree) añadidos
   */
  export const getAllDegrees = (nodesArray, linksArray) => (
    nodesArray.map((node) => {
      let inDegree = 0;
      let outDegree = 0;

      linksArray.forEach((link) => { node.name === link.target && inDegree++; });
      linksArray.forEach((link) => { node.name === link.source && outDegree++; });

      let degree = inDegree + outDegree;

      return {
        ...node, // El ... es un spread operator (https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Operadores/Spread_operator)
        degree,
        inDegree,
        outDegree
      };
    })
  );

  /**
   * @description Ordena los nodos por ? propiedad y devuelve los 10 primeros
   * @param {array} nodesArray - Array de nodos
   * @param {string} property - Nombre de la propiedad sobre la cual ordenar
   * @returns {array} Array de 10 nodos
   */
  export const topTen = (nodesArray, property) => {
    const nodesSortedByParam = nodesArray.sort(function (a, b) {
      if (a[property] < b[property]) {
        return 1;
      } else if (a[property] > b[property]) {
        return -1;
      } else {
        return 0;
      }
    });
    return nodesSortedByParam.slice(0, 10);
  }

  //Obtiene el número de interacciones por tipo de interacción
  export const getInteractionsCountPerType = (linksArray) => {
    let numRT = 0, numRP = 0, numMen = 0;
    linksArray.forEach((link) => {
      if (link.interaction === "retweet") {
        numRT++;
      } else if (link.interaction === "reply") {
        numRP++;
      }

      if (link.interaction === "mention") {
        numMen++;
      }
    });

    return {
      numRT,
      numRP,
      numMen,
    }
  }

  export const getDistributionByInteractionType = (nodesArray, interactionType) => {
    const total = _.reduce(nodesArray, (result, value, key) => (
      nodesArray[key][interactionType] ? result + 1 : result
    ), 0);
    const medios = _.reduce(nodesArray, (result, value, key) => (
      nodesArray[key].class === "medio" &&
        nodesArray[key][interactionType] ? result + 1 : result
    ), 0);
    const politicos = _.reduce(nodesArray, (result, value, key) => (
      nodesArray[key].class === "politico" &&
        nodesArray[key][interactionType] ? result + 1 : result
    ), 0);
    const ciudadanos = _.reduce(nodesArray, (result, value, key) => (
      nodesArray[key].class === "ciudadano" &&
        nodesArray[key][interactionType] ? result + 1 : result
    ), 0);
    return {
      total,
      medios,
      politicos,
      ciudadanos,
    }
  }

  // Ordena los enlaces por origen, por destino y por tipo de interacción
  export const sortLinks = (linksArray) => {
    return linksArray.sort(function (a, b) {
      if (a.source > b.source) {
        return 1;
      } else if (a.source < b.source) {
        return -1;
      } else if (a.target > b.target) {
        return 1;
      } else if (a.target < b.target) {
        return -1;
      } else {
        if (a.interaction > b.interaction) {
          return 1;
        }
        if (a.interaction < b.interaction) {
          return -1;
        } else {
          return 0;
        }
      }
    });
  }

  export const parseRawNetworkData = (dataObject) => {
    /*======================================================================
    INFORMACION SOBRE LOS NODOS Y LOS ENLACES
    ======================================================================*/

    const {
      nodes: totalGraphNodes,
      links: totalGraphInteractions,
    } = dataObject;

    let {
      node_sample: nodes,
      total_interactions: links,
    } = dataObject;
    nodes = getAllDegrees(nodes, links); // Calcula degree, inDegree y outDegree

    // Ordena los nodos según sus grados y crea listas con los diez primeros
    const topDegree = topTen(nodes, 'degree');
    const topInDegree = topTen(nodes, 'inDegree');
    const topOutDegree = topTen(nodes, 'outDegree');

    //Obtiene el número de interacciones por tipo de interacción
    const { numRT, numRP, numMen } = getInteractionsCountPerType(links);

    // Ordena los enlaces por origen, por destino y por tipo de interacción
    links = sortLinks(links);

    // Establece el número de enlaces entre dos nodos, inicia en 1
    links = links.map(link => ({ ...link, linknum: 1 })); // la forma: param => () es un return implícito (https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Funciones/Arrow_functions)
    
    // Aumenta el número de enlaces si hay más de un tipo de interacción
    links = links.map((link, i, linksArray) => {
      let linksCount = 0;
      if (
        i !== 0 &&
        link.source === linksArray[i - 1].source &&
        link.target === linksArray[i - 1].target
      ) {
        if (link.interaction !== linksArray[i - 1].interaction) {
          linksCount = linksArray[i - 1].linknum + 1;
        } else if (link.interaction === linksArray[i - 1].interaction) {
          linksCount = linksArray[i - 1].linknum;
        }
      }
      return {
        ...link,
        linknum: linksCount,
      }
    });

    // Determina si el enlace será recto o curvo
    links = links.map((link, i, linksAray) => {
      let straight = 1;
      if (link.linknum === 2 || link.linknum === 3) {
        straight = 0;
      }
      linksAray.forEach((linkB) => {
        if (link.source === linkB.target && linkB.source === link.target) {
          straight = 0;
        } else if (
          link.linknum === 1 &&
          link.source === linkB.source &&
          link.target === linkB.target &&
          linkB.linknum >= 2
        ) {
          straight = 0;
        }
      });
      return {
        ...link,
        straight,
      }
    });

    // Calcula la frecuencia de un tipo de interacción
    links = links.map((link, i, linksArray) => {
      let mentions, replies, retuits;
      if (
        i !== 0 &&
        link.source === linksArray[i - 1].source &&
        link.target === linksArray[i - 1].target
      ) {
        if (
          link.interaction === "mention" && link.interaction === linksArray[i - 1].interaction
        ) {
          mentions = linksArray[i - 1].mentions + 1;
        } else if (
          link.interaction === "reply" && link.interaction === linksArray[i - 1].interaction
        ) {
          replies = linksArray[i - 1].replies + 1;
        } else if (
          link.interaction === "retweet" && link.interaction === linksArray[i - 1].interaction
        ) {
          retuits = linksArray[i - 1].retuits + 1;
        }
      }
      return {
        ...link,
        mentions,
        replies,
        retuits,
      }
    });

    // Creamos una muestra de enlaces, solo conservamos el enlace con mayor peso
    const linksSample = _.clone(links);
    linksSample.forEach((link, i, linksArray) => {
      if (
        i !== 0 &&
        link.source === linksArray[i - 1].source &&
        link.target === linksArray[i - 1].target &&
        link.interaction === linksArray[i - 1].interaction
      ) {
        linksSample.splice(i - 1, 1);
        i -= 1;
      }
    });

    // Asigna a cada nodo un atributo por tipo de interacción. Valor inicial es false
    nodes = nodes.map(node => ({
      ...node,
      retweeting: false,
      replying: false,
      mentioning: false
    }));
    // Busca el tipo de interacción de cada enlace, y cambia el atributo de los nodos asignado en el paso anterior OPTIMIZAR
    links.forEach((link) => {
      if (link.interaction) {
        let interaction_type;
        switch (link.interaction) {
          case "reply":
            interaction_type = "replying";
            break;
          case "mention":
            interaction_type = "mentioning";
            break;
          case "retweet":
            interaction_type = "retweeting";
            break;
          default:
            break;
        }
        nodes.forEach((node, index) => {
          if (node.name === link.target || node.name === link.source) {
            nodes[index][interaction_type] = true;
          }
        });
      }
    });

    // Establece el radio de cada nodo con base en su grado de entrada
    let baseRadius = (Math.sqrt(1 / Math.PI)) * 5;
    let baseNodeArea = Math.PI * (baseRadius * baseRadius);
    nodes = nodes.map((node) => ({
      ...node,
      radius: node.inDegree > 0 ? Math.sqrt((baseNodeArea * (node.inDegree * 1.7)) / Math.PI) : baseRadius,
    }));

    //Cuantifica el número de cuentas según su clasificación
    const numCiu = _.reduce(nodes, (result, value, key) => (
      nodes[key].class === "ciudadano" ? result + 1 : result
    ), 0);
    const numMed = _.reduce(nodes, (result, value, key) => (
      nodes[key].class === "medio" ? result + 1 : result
    ), 0);
    const numPol = _.reduce(nodes, (result, value, key) => (
      nodes[key].class === "politico" ? result + 1 : result
    ), 0);

    //Distribución de nodos en RETUITS
    const {
      total: nodesRT,
      medios: rtMedios,
      politicos: rtPoliticos,
      ciudadanos: rtCiudadanos,
    } = getDistributionByInteractionType(nodes, "retweeting");

    //Distribución de nodos en REPLIES
    const {
      total: nodesRP,
      medios: rpMedios,
      politicos: rpPoliticos,
      ciudadanos: rpCiudadanos,
    } = getDistributionByInteractionType(nodes, "replying");

    //Distribución de nodos en MENCIONES
    const {
      total: nodesMn,
      medios: mnMedios,
      politicos: mnPoliticos,
      ciudadanos: mnCiudadanos,
    } = getDistributionByInteractionType(nodes, "mentioning");

    //Añade los nodos completos (i.e.toda la info, no solo el nombre) a source y target en los enlaces
    links.forEach((link, index) => {
      nodes.forEach((node) => {
        if (link.source === node.name) {
          links[index].source = node;
        } else if (link.target === node.name) {
          links[index].target = node;
        }
      });
    });

    // Cuantifica interacciones inter e intra; y cada una la divide por tipo de interacción
    var intraActores = [],
      interActores = [];
    var intraRt = 0,
      intraRp = 0,
      intraMn = 0;
    var interRt = 0,
      interRp = 0,
      interMn = 0;

    links.forEach(function (l) {
      if (l.source.class === l.target.class) {
        intraActores.push(l);
        if (l.interaction === "retweet") {
          intraRt++;
        } else if (l.interaction === "reply") {
          intraRp++;
        } else if (l.interaction === "mention") {
          intraMn++;
        }
      } else if (l.source.class !== l.target.class) {
        interActores.push(l);
        if (l.interaction === "retweet") {
          interRt++;
        } else if (l.interaction === "reply") {
          interRp++;
        } else if (l.interaction === "mention") {
          interMn++;
        }
      }
    });

    //Divide las interacciones intra por tipo de actor
    var intraC = 0,
      intraP = 0,
      intraM = 0;
    var intraCRt = 0,
      intraCRp = 0;
    let intraCM = 0;
    var intraMRt = 0,
      intraMRp = 0;
    let intraMM = 0;
    var intraPRt = 0,
      intraPRp = 0;
    let intraPM = 0;
    intraActores.forEach(function (l) {
      if (l.source.class === "ciudadano" && l.target.class === "ciudadano") {
        intraC++;
        if (l.interaction === "retweet") {
          intraCRt++;
        } else if (l.interaction === "reply") {
          intraCRp++;
        } else if (l.interaction === "mention") {
          intraCM++;
        }
      } else if (l.source.class === "medio" && l.target.class === "medio") {
        intraM++;
        if (l.interaction === "retweet") {
          intraMRt++;
        } else if (l.interaction === "reply") {
          intraMRp++;
        } else if (l.interaction === "mention") {
          intraMM++;
        }
      } else if (l.source.class === "politico" && l.target.class === "politico") {
        intraP++;
        if (l.interaction === "retweet") {
          intraPRt++;
        } else if (l.interaction === "reply") {
          intraPRp++;
        } else if (l.interaction === "mention") {
          intraPM++;
        }
      }
    });

    //Divide las interacciones inter por pares de actores
    var interCM = 0,
      interCP = 0,
      interPM = 0;
    var interCMRt = 0,
      interCMRp = 0,
      interCMM = 0;
    var interCPRt = 0,
      interCPRp = 0,
      interCPM = 0;
    var interPMRt = 0,
      interPMRp = 0,
      interPMM = 0;
    interActores.forEach(function (l) {
      if ((l.source.class === "ciudadano" && l.target.class === "medio") || (l.source.class === "medio" && l.target.class === "ciudadano")) {
        interCM++;
        if (l.interaction === "retweet") {
          interCMRt++;
        } else if (l.interaction === "reply") {
          interCMRp++;
        } else if (l.interaction === "mention") {
          interCMM++;
        }
      } else if ((l.source.class === "ciudadano" && l.target.class === "politico") || (l.source.class === "politico" && l.target.class === "ciudadano")) {
        interCP++;
        if (l.interaction === "retweet") {
          interCPRt++;
        } else if (l.interaction === "reply") {
          interCPRp++;
        } else if (l.interaction === "mention") {
          interCPM++;
        }
      } else if ((l.source.class === "politico" && l.target.class === "medio") || (l.source.class === "medio" && l.target.class === "politico")) {
        interPM++;
        if (l.interaction === "retweet") {
          interPMRt++;
        } else if (l.interaction === "reply") {
          interPMRp++;
        } else if (l.interaction === "mention") {
          interPMM++;
        }
      }
    });

    //Imprime en consola datos cuantitativos sobre el grafo
    console.log(`Número de cuentas (total): ${totalGraphNodes.length}\nNúmero de interacciones (total): ${totalGraphInteractions.length}`);
    console.log(`Número de cuentas (filtrado): ${nodes.length}\nNúmero de interacciones (filtrado): ${links.length}`);

    console.log(`Número de enlaces: ${linksSample.length}`);
    console.log("\n%c Número de cuentas según su clasificación ", "background: white; color: #222;");
    console.log(
      `Ciudadanos: ${numCiu} (${percentage(numCiu, nodes.length)}%)
            \nMedios: ${numMed} (${percentage(numMed, nodes.length)}%)
            \nPoliticos: ${numPol} (${percentage(numPol, nodes.length)}%)`
    );
    console.log("\n%c Número de interacciones según su tipo ", "background: white; color: #222;");
    console.log(
      `Retuits: ${numRT} (${percentage(numRT, links.length)}%)
            \nRespuestas: ${numRP} (${percentage(numRP, links.length)}%)
            \nMenciones: ${numMen} (${percentage(numMen, links.length)}%)`
    );
    console.log("\n%c NODOS CON MAYOR GRADO ", "background: white; color: #222;");
    console.log(topDegree.map((n) => (`${n.name}, ${n.class}, G: ${n.degree}\n`)).join(''));

    console.log("\n%c NODOS CON MAYOR GRADO DE ENTRADA ", "background: white; color: #222;");
    console.log(topInDegree.map((n) => (`${n.name}, ${n.class}, GE: ${n.inDegree}, GS: ${n.outDegree}\n`)).join(''));

    console.log("\n%c NODOS CON MAYOR GRADO DE SALIDA ", "background: white; color: #222;");
    console.log(topOutDegree.map((n) => (`${n.name}, ${n.class}, GE: ${n.inDegree}, GS: ${n.outDegree}\n`)).join(''));

    console.log("\n%c DISTRIBUCIÓN DE NODOS POR TIPO DE INTERACCION ", "background: white; color: #222;");
    console.log(
      `Retuits: C=${percentage(rtCiudadanos, nodesRT)}% (${rtCiudadanos}), SM=${percentage(rtMedios, nodesRT)}% (${rtMedios}), SP=${percentage(rtPoliticos, nodesRT)}% (${rtPoliticos})`
    );
    console.log(
      `Respuestas: C=${percentage(rpCiudadanos, nodesRP)}% (${rpCiudadanos}), SM=${percentage(rpMedios, nodesRP)}% (${rpMedios}), SP=${percentage(rpPoliticos, nodesRP)}% (${rpPoliticos})`
    );
    console.log(
      `Menciones: C=${percentage(mnCiudadanos, nodesMn)}% (${mnCiudadanos}), SM=${percentage(mnMedios, nodesMn)}% (${mnMedios}), SP=${percentage(mnPoliticos, nodesMn)}% (${mnPoliticos})`
    );

    console.log(`\nINTRA-ACTORES: ${intraActores.length} (${percentage(intraActores.length, links.length)}% del total de interacciones)`);
    console.log(`Retuits: ${intraRt}, Respuestas: ${intraRp}, Menciones: ${intraMn}`);
    console.log(`Intra-Ciudadanos: ${intraC} (Retuits: ${intraCRt}, Respuestas: ${intraCRp}, Menciones: ${intraCM} + ")`);
    console.log(`Intra-Medios: ${intraM} (Retuits: ${intraMRt}, Respuestas: ${intraMRp}, Menciones: ${intraMM} + ")`);
    console.log(`Intra-Politicos: ${intraP} (Retuits: ${intraPRt}, Respuestas: ${intraPRp}, Menciones: ${intraPM} + ")`);

    console.log(`\nINTER-ACTOR: ${interActores.length} (${percentage(interActores.length, links.length)}% del total de interacciones)`);
    console.log(`Retuits: ${interRt}, Respuestas: ${interRp}, Menciones: ${interMn}`);
    console.log(`Inter Ciudadanos-Medios: ${interCM} (Retuits: ${interCMRt}, Respuestas: ${interCMRp}, Menciones: ${interCMM} + ")`);
    console.log(`Inter Ciudadanos-Politicos: ${interCP} (Retuits: ${interCPRt}, Respuestas: ${interCPRp}, Menciones: ${interCPM} + ")`);
    console.log(`Inter Politicos-Medios: ${interPM} (Retuits: ${interPMRt}, Respuestas: ${interPMRp}, Menciones: ${interPMM} + ")`);

    return {
      nodes,
      links,
      linksSample,
      topInDegree,
    }
  }