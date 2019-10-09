#include <SoftwareSerial.h>
#include "TimerOne.h"

#define sensors 3
#define nFilter 3

SoftwareSerial btSerial(13, 12); // RX, TX
SoftwareSerial ultrasonicSerial(10, 9);

// set variables
int estado1 = 0; // variável para leitura do pushbutton
int estado2 = 0; // variável para leitura do pushbutton
int estado3 = 0; // variável para leitura do pushbutton
int guarda_estado1 = LOW; // variável para armazenar valores do pushbutton
int guarda_estado2 = LOW; // variável para armazenar valores do pushbutton
int guarda_estado3 = LOW; // variável para armazenar valores do pushbutton
int ldrPin = A7; //LDR no pino analígico 8
int ldrValor = 0;
int buttonPin1 = 2;
int buttonPin2 = 3;
int buttonPin3 = 8;
int contador1 = 0;
int contador2 = 0;
int contador3 = 0;
int valorButton1 = 0;
int valorButtom2 = 0;
int valorButtom3 = 0;
bool lastButtonState1 = false;   // the previous reading from the input pin
bool lastButtonState2 = false;   // the previous reading from the input pin
bool lastButtonState3 = false;   // the previous reading from the input pin

// the following variables are unsigned long's because the time, measured in miliseconds,
// will quickly become a bigger number than can be stored in an int.
unsigned long lastDebounceTime = 0;  // the last time the output pin was toggled
unsigned long debounceDelay = 10;    // the debounce time; increase if the output flickers


int filterValues[sensors][nFilter];

void setup() {  

    Serial.begin(9600);
    btSerial.begin(9600);

    //Ultrasonic 1
    pinMode(4, OUTPUT);
    pinMode(5, INPUT);

    //Ultrasonic 2
    pinMode(6, OUTPUT);
    pinMode(7, INPUT);

    //Ultrasonic 3
    pinMode(9, OUTPUT);
    pinMode(10, INPUT);

    digitalWrite(4, LOW);
    digitalWrite(5, LOW);

    digitalWrite(6, LOW);
    digitalWrite(7, LOW);

    digitalWrite(9, LOW);
    digitalWrite(10, LOW);

    //Weather Button
    pinMode(buttonPin1, INPUT_PULLUP);
    pinMode(buttonPin2, INPUT_PULLUP);
    pinMode(buttonPin3, INPUT_PULLUP);

    Timer1.initialize(3885339); // Inicializa o Timer1 e configura para um período de 0,5 segundos
    Timer1.attachInterrupt(valores); // Configura a função callback() como a função para ser chamada a cada interrupção do Timer1

    Serial.println("Initialized");
    delay(500);
}

void valores() {
    
    switch (contador1) {
        case 1:
            Serial.println("Get Weather");
            btSerial.println("bt_wea");
            delay(3000);
            contador1 = 0;
        break;

        case 2:
            Serial.println("estou no 2");
            btSerial.println("bt_oni");
            contador1 = 0;
        break;

        case 3:
            ldrValor = analogRead(ldrPin); //O valor lido será entre 0 e 1023
            //se o valor lido for maior que 500, liga o led
            delay(500);
            Serial.println("estou no 3");

            if (ldrValor >= 680) {
                Serial.println("luminosidade Apagada");
                btSerial.println("bt_lum_0");
                delay(200);
                contador1 = 0;
            }
            // senão, apaga o led
            else {
                Serial.println("luminosidade Acesa");
                btSerial.println("bt_lum_1");
                delay(200);

                contador1 = 0;
            }
        break;
    }
    contador1 = 0;

}

void loop() {

    long distance_a = filter(0, getDistance(4, 5));
    long distance_c = filter(2, getDistance(6, 7));
    long distance_b = filter(1, getDistance(9, 10));


    if (distance_a > 0 && distance_a <= 300) {
        //Serial.print("Distance a: ");
        // Serial.println(distance_a);
        btSerial.print("a");
        btSerial.println(distance_a);
    }

    if (distance_b > 0 && distance_b <= 300) {
        //Serial.print("Distance b: ");
        // Serial.println(distance_b);
        btSerial.print("b");
        btSerial.println(distance_b);
    }


    if (distance_c > 0 && distance_c <= 300) {
        //Serial.print("Distance c: ");
        // Serial.println(distance_c);
        btSerial.print("c");
        btSerial.println(distance_c);
    }

    ldrValor = analogRead(ldrPin);
    btSerial.println("bt_lum");
    
    // le o estado pushbutton: ligado (HIGH) ou desligado (LOW)
    estado1 = digitalRead(buttonPin1);

    while(!digitalRead(buttonPin1));


    // verifica se o botão (pushbutton) está pressionado
    if (estado1 == LOW) {

        // inverte valor da variável variable_buttonEstado
        guarda_estado1 = !guarda_estado1;
    }

    if (guarda_estado1 == HIGH  && !lastButtonState1 && contador1 < 4) {
       
        contador1++;
        Serial.print("Valor1: ");            // mostra no serial monitor a contagem cada vez que pushbutton é
        Serial.println(contador1);        // pressionado
        // delay(500);
    }
    
    // le o estado pushbutton: ligado (HIGH) ou desligado (LOW)
    estado2 = digitalRead(buttonPin2);

    while(!digitalRead(buttonPin2));

    // verifica se o botão (pushbutton) está pressionado
    if (estado2 == LOW) {
        // inverte valor da variável variable_buttonEstado
        guarda_estado2 = !guarda_estado2;

        //esperera o tempo de 500ms para evitar que haja várias vezes alterações
        delay(100);
    }

    if (guarda_estado2 == HIGH  && !lastButtonState2) {
        
        Serial.print("Valor2: ");            // mostra no serial monitor a contagem cada vez que pushbutton é
        Serial.println(contador2);        // pressionado
        delay(500);
        Serial.println("Sonorizacao");
        btSerial.println("bt_som");
        lastButtonState2 = 0;
        //contador2++;
        // Serial.println(guarda_estado2);
    }
    

    //Mais funções para o botão.
    /*
    if (contador2 == 1) {
        Serial.print("Valor2: ");            // mostra no serial monitor a contagem cada vez que pushbutton é
        Serial.println(contador2);        // pressionado
        delay(500);
        Serial.println("Sonorizacao");
        btSerial.println("bt_som");
        contador2 = 0;
        lastButtonState2 = 0;
    }*/

    // le o estado pushbutton: ligado (HIGH) ou desligado (LOW)
    estado3 = digitalRead(buttonPin3);

    while(!digitalRead(buttonPin3));

    // verifica se o botão (pushbutton) está pressionado
    if (estado3 == LOW) {
        // inverte valor da variável variable_buttonEstado
        guarda_estado3 = !guarda_estado3;

        //esperera o tempo de 500ms para evitar que haja várias vezes alterações
        delay(100);
    }

    if (guarda_estado3 == HIGH  && !lastButtonState3) {
        
        Serial.print("Valor3: ");            // mostra no serial monitor a contagem cada vez que pushbutton é
        Serial.println(contador3);        // pressionado
        delay(500);
        Serial.println("phone");
        btSerial.println("bt_phone");
        lastButtonState3 = 0;

    }    

    //Check if the button was pressed one time
    estado1 = LOW;
    estado2 = LOW;
    estado3 = LOW;
    guarda_estado1 = LOW;
    guarda_estado2 = LOW;
    guarda_estado3 = LOW;
    lastButtonState1 = 0;
    lastButtonState2 = 0;
    lastButtonState3 = 0;
}


//Filters values that comes from the ultrasonic sensors
int filter(int sensor, int newValue) {
 
    for (int i = nFilter - 1; i > 0; i--) {
        filterValues[sensor][i] = filterValues[sensor][i - 1];
    }

    int sum = 0;
    for (int i = 0; i < nFilter; i++) {
        sum += filterValues[sensor][i];
    }

    filterValues[sensor][0] = newValue;
    return sum / nFilter;
}

//Get Distance from HCSR04 ultrasonic sensors
long getDistance(int t, int e) {
    long duration, distance;
    digitalWrite(t, LOW);
    delayMicroseconds(2);
    digitalWrite(t, HIGH);
    delayMicroseconds(10);
    digitalWrite(t, LOW);
    duration = pulseIn(e, HIGH);
    distance = (duration / 2) / 29.1;
    return distance;
}
