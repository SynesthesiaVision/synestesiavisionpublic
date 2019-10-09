interface StopService {
    beginService : number; // Hora do inicio (em minutos), de passo a através da estação no dia
    endService   : number; // Hora do fim (em minutos), de passo a através da estação no dia. Pode ser superior a 24 horas.
    frequency    : number; // Frequência, em minutos, de passo por uma estação
}