import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController, Platform } from 'ionic-angular';
import { TextToSpeechProvider } from '../../providers/text-to-speech/text-to-speech';
import { BusIntegrationProvider } from '../../providers/bus-integration/bus-integration';
import { NativeStorage } from '@ionic-native/native-storage';
import { Haversine, GpsPoint } from 'haversine-position';
import { MobileAccessibility } from '@ionic-native/mobile-accessibility';
import { ModalRenomearParadaPage } from '../modals/modal-renomear-parada';
import { Observable } from 'Rxjs/rx';
import { Subscription } from "rxjs/Subscription";
import { RotasPage } from '../rotas/rotas'

/**
 * Generated class for the HorariosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-horarios',
    templateUrl: 'horarios.html',
})
export class HorariosPage {

    // private savedLines                          : boolean = false;
    private gettingBusSchedule: boolean = false;
    private gettingBusLines: boolean = false;
    private gettingCloserStops: boolean = false
    private loading: any;

    private listaParadas: any = [];
    private listaHorariosDaParada: any;

    private origin: GpsPoint = { lat: 35.826869, lng: 139.688460 }
    private latLongParada: GpsPoint = { lat: 35.826910, lng: 139.688578 }
    private menorDistanciaAtual: any;
    private tempoDefinido: any;

    private verificacaoParadasProximas: any = 'Verificando paradas próximas.';
    private verificacaoParadasProximasAndamento: any = 'Verificação de paradas próximas em andamento.';
    private verificacaoAndamento: any = 'Verificação de horários em andamento.';
    private erroVerificacaoParadas: any = 'Ocorreu algum erro ao verificar as paradas.';
    private erroVerificacaoHorarios: any = 'Ocorreu algum erro ao verificar os horarios das linhas.';
    private faltaHorariosParada: any = 'Não foram encontrados horários da parada solicitada.';
    private verificacaoHorarios: any = 'Verificando horários da parada.';
    private verificacaoParadasConcluida: any = 'Verificação de paradas concluída.';
    private novaBuscaHorarios: any = 'Atualizando horário das paradas.';
    private observableVar: Subscription;

    constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform,
        public busIntegration: BusIntegrationProvider, public ttsProvider: TextToSpeechProvider,
        public nativeStorage: NativeStorage, public loadingCtrl: LoadingController,
        public mobileAcc: MobileAccessibility, public modalCtrl: ModalController) {

        this.platform.registerBackButtonAction(() => {
            if (this.listaHorariosDaParada != undefined) {
                this.voltar();
            } else {
                navCtrl.pop();
            }
        });
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad HorariosPage');

        //Verifica no localStorage se existe uma determinada linha (não importa qual seja)
        this.checkLineNameByLabel('56').then((result) => {
        }).catch((err) => {
            //Se não existir, realiza a requisição de todas as linhas
            this.getLinhas();
        });

        //Busca as paradas
        this.getParadas(false);
    }

    //Fala os dados passados por atributo
    speakData(busLine: string, arrivalTime: string) {
        let arrival = this.transformTime(arrivalTime);
        let frase = 'Ônibus linha' + busLine + ', chegando em ' + arrival + '.'

        this.ttsProvider.speak(frase);
        // this.mobileAcc.isScreenReaderRunning().then((result) => {
        //     if(result){
        // this.mobileAcc.speak(frase, 1);
        // }
        // });
    }

    getLinhas() {

        if (!this.gettingBusLines) {

            //Boolean para verificar se a requisição de linhas está ativa
            this.gettingBusLines = true;

            //Exibe o loading spinner
            this.createLoading();
            this.loading.present();

            return new Promise((resolve, reject) => {

                this.busIntegration.getLinhas().then((linhasEncontradas) => {

                    linhasEncontradas.forEach(linha => {
                        if (linha.id == 346) {
                            return; // por conta da linha 914 que esta duplicada ****
                        }
                        if (linha.nombre.indexOf('EXTINTA') === -1) {
                            this.saveLines(linha.id, linha.nombre);
                        }
                    });

                    this.gettingBusLines = false;
                    this.loading.dismiss();
                    resolve(true);
                }).catch((err) => {
                    this.gettingBusLines = false;
                    this.loading.dismiss();
                    reject(false);
                });
            });
        } else {
            this.ttsProvider.speak(this.verificacaoParadasProximasAndamento);
            // this.mobileAcc.speak(this.verificacaoParadasProximasAndamento, 1);
        }

    }

    getParadas(recarregando) {

        //Verifica se já existe uma requisição pelas paradas
        if (!this.gettingCloserStops) {

            //Inicializou a busca pelas paradas
            this.gettingCloserStops = true;

            //Avisa que a realização está em andamento
            if (!recarregando) {
                this.ttsProvider.speak(this.verificacaoParadasProximas);
                // this.mobileAcc.speak(this.verificacaoParadasProximas, 1);
            }

            //Exibe o loading spinner
            this.createLoading();
            this.loading.present();

            this.busIntegration.startChecking().then((etiquetasParadas) => {

                //Criado um objeto que recebe um nome e é associado ao tipo ParadasRequest (Array de String)
                let etiquetasParadasArray: { [params: string]: string[]; } = {};
                etiquetasParadasArray['params'] = etiquetasParadas; // Adiciona os dados necessários

                return this.busIntegration.getParadasPorLabel(etiquetasParadasArray);
            }).then((paradasEncontradas: any) => {

                //Busca a latitude e longitude atual do usuário
                this.origin.lat = Number(this.busIntegration.getLatitude());
                this.origin.lng = Number(this.busIntegration.getLongitude());

                //Atribui as coordenadas de origem ao haversine
                const haversine = new Haversine(this.origin);

                //Pega a posição da primeira parada
                this.latLongParada = {
                    lat: Number(paradasEncontradas[0].PosX),
                    lng: Number(paradasEncontradas[0].PosY)
                };

                //Calcula a distância do usuário para a primeira parada, para realizar as comparações
                this.menorDistanciaAtual = haversine.getDistance(this.latLongParada);

                // Atribui a lista de exibição a primeira parada
                // this.listaParadas.push(paradasEncontradas[0]);
                //Para cada parada...
                paradasEncontradas.forEach((parada, index) => {
                    //Pega as coordenadas da parada atual
                    this.latLongParada = { lat: parada.PosX, lng: parada.PosY };

                    this.nativeStorage.getItem(parada.Label).then((result) => {
                        parada.nombre = result;
                        parada.endereco = "";
                    }).catch((err) => {
                        console.log(err);
                    });

                    if (index <= 5) {
                        //Atribui a parada atual para a lista de exibição (troca)
                        this.listaParadas.push(parada);
                        console.log("Distância: ", haversine.getDistance(this.latLongParada));
                    }
                    //Verifica se a distância da parada atual é menor que a distância já calculada
                    // if(this.menorDistanciaAtual > haversine.getDistance(this.latLongParada)){
                    // }
                });

                // this.listaParadas = paradasEncontradas;

                //Notifica ao usuario que as paradas foram encontradas
                if (!recarregando) {
                    this.ttsProvider.speak(this.verificacaoParadasConcluida);
                    //this.mobileAcc.speak(this.verificacaoParadasConcluida, 1);
                }

                //Terminou de realizar a busca pelas paradas
                this.gettingCloserStops = false;
                this.loading.dismiss();
            }).catch((err) => {
                this.ttsProvider.speak(this.erroVerificacaoParadas);
                // this.mobileAcc.speak(this.erroVerificacaoParadas, 1);

                //Terminou de realizar a busca pelas paradas
                this.gettingCloserStops = false;
                //Esconde o loading
                this.loading.dismiss();
            });
        } else {
            //Caso já esteja realizando a requisição
            this.ttsProvider.speak(this.verificacaoAndamento);
            // this.mobileAcc.speak(this.verificacaoAndamento, 1);
        }

    }

    getHorarios(labelParada) {

        if (!this.gettingBusSchedule) {

            //Inicializou a busca pelos horarios
            this.gettingBusSchedule = true;

            this.ttsProvider.speak(this.verificacaoHorarios);
            // this.mobileAcc.speak(this.verificacaoHorarios, 1);

            //Exibe o loading spinner
            this.createLoading();
            this.loading.present();

            //Busca os horários para a parada selecionada
            this.busIntegration.getEstimacao(labelParada).then((estimacoes) => {

                //Caso a lista de horários seja maior que zero...
                if (estimacoes.length > 0) {

                    //Para cada horário...
                    estimacoes.forEach(estimacao => {
                        //Busca no localStorage a linha com o determinado identificador
                        //Obs.: (Os horários trazem apenas o número das linhas e não os nomes)
                        this.checkLineNameByLabel((estimacao.line).toString()).then((nombre) => {
                            // Caso exista um nome no localStorage para a linha solicitada
                            if (nombre !== undefined) {
                                //Troca o número da linha pelo seu nome
                                estimacao.line = nombre;
                            }
                        });
                    });

                    //Organiza os horários a partir de seu tempo e nome
                    this.setEstimacoes(estimacoes).then((estimacoesOrdenadas) => {
                        //Atribui a lista de horários organizada à lista para exibição
                        this.listaHorariosDaParada = estimacoes;

                        //Terminou de realizar a busca pelos horarios
                        this.gettingBusSchedule = false;
                        this.loading.dismiss();

                        //Realiza uma nova solicitação de busca de horários de ônibus
                        this.observableVar = Observable.interval(60000).subscribe(() => {
                            this.ttsProvider.speak(this.novaBuscaHorarios);
                            this.getHorarios(labelParada);
                        });

                    });
                    //Caso o tamanho da lista de horários tenha sido menor que zero
                    //Obs.: Irá ocorrer isto porque os ônibus não estão habilitados para trazer suas coordenadas
                } else {
                    //
                    this.ttsProvider.speak(this.faltaHorariosParada);
                    // this.mobileAcc.speak(this.faltaHorariosParada, 1);

                    //Terminou de realizar a busca pelos horarios
                    this.gettingBusSchedule = false;
                    this.loading.dismiss();
                }
                //Caso tenha ocorrido algum erro na busca.
            }).catch((err) => {
                this.ttsProvider.speak(this.erroVerificacaoHorarios);
                // this.mobileAcc.speak(this.erroVerificacaoHorarios, 1);

                //Terminou de realizar a busca pelos horarios
                this.gettingBusSchedule = false;
                this.loading.dismiss();
            });
            //Caso a requisição já esteja em andamento
        } else {
            this.ttsProvider.speak(this.verificacaoAndamento);
            // this.mobileAcc.speak(this.verificacaoAndamento, 1);
        }


    }

    //Ordena e atribui as estimaçoes a variavel global contendo a lista de estimaçoes
    setEstimacoes(estimacoes) {

        return new Promise((resolve, reject) => {

            estimacoes.sort((tempoA, tempoB): Number => {

                if (tempoA.exitTime < tempoB.exitTime) {
                    return -1;
                } else if (tempoA.exitTime > tempoB.exitTime) {
                    return 1;
                }

                return 0;
            });

            resolve(estimacoes);
        });
    }

    transformTime(value: string) {

        let dataFiltrada = '';

        let actualDate = new Date();
        let miliseconds = value.slice(6, 19);

        let result = Number(miliseconds) - actualDate.getTime();
        let resultDate = new Date(result);

        var h = resultDate.getUTCHours();
        var m = resultDate.getUTCMinutes();

        if (h !== 0) {

            if (h > 1) {
                dataFiltrada = h + ' horas ';
            } else {
                dataFiltrada = h + ' hora ';
            }
        }

        if (m !== 0) {

            if (m > 1) {

                dataFiltrada = dataFiltrada + m + ' minutos ';
            } else {
                dataFiltrada = dataFiltrada + m + ' minuto ';
            }
        }

        return dataFiltrada;
    }

    /**
    * Creates the loading screen
    */
    createLoading() {

        let loading = this.loadingCtrl.create({
            content: 'Procurando horários, espere...',
            dismissOnPageChange: true
        });

        this.loading = loading;
    }

    /**
    * Salva o endereço do dispositivo pressionado caso haja uma conexão bem sucedida
    * @param linhas
    */
    saveLines(lineLabel: string, linhas: string) {
        this.nativeStorage.setItem(lineLabel, linhas).then(() => {
            console.log('Stored item! Nome: + ' + lineLabel);
        }, error => {
            console.error('Error storing item', error)
        });
    }

    /**
     * Verify if the local storage has the Lines of a synesthesia device
     */
    checkLineNameByLabel(lineLabel: string) {
        return this.nativeStorage.getItem(lineLabel);
    }

    listarHorarios() {
        this.listaHorariosDaParada.forEach(horario => {
            this.speakData(horario.line, this.transformTime(horario.exitTime));
        });
    }

    voltar() {
        this.listaHorariosDaParada = undefined;
    }

    openModalRenomear(labelParada, nombreParada) {
        let modal = this.modalCtrl.create(ModalRenomearParadaPage, { labelParada: labelParada, nombreParada: nombreParada });

        modal.onDidDismiss((result) => {
            if (result) {
                this.getParadas(true);
            }
        });

        modal.present();
    }

    backButtonAction() {
        if (this.listaHorariosDaParada != undefined) {
            this.voltar();
        } else {
            this.navCtrl.pop();
        }
    }

    ionViewDidLeave() {
        this.observableVar.unsubscribe();
    }

    rotas(){
        this.navCtrl.push(RotasPage);
    }
}