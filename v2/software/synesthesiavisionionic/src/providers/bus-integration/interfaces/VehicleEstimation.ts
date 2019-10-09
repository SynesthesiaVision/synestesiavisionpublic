interface VehicleEstimation {
    line            : number;
    vehicle         : number;
    destination     : number; // Estação de fim
    destinationName : string; // Nome da estação de fim
    distance        : number; // Metros de distância estimados desde o ‘instant’
    arrivalTime     : Date;   // Estimativa do tempo de chegada desde o ‘instant’
    exitTime        : Date;   // Estimativa do tempo de saída desde o ‘instant’
    instant         : Date;   // Momento do cálculo da estimativa
}