import React, { Component } from 'react';
import data from '../../_mockdata/sampledata.json';
import NetworkVis from '../../components/NetworkVis';
import { parseRawNetworkData } from '../../utils/dataParsing';
import { percentage } from '../../utils/general';
import { Log } from './styles';

class Network extends Component {
  constructor(props) {
    super(props);
    this.initialState = {
      parsedData: '',
    }
    this.state = this.initialState;
  }
  componentDidMount() {
    this.setState({
      parsedData: parseRawNetworkData(data),
    })
  }

  render () {
    return (
      <div>
        You are now connected ~(ºoº)~
        The current network is: {this.props.match.params.networkID}
        {
          this.state.parsedData &&
            <Log>
              <span>{`Número de cuentas (total): ${this.state.parsedData.totalGraphNodes.length}\nNúmero de interacciones (total): ${this.state.parsedData.totalGraphInteractions.length}`}</span>
              <span>{`Número de cuentas (filtrado): ${this.state.parsedData.nodes.length}\nNúmero de interacciones (filtrado): ${this.state.parsedData.links.length}`}</span>
              <span>{`Número de enlaces: ${this.state.parsedData.linksSample.length}`}</span>
              <span>"Número de cuentas según su clasificación "</span>
              <span>{`Ciudadanos: ${this.state.parsedData.numCiu} (${percentage(this.state.parsedData.numCiu, this.state.parsedData.nodes.length)}%)\nMedios: ${this.state.parsedData.numMed} (${percentage(this.state.parsedData.numMed, this.state.parsedData.nodes.length)}%)\nPoliticos: ${this.state.parsedData.numPol} (${percentage(this.state.parsedData.numPol, this.state.parsedData.nodes.length)}%)`}</span>
              <span>"Número de interacciones según su tipo "</span>
              <span>{`Retuits: ${this.state.parsedData.numRT} (${percentage(this.state.parsedData.numRT, this.state.parsedData.links.length)}%)\nRespuestas: ${this.state.parsedData.numRP} (${percentage(this.state.parsedData.numRP, this.state.parsedData.links.length)}%)\nMenciones: ${this.state.parsedData.numMen} (${percentage(this.state.parsedData.numMen, this.state.parsedData.links.length)}%)`}</span>
              <span>"NODOS CON MAYOR GRADO"</span>
              <span>{this.state.parsedData.topDegree.map((n) => (`${n.name}, ${n.class}, G: ${n.degree}\n`)).join('')}</span>
              <span>"NODOS CON MAYOR GRADO DE ENTRADA"</span>
              <span>{this.state.parsedData.topInDegree.map((n) => (`${n.name}, ${n.class}, GE: ${n.inDegree}, GS: ${n.outDegree}\n`)).join('')}</span>
              <span>"NODOS CON MAYOR GRADO DE SALIDA"</span>
              <span>{this.state.parsedData.topOutDegree.map((n) => (`${n.name}, ${n.class}, GE: ${n.inDegree}, GS: ${n.outDegree}\n`)).join('')}</span>
              <span>"DISTRIBUCIÓN DE NODOS POR TIPO DE INTERACCION"</span>
              <span>{`Retuits: C=${percentage(this.state.parsedData.rtCiudadanos, this.state.parsedData.nodesRT)}% (${this.state.parsedData.rtCiudadanos}), SM=${percentage(this.state.parsedData.rtMedios, this.state.parsedData.nodesRT)}% (${this.state.parsedData.rtMedios}), SP=${percentage(this.state.parsedData.rtPoliticos, this.state.parsedData.nodesRT)}% (${this.state.parsedData.rtPoliticos})`}</span>
              <span>{`Respuestas: C=${percentage(this.state.parsedData.rpCiudadanos, this.state.parsedData.nodesRP)}% (${this.state.parsedData.rpCiudadanos}), SM=${percentage(this.state.parsedData.rpMedios, this.state.parsedData.nodesRP)}% (${this.state.parsedData.rpMedios}), SP=${percentage(this.state.parsedData.rpPoliticos, this.state.parsedData.nodesRP)}% (${this.state.parsedData.rpPoliticos})`}</span>
              <span>{`Menciones: C=${percentage(this.state.parsedData.mnCiudadanos, this.state.parsedData.nodesMn)}% (${this.state.parsedData.mnCiudadanos}), SM=${percentage(this.state.parsedData.mnMedios, this.state.parsedData.nodesMn)}% (${this.state.parsedData.mnMedios}), SP=${percentage(this.state.parsedData.mnPoliticos, this.state.parsedData.nodesMn)}% (${this.state.parsedData.mnPoliticos})`}</span>
              <span>{`\nINTRA-ACTORES: ${this.state.parsedData.intraActores.length} (${percentage(this.state.parsedData.intraActores.length, this.state.parsedData.links.length)}% del total de interacciones)`}</span>
              <span>{`Retuits: ${this.state.parsedData.intraRt}, Respuestas: ${this.state.parsedData.intraRp}, Menciones: ${this.state.parsedData.intraMn}`}</span>
              <span>{`Intra-Ciudadanos: ${this.state.parsedData.intraC} (Retuits: ${this.state.parsedData.intraCRt}, Respuestas: ${this.state.parsedData.intraCRp}, Menciones: ${this.state.parsedData.intraCM} + ")`}</span>
              <span>{`Intra-Medios: ${this.state.parsedData.intraM} (Retuits: ${this.state.parsedData.intraMRt}, Respuestas: ${this.state.parsedData.intraMRp}, Menciones: ${this.state.parsedData.intraMM} + ")`}</span>
              <span>{`Intra-Politicos: ${this.state.parsedData.intraP} (Retuits: ${this.state.parsedData.intraPRt}, Respuestas: ${this.state.parsedData.intraPRp}, Menciones: ${this.state.parsedData.intraPM} + ")`}</span>
              <span>{`\nINTER-ACTOR: ${this.state.parsedData.interActores.length} (${percentage(this.state.parsedData.interActores.length, this.state.parsedData.links.length)}% del total de interacciones)`}</span>
              <span>{`Retuits: ${this.state.parsedData.interRt}, Respuestas: ${this.state.parsedData.interRp}, Menciones: ${this.state.parsedData.interMn}`}</span>
              <span>{`Inter Ciudadanos-Medios: ${this.state.parsedData.interCM} (Retuits: ${this.state.parsedData.interCMRt}, Respuestas: ${this.state.parsedData.interCMRp}, Menciones: ${this.state.parsedData.interCMM} + ")`}</span>
              <span>{`Inter Ciudadanos-Politicos: ${this.state.parsedData.interCP} (Retuits: ${this.state.parsedData.interCPRt}, Respuestas: ${this.state.parsedData.interCPRp}, Menciones: ${this.state.parsedData.interCPM} + ")`}</span>
              <span>{`Inter Politicos-Medios: ${this.state.parsedData.interPM} (Retuits: ${this.state.parsedData.interPMRt}, Respuestas: ${this.state.parsedData.interPMRp}, Menciones: ${this.state.parsedData.interPMM} + ")`}</span>
            </Log>
        }
        {
          this.state.parsedData &&
            <NetworkVis
              data={this.state.parsedData}
              width={500}
              height={500}
            />
        }
      </div>
    )
  }
};

export default Network;