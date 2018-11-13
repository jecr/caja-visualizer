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
        <h3>Red actual: {this.props.match.params.networkID}</h3>
        {
          this.state.parsedData &&
            <Log>
              <span><strong>Número de cuentas (total): </strong>{this.state.parsedData.totalGraphNodes.length}</span>
              <span><strong>Número de interacciones (total): </strong>{this.state.parsedData.totalGraphInteractions.length}</span>
              <span><strong>Número de interacciones (filtrado): </strong>{this.state.parsedData.nodes.length}</span>
              <span><strong>Número de interacciones (filtrado): </strong>{this.state.parsedData.links.length}</span>
              <span><strong>Número de enlaces: </strong>{this.state.parsedData.linksSample.length}</span>
              
              <h3>Número de cuentas según su clasificación</h3>
              <span><strong>Ciudadanos: </strong>{`${this.state.parsedData.numCiu} (${percentage(this.state.parsedData.numCiu, this.state.parsedData.nodes.length)}%)`}</span>
              <span><strong>Medios: </strong>{`${this.state.parsedData.numMed} (${percentage(this.state.parsedData.numMed, this.state.parsedData.nodes.length)}%)`}</span>
              <span><strong>Politicos: </strong>{`${this.state.parsedData.numPol} (${percentage(this.state.parsedData.numPol, this.state.parsedData.nodes.length)}%)`}</span>

              <h3>Número de interacciones según su tipo</h3>
              <span><strong>Retuits: </strong>{`${this.state.parsedData.numRT} (${percentage(this.state.parsedData.numRT, this.state.parsedData.links.length)}%)`}</span>
              <span><strong>Respuestas: </strong>{`${this.state.parsedData.numRP} (${percentage(this.state.parsedData.numRP, this.state.parsedData.links.length)}%)`}</span>
              <span><strong>Menciones: </strong>{`${this.state.parsedData.numMen} (${percentage(this.state.parsedData.numMen, this.state.parsedData.links.length)}%)`}</span>
              
              <h3>NODOS CON MAYOR GRADO</h3>
              {
                <ol>
                  {
                    this.state.parsedData.topDegree.map((n) => (
                      <li key={`topDegree_${n.name}`}><strong>{n.name}</strong>{`, ${n.class}, G: ${n.degree}`}</li>
                    ))
                  }
                </ol>
              }
              
              <h3>NODOS CON MAYOR GRADO DE ENTRADA</h3>
              {
                <ol>
                  {
                    this.state.parsedData.topInDegree.map((n) => (
                      <li key={`topInDegree_${n.name}`}><strong>{n.name}</strong>{`, ${n.class}, GE: ${n.inDegree}, GS: ${n.outDegree}`}</li>
                    ))
                  }
                </ol>
              }
              
              <h3>NODOS CON MAYOR GRADO DE SALIDA</h3>
              {
                <ol>
                  {
                    this.state.parsedData.topOutDegree.map((n) => (
                      <li key={`topOutDegree_${n.name}`}><strong>{n.name}</strong>{`, ${n.class}, GE: ${n.inDegree}, GS: ${n.outDegree}`}</li>
                    ))
                  }
                </ol>
              }
              
              <h3>DISTRIBUCIÓN DE NODOS POR TIPO DE INTERACCION</h3>
              <span><strong>Retuits: </strong>{`C=${percentage(this.state.parsedData.rtCiudadanos, this.state.parsedData.nodesRT)}% (${this.state.parsedData.rtCiudadanos}), SM=${percentage(this.state.parsedData.rtMedios, this.state.parsedData.nodesRT)}% (${this.state.parsedData.rtMedios}), SP=${percentage(this.state.parsedData.rtPoliticos, this.state.parsedData.nodesRT)}% (${this.state.parsedData.rtPoliticos})`}</span>
              <span><strong>Respuestas: </strong>{`C=${percentage(this.state.parsedData.rpCiudadanos, this.state.parsedData.nodesRP)}% (${this.state.parsedData.rpCiudadanos}), SM=${percentage(this.state.parsedData.rpMedios, this.state.parsedData.nodesRP)}% (${this.state.parsedData.rpMedios}), SP=${percentage(this.state.parsedData.rpPoliticos, this.state.parsedData.nodesRP)}% (${this.state.parsedData.rpPoliticos})`}</span>
              <span><strong>Menciones: </strong>{`C=${percentage(this.state.parsedData.mnCiudadanos, this.state.parsedData.nodesMn)}% (${this.state.parsedData.mnCiudadanos}), SM=${percentage(this.state.parsedData.mnMedios, this.state.parsedData.nodesMn)}% (${this.state.parsedData.mnMedios}), SP=${percentage(this.state.parsedData.mnPoliticos, this.state.parsedData.nodesMn)}% (${this.state.parsedData.mnPoliticos})`}</span>
              <br />
              <span><strong>INTRA-ACTORES: </strong>{`${this.state.parsedData.intraActores.length} (${percentage(this.state.parsedData.intraActores.length, this.state.parsedData.links.length)}% del total de interacciones)`}</span>
              <span>{`Retuits: ${this.state.parsedData.intraRt}, Respuestas: ${this.state.parsedData.intraRp}, Menciones: ${this.state.parsedData.intraMn}`}</span>
              <span><strong>Intra-Ciudadanos: </strong>{`${this.state.parsedData.intraC} (Retuits: ${this.state.parsedData.intraCRt}, Respuestas: ${this.state.parsedData.intraCRp}, Menciones: ${this.state.parsedData.intraCM})`}</span>
              <span><strong>Intra-Medios: </strong>{`${this.state.parsedData.intraM} (Retuits: ${this.state.parsedData.intraMRt}, Respuestas: ${this.state.parsedData.intraMRp}, Menciones: ${this.state.parsedData.intraMM})`}</span>
              <span><strong>Intra-Politicos: </strong>{`${this.state.parsedData.intraP} (Retuits: ${this.state.parsedData.intraPRt}, Respuestas: ${this.state.parsedData.intraPRp}, Menciones: ${this.state.parsedData.intraPM})`}</span>
              <br />
              <span><strong>INTER-ACTOR: </strong>{`${this.state.parsedData.interActores.length} (${percentage(this.state.parsedData.interActores.length, this.state.parsedData.links.length)}% del total de interacciones)`}</span>
              <span>{`Retuits: ${this.state.parsedData.interRt}, Respuestas: ${this.state.parsedData.interRp}, Menciones: ${this.state.parsedData.interMn}`}</span>
              <span><strong>Inter Ciudadanos-Medios: </strong>{`${this.state.parsedData.interCM} (Retuits: ${this.state.parsedData.interCMRt}, Respuestas: ${this.state.parsedData.interCMRp}, Menciones: ${this.state.parsedData.interCMM})`}</span>
              <span><strong>Inter Ciudadanos-Politicos: </strong>{`${this.state.parsedData.interCP} (Retuits: ${this.state.parsedData.interCPRt}, Respuestas: ${this.state.parsedData.interCPRp}, Menciones: ${this.state.parsedData.interCPM})`}</span>
              <span><strong>Inter Politicos-Medios: </strong>{`${this.state.parsedData.interPM} (Retuits: ${this.state.parsedData.interPMRt}, Respuestas: ${this.state.parsedData.interPMRp}, Menciones: ${this.state.parsedData.interPMM})`}</span>
            </Log>
        }
        {
          this.state.parsedData &&
            <NetworkVis
              data={this.state.parsedData}
              widthPercentage={100}
              height={500}
            />
        }
      </div>
    )
  }
};

export default Network;