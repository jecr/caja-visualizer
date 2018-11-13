import React, { Component } from 'react';
import _  from 'lodash';
import d3 from 'd3';

class NetworkVis extends Component {
  componentDidMount() {
    this.drawNetwork();
  }

  drawNetwork() {
    const {
      data,
      width,
      height
    } = this.props;

    const {
      nodes,
      links,
      linksSample,
      topInDegree,
    } = data;


    /*======================================================================
        PARAMETROS VISUALES DEL GRAFO
    ======================================================================*/

    // Tipo de visualización
    var force = d3.layout.force()
      .charge(function (d) {
        return (d.inDegree + 1) * (-180);
      })
      .linkDistance(40)
      .gravity(.3)
      .size([width, height]);

    var zoom = d3.behavior.zoom()
      .scaleExtent([.1, 8])
      .on("zoom", redraw);

    var currentZoom;

    function getCurrentZoom() {
      currentZoom = zoom.scale();
    }

    // Se inicializa el svg
    var vis = d3.select("#network").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("pointer-events", "all")
      .call(zoom)
      .append("g")
      .attr('id', 'grafo')

    const grafo = document.getElementById('grafo');

    // Zoom
    let grafox;
    let grafoy;
    function redraw() {
      vis.attr("transform",
        "translate(" + d3.event.translate + ")" +
        " scale(" + d3.event.scale + ")");
      // console.log(((grafo.transform.animVal[1].matrix.a) * 100).toFixed(2))
      // console.log( grafo.transform.animVal[ 0 ].matrix.e + ', ' + grafo.transform.animVal[ 0 ].matrix.f );
      grafox = grafo.transform.animVal[0].matrix.e;
      grafoy = grafo.transform.animVal[0].matrix.f;
    }

    /* document.getElementsByClassName('boton')[0].on('click', function () {
        var dcx = (window.innerWidth / 2 - grafox * zoom.scale());
        var dcy = (window.innerHeight / 2 - grafoy * zoom.scale());
        zoom.translate([dcx, dcy]);
        vis.attr("transform", "translate(" + dcx + "," + dcy + ") scale(" + zoom.scale() + ")");
    }); */

    force
      .nodes(nodes)
      .links(linksSample)
      .start();

    var link = vis.selectAll(".link")
      .data(linksSample)
      .enter()
      .append("path")
      .attr("class", function (d) {
        return d.interaction;
      })
      .attr("fill", "none")
      .style("stroke-width", function (d) {
        if (d.interaction === "reply") {
          return d.replies;
        } else if (d.interaction === "retweet") {
          return d.retuits;
        } else {
          return d.mentions;
        }
      })
      .style("marker-end", "url(#flecha)");

    var linkLabel = vis.selectAll(".label")
      .data(linksSample)
      .enter()
      .append("text")
      .attr("dx", 0)
      .attr("dy", 0)
      .attr("class", "label")
      .text(function (d) {
        if (d.replies > 1) {
          return d.replies;
        } else if (d.retuits > 1) {
          return d.retuits;
        } else if (d.mentions > 1) {
          return d.mentions;
        }
      })
      .style("opacity", 0);

    var marker = vis.selectAll("marker")
      .data(linksSample)
      .enter()
      .append("marker")
      .attr("id", "flecha")
      .attr("viewBox", "0 -8 16 16")
      .attr("refX", 15)
      .attr("markerUnits", "userSpaceOnUse")
      .attr("markerWidth", 10)
      .attr("markerHeight", 15)
      .attr("orient", "auto")
      .append("path")
      .attr("stroke", "#14141c")
      .attr("fill", "#F2F3F4")
      .attr("stroke-width", 1)
      .attr("d", "M0,-5 L 14,0 L0,5 L4,0 Z");

    var drag = force.drag()
      .on("dragstart", function (d) {
        d3.event.sourceEvent.stopPropagation();
        d3.event.sourceEvent.preventDefault();
      });

    var node = vis.selectAll(".node")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("id", function (d) {
        return "c" + d.name;
      })
      .attr("r", function (d) {
        return d.radius;
      })
      .attr("class", function (d) {
        return d.class;
      })
      .on("mouseover", function (d) {  //Mouse event
        tooltip.style("display", null)
      })
      .on("mouseout", function (d) {  //Mouse event
        tooltip.style("display", "none");
      })
      .on("mousemove", function (d) {  //Mouse event
        getCurrentZoom();
        var yShift;
        if (currentZoom < 0.5) {
          yShift = 85;
        } else if (currentZoom > 3) {
          yShift = 20;
        }
        else {
          yShift = 40;
        }
        var xPos = d3.mouse(this)[0];
        var yPos = d3.mouse(this)[1] - yShift;

        tooltip.attr("font-size", function () {
          if (currentZoom < 0.35) {
            return "42px";
          } else if (currentZoom > 3) {
            return "12px";
          }
          else {
            return "18px";
          }
        })
          .attr("transform", "translate(" + xPos + ", " + yPos + ")")
        tooltip.select("text")
          .text(d.name + " | GE:" + d.inDegree + " GS:" + d.outDegree)
      })
      .on('click', function (d) {
        if (d3.event.defaultPrevented === false) {
          connectedNodes(d);
          d3.selectAll("#selectors input[type=checkbox]")
            .property("checked", true);
          howMany = 3;
        }
      });

    var tooltip = vis.append("g")
      .attr("class", "tooltip")
      .style("display", "none");

    tooltip.append("text")
      .attr("x", 15)
      .attr("dy", "1.2em");

    var text = vis.selectAll(".text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("dx", 16)
      .attr("dy", 6)
      .attr("class", "text")
      .attr("font-size", function (d) {
        return Math.sqrt((d.inDegree + 10) * 25) + "px";
      })
      .text(function (d) {
        for (let i = 0; i < topInDegree.length; i++) {
          const name = topInDegree[i].name;
          if (d.name === name) {
            return d.name;
          }
        }
      })
      .style("opacity", 0);

    force.on("tick", function () {
      link.attr("d", function (d) {

        //Enlaces bidireccionales curvos, unidireccionales rectos
        let diffX = d.target.x - d.source.x;
        let diffY = d.target.y - d.source.y;

        // Length of path from center of source node to center of target node
        let pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

        // x and y distances from center to outside edge of target node
        if (pathLength === 0) {
          pathLength = 0.01;
        }

        let offsetX = (diffX * d.target.radius) / pathLength;
        let offsetY = (diffY * d.target.radius) / pathLength;

        let dr = (d.straight === 1) ? 0 : Math.sqrt(diffX * diffX + diffY * diffY) * d.linknum;


        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
      });

      node.attr("cx", function (d) {
        return d.x;
      })
        .attr("cy", function (d) {
          return d.y;
        });

      text.attr("x", function (d) {
        return d.x;
      })
        .attr("y", function (d) {
          return d.y;
        });

      linkLabel.attr("x", function (d) {
        return (d.source.x + d.target.x) / 2;
      })
        .attr("y", function (d) {
          return (d.source.y + d.target.y) / 2;
        });
    });


    /*======================================================================
        FILTROS Y FUNCIONES INTERACTIVAS
    ======================================================================*/

    // Almacena las conexiones entre nodos
    var linkedByIndex = {};
    links.forEach(function (d) {
      linkedByIndex[d.source.name + "," + d.target.name] = 1;
    });

    // Verifica si un par de nodos son vecinos
    function neighboring(a, b) {
      return linkedByIndex[a.name + "," + b.name] || a.name === b.name;
    }

    // Crea una lista de adyacencia: {[Nodo1: vecino1,..., vecino n],...,[Nodon]}
    const adjacencyList = {};
    nodes.forEach(function (d) {
      const neighborhood = [];
      adjacencyList[d.name] = neighborhood;
      nodes.forEach(function (n) {
        if (neighboring(d, n) | neighboring(n, d) && n !== d) {
          neighborhood.push(n.name);
        }
      });
    });

    // Establece si un nodo es vecino de medio, de ciudadano o de politico
    nodes.forEach(function (n) {
      Object.keys(adjacencyList)
        .forEach(function (v) {
          if (n.name === v && n.class === "medio") {
            adjacencyList[v].forEach(function (d) {
              nodes.forEach(function (e) {
                if (e.name === d) {
                  e.vDeM = true;
                }
              });
            });
          } else if (n.name === v && n.class === "ciudadano") {
            adjacencyList[v].forEach(function (d) {
              nodes.forEach(function (e) {
                if (e.name === d) {
                  e.vDeC = true;
                }
              });
            });
          } else if (n.name === v && n.class === "politico") {
            adjacencyList[v].forEach(function (d) {
              nodes.forEach(function (e) {
                if (e.name === d) {
                  e.vDeP = true;
                }
              });
            });
          }
        });
    });

    // Subconjuntos de nodos por tipo de interacción
    var RtRpM = [],
      RtRp = [],
      RtM = [],
      RpM = [],
      Rp = [],
      Rt = [],
      M = [];
    nodes.forEach(function (d) {
      //Retuits+Replies+Menciones
      if (d.retweeting === true && d.replying === true && d.mentioning === true) {
        RtRpM.push(d);
      }
      //Retuits+Replies-Menciones
      if ((d.retweeting === true && d.replying === true && d.mentioning === false) || (d.replying === true && d.mentioning === false && d.retweeting === false) || (d.retweeting === true && d.replying === false && d.mentioning === false)) {
        RtRp.push(d);
      }
      //Retuits+Menciones-Replies
      if ((d.retweeting === true && d.replying === false && d.mentioning === false) || (d.retweeting === true && d.mentioning === true && d.replying === false) || (d.mentioning === true && d.retweeting === false && d.replying === false)) {
        RtM.push(d);
      }
      //Replies+Menciones-Retuits
      if ((d.replying === true && d.mentioning === true && d.retweeting === false) || (d.replying === true && d.mentioning === false && d.retweeting === false) || (d.mentioning === true && d.retweeting === false && d.replying === false)) {
        RpM.push(d);
      }
      if (d.replying === true && d.mentioning === false && d.retweeting === false) {
        Rp.push(d);
      }
      if (d.retweeting === true && d.replying === false && d.mentioning === false) {
        Rt.push(d);
      }
      if (d.mentioning === true && d.retweeting === false && d.replying === false) {
        M.push(d);
      }
    });

    // Subconjuntos de enlaces
    var eRpRt = [],
      eRpM = [],
      eRtM = [];
    links.forEach(function (d) {
      if (d.interaction === "retweet" || d.interaction === "reply") {
        eRpRt.push(d);
      }
      if (d.interaction === "reply" || d.interaction === "mention") {
        eRpM.push(d);
      }
      if (d.interaction === "retweet" || d.interaction === "mention") {
        eRtM.push(d);
      }
    });

    //Checa cuántos checkboxes de tipos de interacción están activos y ejecuta una función para mostrar/esconder interacciones
    var howMany = 3;
    d3.selectAll("#selectors input[type=checkbox]")
      .on("click", function () {
        if (this.checked === true) {
          howMany++;
        } else if (this.checked === false && howMany > 0) {
          howMany--;
        } else if (howMany < 0) {
          howMany = 0;
        }
        hideElements();
      });

    //Checa qué checkboxes están seleccionados y oculta enlaces, con sus respectivos nodos, según tipo de interacción
    function hideElements() {
      d3.selectAll("#selectors input[type=checkbox]")
        .each(function (d) {
          // if(howMany===3){
          //   node.style("opacity",1);
          //   link.style("opacity",1);
          // }
          switch (howMany) {
            case 0:
              node.style("opacity", 0);
              link.style("opacity", 0);
              d3.selectAll("#enlaces2")
                .property("checked", false);
              cambio = 1;
              break;
            case 1:
              if (d3.select("#Retweets")
                .property("checked") === true) {
                link.find(function (d) {
                  for (let i = 0; i < eRpM.length; i++) {
                    if (d === eRpM[i]) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
                node.filter(function (d) {
                  for (let i = 0; i < RpM.length; i++) {
                    if (d.name === RpM[i].name) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
              }
              if (d3.select("#Replies")
                .property("checked") === true) {
                link.filter(function (d) {
                  for (let i = 0; i < eRtM.length; i++) {
                    if (d === eRtM[i]) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
                node.filter(function (d) {
                  for (let i = 0; i < RtM.length; i++) {
                    var nodo = RtM[i];
                    if (d.name === RtM[i].name) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
              }
              if (d3.select("#Mentions")
                .property("checked") === true) {
                link.filter(function (d) {
                  for (let i = 0; i < eRpRt.length; i++) {
                    if (d === eRpRt[i]) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
                node.filter(function (d) {
                  for (let i = 0; i < RtRp.length; i++) {
                    var nodo = RtRp[i];
                    if (d.name === RtRp[i].name) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
              }
              break;
            case 2:
              if (d3.select("#Replies")
                .property("checked") === true && d3.select("#Retweets")
                  .property("checked") === true) {
                link.filter(function (d) {
                  return d.interaction === "mention";
                })
                  .style("opacity", 0);
                node.filter(function (d) {
                  for (let i = 0; i < M.length; i++) {
                    var nodo = M[i];
                    if (d.name === M[i].name) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
              }
              if (d3.select("#Replies")
                .property("checked") === true && d3.select("#Mentions")
                  .property("checked") === true) {
                link.filter(function (d) {
                  return d.interaction === "retweet";
                })
                  .style("opacity", 0);
                node.filter(function (d) {
                  for (let i = 0; i < Rt.length; i++) {
                    var nodo = Rt[i];
                    if (d.name === Rt[i].name) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
              }
              if (d3.select("#Retweets")
                .property("checked") === true && d3.select("#Mentions")
                  .property("checked") === true) {
                link.filter(function (d) {
                  return d.interaction === "reply";
                })
                  .style("opacity", 0);
                node.filter(function (d) {
                  for (let i = 0; i < Rp.length; i++) {
                    var nodo = Rp[i];
                    if (d.name === Rp[i].name) {
                      return d;
                    }
                  }
                })
                  .style("opacity", 0);
              }
              break;
            default:
              break;
          }
        });
    }

    //Checa qué checkboxes se desactivan y muestra enlaces, con sus respectivos nodos, según tipo de interacción
    d3.selectAll("#selectors label")
      .on("mouseup", function (d) {
        if (d3.select("#Mentions")
          .property("checked" === true)) {
          link.filter(function (d) {
            for (let i = 0; i < eRpRt.length; i++) {
              if (d === eRpRt[i]) {
                return d;
              }
            }
          })
            .style("opacity", 1);
          node.filter(function (d) {
            for (let i = 0; i < RtRp.length; i++) {
              let nodo = RtRp[i];
              if (d.name === RtRp[i].name) {
                return d;
              }
            }
            for (let i = 0; i < RtRpM.length; i++) {
              let nodo = RtRpM[i];
              if (d.name === RtRpM[i].name) {
                return d;
              }
            }
          })
            .style("opacity", 1);
          d3.selectAll("#enlaces2")
            .property("checked", true);
          cambio = 0;
        }
        if (d3.select("#Retweets")
          .property("checked" === true)) {
          link.filter(function (d) {
            for (let i = 0; i < eRpM.length; i++) {
              if (d === eRpM[i]) {
                return d;
              }
            }
          })
            .style("opacity", 1);
          node.filter(function (d) {
            for (let i = 0; i < RpM.length; i++) {
              let nodo = RpM[i];
              if (d.name === RpM[i].name) {
                return d;
              }
            }
            for (let i = 0; i < RtRpM.length; i++) {
              let nodo = RtRpM[i];
              if (d.name === RtRpM[i].name) {
                return d;
              }
            }
          })
            .style("opacity", 1);
          d3.selectAll("#enlaces2")
            .property("checked", true);
          cambio = 0;
        }
        if (d3.select("#Replies")
          .property("checked" === true)) {
          link.filter(function (d) {
            for (let i = 0; i < eRtM.length; i++) {
              if (d === eRtM[i]) {
                return d;
              }
            }
          })
            .style("opacity", 1);
          node.filter(function (d) {
            for (let i = 0; i < RtM.length; i++) {
              let nodo = RtM[i];
              if (d.name === RtM[i].name) {
                return d;
              }
            }
            for (let i = 0; i < RtRpM.length; i++) {
              let nodo = RtRpM[i];
              if (d.name === RtRpM[i].name) {
                return d;
              }
            }
          })
            .style("opacity", 1);
          d3.selectAll("#enlaces2")
            .property("checked", true);
          cambio = 0;
        }
      });

    //Checa cuántos checkboxes de nodos están activos y ejecuta una función para mostrar/esconder nodos
    var howManyNodes = 3;
    d3.selectAll("#selectorsNodes input[type=checkbox]")
      .on("click", function () {
        if (this.checked === true) {
          howManyNodes++;
        } else if (this.checked === false && howManyNodes > 0) {
          howManyNodes--;
        } else if (howManyNodes < 0) {
          howManyNodes = 0;
        }
        hidingNodes();
      });

    var cambiaTamanio = 0;
    const baseRadius = (Math.sqrt(1 / Math.PI)) * 5;
    const baseNodeArea = Math.PI * (baseRadius * baseRadius);
    d3.selectAll("#degree input")
      .on("click", function (d) {
        if (d3.select("#inDegree")
          .property("checked") === true) {
          nodes.forEach(function (d) {
            if (d.inDegree > 0) {
              d.radius = Math.sqrt((baseNodeArea * (d.inDegree * 1.7)) / Math.PI);
            } else {
              d.radius = baseRadius;
            }
          });
          node.attr("r", function (n) {
            return n.radius;
          });
          link.attr("d", function (d) {

            //Enlaces bidireccionales curvos, unidireccionales rectos
            const diffX = d.target.x - d.source.x;
            const diffY = d.target.y - d.source.y;

            // Length of path from center of source node to center of target node
            let pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

            // x and y distances from center to outside edge of target node
            if (pathLength === 0) {
              pathLength = 0.01;
            }

            const offsetX = (diffX * d.target.radius) / pathLength;
            const offsetY = (diffY * d.target.radius) / pathLength;

            const dr = (d.straight === 1) ? 0 : Math.sqrt(diffX * diffX + diffY * diffY) * d.linknum;


            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
          });
          cambiaTamanio = 0;
          tamanio = 0;
        } else if (d3.select("#outDegree")
          .property("checked") === true) {
          nodes.forEach(function (d) {
            if (d.outDegree > 0) {
              d.radius = Math.sqrt((baseNodeArea * (d.outDegree * 1.7)) / Math.PI);
            } else {
              d.radius = baseRadius;
            }
          });
          node.attr("r", function (n) {
            return n.radius;
          });
          link.attr("d", function (d) {

            //Enlaces bidireccionales curvos, unidireccionales rectos
            const diffX = d.target.x - d.source.x;
            const diffY = d.target.y - d.source.y;

            // Length of path from center of source node to center of target node
            let pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

            // x and y distances from center to outside edge of target node
            if (pathLength === 0) {
              pathLength = 0.01;
            }

            const offsetX = (diffX * d.target.radius) / pathLength;
            const offsetY = (diffY * d.target.radius) / pathLength;

            const dr = (d.straight === 1) ? 0 : Math.sqrt(diffX * diffX + diffY * diffY) * d.linknum;


            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
          });
          cambiaTamanio = 1;
          tamanio = 0;
        }
      });

    //Verifica qué checkboxes están activos y solo muestra enlaces/nodos de las categorías seleccionadas
    function hidingNodes() {
      d3.selectAll("#selectorsNodes input")
        .each(function (d) {
          if (howManyNodes === 0) {
            node.style("opacity", 0);
            link.style("opacity", 0);
          } else if (howManyNodes === 2 && d3.select("#Politicos")
            .property("checked") === true && d3.select("#Medios")
              .property("checked") === true) {
            link.filter(function (l) {
              if (l.source.class === "ciudadano" || l.target.class === "ciudadano") {
                return l;
              }
            })
              .style("opacity", 0);
            node.filter(function (n) {
              if (n.class === "ciudadano") {
                return n;
              } else if (n.class === "medio" && n.vDeC === true && n.vDeM === undefined && n.vDeP === undefined) {
                return n;
              } else if (n.class === "politico" && n.vDeC === true && n.vDeM === undefined && n.vDeP === undefined) {
                return n;
              }
            })
              .style("opacity", 0);
            text.style("opacity", 0);
            top10Labels = 0;
          } else if (howManyNodes === 2 && d3.select("#Politicos")
            .property("checked") === true && d3.select("#Ciudadanos")
              .property("checked") === true) {
            link.filter(function (l) {
              if (l.source.class === "medio" || l.target.class === "medio") {
                return l;
              }
            })
              .style("opacity", 0);
            node.filter(function (n) {
              if (n.class === "medio") {
                return n;
              } else if (n.class === "ciudadano" && n.vDeM === true && n.vDeC === undefined && n.vDeP === undefined) {
                return n;
              } else if (n.class === "politico" && n.vDeM === true && n.vDeC === undefined && n.vDeP === undefined) {
                return n;
              }
            })
              .style("opacity", 0);
            text.style("opacity", 0);
            top10Labels = 0;
          } else if (howManyNodes === 2 && d3.select("#Medios")
            .property("checked") === true && d3.select("#Ciudadanos")
              .property("checked") === true) {
            link.filter(function (l) {
              if (l.source.class === "politico" || l.target.class === "politico") {
                return l;
              }
            })
              .style("opacity", 0);
            node.filter(function (n) {
              if (n.class === "politico") {
                return n;
              } else if (n.class === "ciudadano" && n.vDeP === true && n.vDeC === undefined && n.vDeM === undefined) {
                return n;
              } else if (n.class === "medio" && n.vDeP === true && n.vDeC === undefined && n.vDeM === undefined) {
                return n;
              }
            })
              .style("opacity", 0);
            text.style("opacity", 0);
            top10Labels = 0;
          } else if (howManyNodes === 1 && d3.select("#Medios")
            .property("checked") === true) {
            link.filter(function (l) {
              if (l.source.class === "medio" && l.target.class === "medio") {
                return l;
              }
            })
              .style("opacity", 1);
            link.filter(function (l) {
              if (l.source.class !== "medio" || l.target.class !== "medio") {
                return l;
              }
            })
              .style("opacity", 0);
            node.filter(function (n) {
              if (n.class === "medio" && n.vDeP === undefined && n.vDeC === undefined && n.vDeM === true) {
                return n;
              }
            })
              .style("opacity", 1);
            node.filter(function (n) {
              if (n.class !== "medio") {
                return n;
              } else if (n.class === "medio" && n.vDeP === true && n.vDeC === true && n.vDeM === undefined) {
                return n;
              } else if (n.class === "medio" && n.vDeP === true && n.vDeC === undefined && n.vDeM === undefined) {
                return n;
              } else if (n.class === "medio" && n.vDeP === undefined && n.vDeC === true && n.vDeM === undefined) {
                return n;
              }
            })
              .style("opacity", 0);
            text.style("opacity", 0);
            top10Labels = 0;
          } else if (howManyNodes === 1 && d3.select("#Politicos")
            .property("checked") === true) {
            link.filter(function (l) {
              if (l.source.class === "politico" && l.target.class === "politico") {
                return l;
              }
            })
              .style("opacity", 1);
            link.filter(function (l) {
              if (l.source.class !== "politico" || l.target.class !== "politico") {
                return l;
              }
            })
              .style("opacity", 0);
            node.filter(function (n) {
              if (n.class === "politico" && n.vDeP === true && n.vDeC === undefined && n.vDeM === undefined) {
                return n;
              }
            })
              .style("opacity", 1);
            node.filter(function (n) {
              if (n.class !== "politico") {
                return n;
              } else if (n.class === "politico" && n.vDeP === undefined && n.vDeC === true && n.vDeM === true) {
                return n;
              } else if (n.class === "politico" && n.vDeP === undefined && n.vDeC === undefined && n.vDeM === true) {
                return n;
              } else if (n.class === "politico" && n.vDeP === undefined && n.vDeC === true && n.vDeM === undefined) {
                return n;
              }
            })
              .style("opacity", 0);
            text.style("opacity", 0);
            top10Labels = 0;
          } else if (howManyNodes === 1 && d3.select("#Ciudadanos")
            .property("checked") === true) {
            link.filter(function (l) {
              if (l.source.class === "ciudadano" && l.target.class === "ciudadano") {
                return l;
              }
            })
              .style("opacity", 1);
            link.filter(function (l) {
              if (l.source.class !== "ciudadano" || l.target.class !== "ciudadano") {
                return l;
              }
            })
              .style("opacity", 0);
            node.filter(function (n) {
              if (n.class === "ciudadano" && n.vDeP === undefined && n.vDeC === true && n.vDeM === undefined) {
                return n;
              }
            })
              .style("opacity", 1);
            node.filter(function (n) {
              if (n.class !== "ciudadano") {
                return n;
              } else if (n.class === "ciudadano" && n.vDeP === true && n.vDeC === undefined && n.vDeM === true) {
                return n;
              } else if (n.class === "ciudadano" && n.vDeP === true && n.vDeC === undefined && n.vDeM === undefined) {
                return n;
              } else if (n.class === "ciudadano" && n.vDeP === undefined && n.vDeC === undefined && n.vDeM === true) {
                return n;
              }
            })
              .style("opacity", 0);
            text.style("opacity", 0);
            top10Labels = 0;
          }
        });
    }

    //Muestra los nodos ocultados con la función hidingNodes()
    d3.selectAll("#selectorsNodes label")
      .on("mousedown", function (d) {
        if (d3.select("#Ciudadanos")
          .property("checked" === false && howManyNodes === 2)) {
          link.filter(function (l) {
            if (l.source.class === "ciudadano" || l.target.class === "ciudadano") {
              return l;
            }
          })
            .style("opacity", 1);
          node.style("opacity", 1);
        }
        if (d3.select("#Medios")
          .property("checked" === false && howManyNodes === 2)) {
          link.filter(function (l) {
            if (l.source.class === "medio" || l.target.class === "medio") {
              return l;
            }
          })
            .style("opacity", 1);
          node.style("opacity", 1);
        }
        if (d3.select("#Politicos")
          .property("checked" === false && howManyNodes === 2)) {
          link.filter(function (l) {
            if (l.source.class === "politico" || l.target.class === "politico") {
              return l;
            }
          })
            .style("opacity", 1);
          node.style("opacity", 1);
        }

      });

    // Destaca vecinos cuando se da clic en un nodo
    var toggle = 0;

    function connectedNodes(d) {
      if (toggle === 0) {
        node.style("opacity", function (o) {
          return neighboring(d, o) | neighboring(o, d) ? 1 : 0;
        });
        link.style("opacity", function (o) {
          return d.index === o.source.index | d.index === o.target.index ? 1 : 0;
        });
        text.style("opacity", 0);
        linkLabel.style("opacity", function (o) {
          return d.index === o.source.index | d.index === o.target.index ? 1 : 0;
        });
        toggle = 1;
      } else {
        node.style("opacity", 1);
        link.style("opacity", 1);
        // text.style("opacity", 1);
        linkLabel.style("opacity", 0);
        toggle = 0;
      }
    }

    //Ejecuta la búsqueda de un nodo al hace clic en el botón Buscar
    d3.select("#buscar")
      .on("click", function (d) {
        buscar();
      });

    //Encuentra el nodo solicitado por el usuario y lo selecciona junto con su vecindario
    function buscar() {
      nodes.forEach(function (d) {
        var userInput = document.getElementById("buscador");
        var str1 = d.name,
          str2 = userInput.value;
        if (str1.toLowerCase() === str2.toLowerCase()) {
          connectedNodes(d);
        }
      });
    }

    //Sugiere opciones a partir de lo escrito en el input de búsqueda // TODO
    /* $(function () {
        var tags = [];
        nodes.forEach(function (d) {
            tags.push(d.name);
            return tags;
        });
        $('#buscador')
            .autocomplete({
                source: tags
            });
    }); */

    // BOTON: Asigna el mismo tamaño a todos los nodos
    d3.select("#tamanio")
      .on("click", function (d) {
        sameSize();
      });
    var tamanio = 0;

    function sameSize() {
      const baseRadius = (Math.sqrt(1 / Math.PI)) * 5;
      const baseNodeArea = Math.PI * (baseRadius * baseRadius);

      if (tamanio === 0) {
        nodes.forEach(function (d) {
          d.radius = baseRadius;
        });
        node.attr("r", function (n) {
          return n.radius;
        });
        link.attr("d", function (d) {

          //Enlaces bidireccionales curvos, unidireccionales rectos
          const diffX = d.target.x - d.source.x;
          const diffY = d.target.y - d.source.y;

          // Length of path from center of source node to center of target node
          let pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

          // x and y distances from center to outside edge of target node
          if (pathLength === 0) {
            pathLength = 0.01;
          }

          const offsetX = (diffX * d.target.radius) / pathLength;
          const offsetY = (diffY * d.target.radius) / pathLength;

          const dr = (d.straight === 1) ? 0 : Math.sqrt(diffX * diffX + diffY * diffY) * d.linknum;


          return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
        });
        tamanio = 1;
      } else if (tamanio === 1 && cambiaTamanio === 0) {
        nodes.forEach(function (d) {
          if (d.inDegree > 0) {
            d.radius = Math.sqrt((baseNodeArea * (d.inDegree * 1.7)) / Math.PI);
          } else {
            d.radius = baseRadius;
          }
        });
        node.attr("r", function (n) {
          return n.radius;
        });
        link.attr("d", function (d) {

          //Enlaces bidireccionales curvos, unidireccionales rectos
          const diffX = d.target.x - d.source.x;
          const diffY = d.target.y - d.source.y;

          // Length of path from center of source node to center of target node
          let pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

          // x and y distances from center to outside edge of target node
          if (pathLength === 0) {
            pathLength = 0.01;
          }

          const offsetX = (diffX * d.target.radius) / pathLength;
          const offsetY = (diffY * d.target.radius) / pathLength;

          const dr = (d.straight === 1) ? 0 : Math.sqrt(diffX * diffX + diffY * diffY) * d.linknum;


          return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
        });
        cambiaTamanio = 0;
        tamanio = 0;
      } else if (tamanio === 1 && cambiaTamanio === 1) {
        nodes.forEach(function (d) {
          if (d.outDegree > 0) {
            d.radius = Math.sqrt((baseNodeArea * (d.outDegree * 1.7)) / Math.PI);
          } else {
            d.radius = baseRadius;
          }
        });
        node.attr("r", function (n) {
          return n.radius;
        });
        link.attr("d", function (d) {

          //Enlaces bidireccionales curvos, unidireccionales rectos
          const diffX = d.target.x - d.source.x;
          const diffY = d.target.y - d.source.y;

          // Length of path from center of source node to center of target node
          let pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

          // x and y distances from center to outside edge of target node
          if (pathLength === 0) {
            pathLength = 0.01;
          }

          const offsetX = (diffX * d.target.radius) / pathLength;
          const offsetY = (diffY * d.target.radius) / pathLength;

          const dr = (d.straight === 1) ? 0 : Math.sqrt(diffX * diffX + diffY * diffY) * d.linknum;


          return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1" + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
        });
        tamanio = 0;
      }
    }

    // BOTON: Cambia el fondo negro o blanco
    d3.select("#background")
      .on("click", function (d) {
        changeBackground();
      });

    var cambiaFondo = 0;

    function changeBackground() {
      if (cambiaFondo === 0) {
        d3.select("body")
          .style("background-color", "#F2F3F4");
        marker.attr("stroke", "#fff")
          .attr("fill", "#000");
        linkLabel.attr("class", "label2");
        text.attr("class", "text2");
        cambiaFondo = 1;
      } else if (cambiaFondo === 1) {
        d3.select("body")
          .style("background-color", "#14141c");
        marker.attr("stroke", "#14141c")
          .attr("fill", "#F2F3F4");
        linkLabel.attr("class", "label");
        text.attr("class", "text");
        cambiaFondo = 0;
      }
    }

    // BOTON: Muestra/oculta los nombres enlaces bidireccionales
    d3.select("#bidirect")
      .on("click", function (d) {
        muestraEnlacesBi();
      });
    var enlacesBi = 0;

    function muestraEnlacesBi() {
      if (enlacesBi === 0) {
        link.style("opacity", 0);
        var linksCurvos = [];
        var linksBi = [];
        links.forEach(function (l) {
          if (l.straight === 0) {
            linksCurvos.push(l);
          }
        });
        link.filter(function (l) {
          for (let i = 0; i < linksCurvos.length; i++) {
            if (l.source === linksCurvos[i].target && l.target === linksCurvos[i].source) {
              linksBi.push(l);
              return l;
            }
          }
        })
          .style("opacity", 1);
        node.style("opacity", 0);
        node.filter(function (n) {
          for (let i = 0; i < linksBi.length; i++) {
            if (n.name === linksBi[i].source.name || n.name === linksBi[i].target.name) {
              return n;
            }
          }
        })
          .style("opacity", 1);
        enlacesBi = 1;
      } else if (enlacesBi === 1) {
        link.style("opacity", 1);
        node.style("opacity", 1);
        enlacesBi = 0;
      }

    }

    // BOTON: Muestra/oculta los nombres del top10
    var top10Labels = 0;
    d3.select("#et")
      .on("click", function (d) {
        if (top10Labels === 0 && howManyNodes === 3) {
          // text.transition(350)
          text.style("opacity", 1);
          top10Labels = 1;
        } else if (top10Labels === 1) {
          // text.transition(350)
          text.style("opacity", 0);
          top10Labels = 0;
        }
      });

    // BOTON: Quita o devuelve los colores por categoría de todos los nodos
    var cambioColor = 0;
    d3.select("#nc")
      .on("click", function (d) {
        if (cambioColor === 0) {
          node.attr("class", "node");
          cambioColor = 1;
        } else if (cambioColor === 1) {
          node.attr("class", function (d) {
            return d.class;
          });
          cambioColor = 0;
        }
      });

    // BOTON: Muestra/oculta todos los enlaces
    var cambio = 0;
    d3.select("#enlaces2")
      .on("click", function (d) {
        if (cambio === 0 && howMany === 3) {
          link.style("opacity", 0);
          cambio = 1;
          d3.selectAll("#selectors input[type=checkbox]")
            .property("checked", false);
          howMany = 0;
        } else if ((cambio === 1 && (howMany === 0 | howMany === 3))) {
          link.style("opacity", 1);
          node.style("opacity", 1);
          cambio = 0;
          d3.selectAll("#selectors input[type=checkbox]")
            .property("checked", true);
          howMany = 3;
        }
      });
  }

  render() {
    return <div id={`network`}></div>
  }
}

export default NetworkVis;