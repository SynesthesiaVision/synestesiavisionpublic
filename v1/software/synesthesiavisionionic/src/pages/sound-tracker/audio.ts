import { Http, ResponseContentType } from '@angular/http';
import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { BluetoothProvider } from '../../providers/bluetooth/bluetooth';

/*
  Generated class for the AudioProvider provider.
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

declare var AudioContext: any;
declare var webkitAudioContext: any;

@Injectable()
export class AudioProvider3 {

    //Variáveis de audio
	private _track            : any      = null;
	private _audio            : any;
	private _source           : any;
	private _context          : any      = new (AudioContext || webkitAudioContext)();
	private _gain             : any      = null;
    
    //Variáveis de dados do sensor
	private sensor            : number[] = [0,0,0]; // REMOVER POSTERIORMENTE OU SETAR INICIO COMO 0,0,0 PARA NAO EMITIR RUIDO NO PRIMEIRO CICLO.
	private sensibilidade     : number   = 140; //SENSIBILIDADE DO SENSOR COM RELAÇÃO AO SEU LIMITE
	private _audioTrack       : any      = 'assets/sounds/bu1seg.ogg';

    //Variáveis de configuração do audio
	private audioSettedUp     : boolean  = false;
    private timeoutFunction   : any;
    private lastSide          : any = 1;

	constructor(public http: Http, public bluetoothProvider: BluetoothProvider) {
		console.log('Hello AudioProvider Provider');
	}

	loadSound() {

		return this.http.get(this._audioTrack, { responseType: ResponseContentType.ArrayBuffer })
			.map(res => res.arrayBuffer());
	}

	setUpAudio(bufferedContent: any) {
		
		return new Promise((resolve, reject) => {

			this._context.decodeAudioData(bufferedContent, (buffer: any) => {
				this._audio = buffer;
				this._track = this._audio;
			});

			resolve(true);
		});
	}

	stopSound() {

		if (!this._source.stop) {
			this._source.stop = this._source.noteOff;
		}

		this._source.stop(0);
    }
    
	playAudioTrack(track, detune) {

		return new Promise((resolve, reject) => {
            //Cria um gain stereo
			this._gain = this._context.createStereoPanner();

            //Cria uma nova fonte de audio como BufferSource (audio carregado no próprio aplicativo)
            this._source = this._context.createBufferSource();
            //Adiciona o audio no buffer da fonte de audio
            this._source.buffer = track;

			this.defineSoundWebApi().then((result) => {
                //Atualiza o lastSide
                this.lastSide = result;
            
                //Verifica qual o lado com menor distância 
				if(result !== 2 && result !== undefined){
					
                    console.log(result);
                    //Atualiza o valor do pan (lado que irá ser tocado o som)
					this._gain.pan.setValueAtTime(result, 0);

                    //Conecta o gain a fonte de audio
                    this._source.connect(this._gain);
                    //Conecta o gain ao destino do contexto (saída de audio do celular)
					this._gain.connect(this._context.destination);

                    //Realiza a sonorização
					this._source.start(0, 0.1);
				} else {
					reject(false);
				}
			});
			
			resolve(true);
		});
    }
    
	// playAudioTrack(track, detune) {

	// 	return new Promise((resolve, reject) => {
            
    //         this.defineSoundWebApi().then((result) => {
    //             this.lastSide = result;
	// 			let side = result;
                
	// 			if(side !== 2 && side !== undefined){
                    
    //                 this._gain = this._context.createStereoPanner();
	// 				console.log(side);
	// 				this._gain.pan.setValueAtTime(side, 0);
                    
	// 				// this._source.connect(this._gain);
    //                 this._gain.connect(this._context.destination);

    //                 let biquadFilter = this._context.createBiquadFilter();
                    
    //                 biquadFilter.detune.value = detune;
    //                 biquadFilter.connect(this._gain);

    //                 this._source = this._context.createBufferSource();
    //                 this._source.buffer = track;

    //                 this._source.connect(biquadFilter);
        
	// 				this._source.start(0, 0.1);
	// 			} else {
	// 				reject(false);
	// 			}
	// 		});
			
	// 		resolve(true);
	// 	});
	// }


    /**
     * Define qual o sensor que tem a menor distância e retorna ele.
     * -1 para esquerda, 0 para central, 1 para direita e 2 para nenhum.
     */
	defineSoundWebApi() {
		
		return new Promise((resolve, reject) => {

			let result;
			
			if (this.sensor[0] <= this.sensibilidade ||
				this.sensor[1] <= this.sensibilidade ||
				this.sensor[2] <= this.sensibilidade) {
					
				if (this.sensor[0] < this.sensor[1] && this.sensor[0] < this.sensor[2]) {
					result = -1;
	
				} else if (this.sensor[1] < this.sensor[0] && this.sensor[1] < this.sensor[2]) {
					result = 0;
	
				} else if (this.sensor[2] < this.sensor[0] && this.sensor[2] < this.sensor[1]) {
	
					result = 1;
				}
				
			} else {
				result = 2; // retornar 2 para testar 
			}

			resolve(result);
		});
	}


    /**
     * Calcula a frequência para a execução da sonorização a partir da distância atual captada pelo sensor.
     * 
     * @param distancia Distância atual do sensor.
     */
	calcularFrequencia(distancia) {
		
		return new Promise((resolve, reject) => {

            let detune;
            let detune_MIN = 200;
            let detune_MAX = 900;

			let frequencia;
			let frequencia_MIN = 450;
			let frequencia_MAX = 2000;
			let distancia_MIN = 30;
		
			if (distancia >= distancia_MIN) {
                frequencia = distancia * 15;
                
                detune = distancia * 7;
			} else {
                frequencia = frequencia_MIN;
                
                detune = detune_MIN;
			}
		
			if (frequencia > frequencia_MAX) {
                frequencia = frequencia_MAX;
                
                detune = detune_MAX;
			}
		
			resolve({frequencia, detune});
		});
		
	}

	/**
	 * Recebe um array com as distancias atuais do sensor, e inicia a execução do som
	 * 
	 * @param sensor 
	 */
	atualizarSensor(sensor: number[], detune) {
		this.sensor = sensor;
		return this.playAudioTrack(this._track, detune);
	}
	
	loop(detune){
		
		// Chama a função de atualizar sensor, passando a distancia mais atual,
		return this.atualizarSensor(this.bluetoothProvider.getDistanceSensor(), detune)
			.then(() => {
				// após a execução do sensor, os valores são zerados, para evitar execução
				// de uma distância do passado 
				this.zeraDistancia()
			});
	}

	playSound(){

		//Verifica se o audio já foi configurado...
		if(!this.audioSettedUp){

            //Configura os sensores atuais
            this.sensor = this.bluetoothProvider.getDistanceSensor();
            //Verifica qual o sensor com menor valor e define o lastSide com este valor
            this.defineSoundWebApi().then((side) => {
                this.lastSide = side;
            });
			
			//Carrega o som do arquivo .ogg, como um arrayBuffer
			this.loadSound()
				.toPromise().then((arrayBufferContent) => {
					//Adiciona o conteúdo nas variáveis de audio 
					return this.setUpAudio(arrayBufferContent);
				}).then((trackResult) => {
					//Atribui true a variável, significa que o audio já foi configurado
					this.audioSettedUp = true;
				});
        }
        
		//Busca a distância mínima
		this.bluetoothProvider.getDistanceMin()
			.then((minDistance) => {
                //Antes de calcular a frequencia verifica se houve modificação do lastSide (sensor com menor valor)
                //Utilizado para diminuir o delay de execução entre dois sons quando há mudança na distância entre sensores diferentes
                this.defineSoundWebApi().then((side) => {
                    //Se houve mudança de sensor...
                    if(this.lastSide !== side){
                        //Para a execução atual do timeout 
                        clearTimeout(this.timeoutFunction);
                    }
                });
                
                //Calcula a frquência de execução do som, a partir da distância mínima
                //Obs.: O Calculo precisa ser feito antes de executar o som
                return this.calcularFrequencia(minDistance);
				
			}).then(({frequencia, detune}) => {
                //Timeout para repetir a execução do som de acordo com a frequencia calculada
                this.timeoutFunction = setTimeout(() => {

                    //Chama a função de execução do som, após finalizar a execução...
                    this.loop(detune).then(() => {
                        //Chama a própria função para realizar o loot
                        this.playSound();
                    }) ;
                }, frequencia); 
			});
	}

	//Zera os valores presentes no sensor
	zeraDistancia(){
		this.sensor = [0,0,0];
	}

	//Para a execução do loop
	stopRunningSound(){
		clearTimeout(this.timeoutFunction);
	}
	
}
