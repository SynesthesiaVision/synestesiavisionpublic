import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the DatePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  	name: 'datePipe',
})
export class DatePipe implements PipeTransform {
	
	/**
	 * Takes a data in miliseconds and makes it in hour:minutes:seconds.
	 */
	transform(value: string) {

		let dataFiltrada = '';

		let actualDate = new Date();
		let miliseconds = value.slice(6, 19);

		let result = Number(miliseconds) - actualDate.getTime();
		let resultDate = new Date(result);

		var h = resultDate.getUTCHours();
		var m = resultDate.getUTCMinutes();

		if(h !== 0){

			if(h > 1){
				dataFiltrada = h + ' horas ';
			} else{
				dataFiltrada = h + ' hora ';
			}
		}

		if(m !== 0){
			if(m > 1){

				dataFiltrada = dataFiltrada + m + ' minutos ';
			} else{
				dataFiltrada = dataFiltrada+ m + ' minuto ';
			}
		}

		return dataFiltrada;
	}

}
