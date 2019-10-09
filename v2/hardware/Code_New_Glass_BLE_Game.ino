
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

const int pinPot = 4; // Indica a porta analógica ligada ao potenciômetro

const int ldrPin = 26;
int lightInit = 0;
int lightVal = 0;
int Bateu;
const int trigPinE = 18;
const int echoPinE = 35;
float distanciaE;
int startSensorB = 170; // centimetros
int startSensorM = 130; // centimetros
const int pino_buzzerE = 25;
const int pino_MotorE = 32;
int valsensor_buzzerE;
int valsensor_MotorE;
int channel_buzzerE         = 0;
int frequence_buzzerE      = 1500;
int resolution_buzzerE      = 10;
int channel_MotorE         = 1;
int frequence_MotorE      = 30;
int resolution_MotorE      = 10;

//sensor da Direita
const int trigPinD = 23;
const int echoPinD = 34;
float distanciaD;
int valsensor_buzzerD;
int valsensor_MotorD;
const int pino_buzzerD = 16;
const int pino_MotorD = 17;
int channel_buzzerD         = 2;
int frequence_buzzerD      = 1500;
int resolution_buzzerD = 10;
int channel_MotorD         = 3;
int frequence_MotorD      = 30;
int resolution_MotorD = 10;

//sensor do meio
const int trigPinM = 19;
const int echoPinM = 33;
float distanciaM;
int valsensor_buzzerM;
int valsensor_MotorM;

int estado1 = 0; // variável para leitura do pushbutton
int guarda_estado1 = LOW; // variável para armazenar valores do pushbutton
int buttonPin1 = 0;
int valorButton1 = 0;
bool lastButtonState1 = false;   // the previous reading from the input pin
int contador1 = 0;

hw_timer_t * timer = NULL;
BLECharacteristic *pCharacteristic;

bool deviceConnected = false;

// Veja o link seguinte se quiser gerar seus próprios UUIDs:
// https://www.uuidgenerator.net/

#define SERVICE_UUID           "6E400001-B5A3-F393-E0A9-E50E24DCCA9E" // UART service UUID
#define DHTDATA_CHAR_UUID "6E400003-B5A3-F393-E0A9-E50E24DCCA9E"


class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

void IRAM_ATTR onTimer() {

  if (Bateu == 1) {
    pCharacteristic->setValue("bt_bateu");
    pCharacteristic->notify(); // Envia o valor para o aplicativo!
    Bateu = 0;
  }
  switch (contador1) {
    case 1:
      Serial.println("Get Weather");
      pCharacteristic->setValue("bt_wea");
      pCharacteristic->notify(); // Envia o valor para o aplicativo!
      contador1 = 0;
      break;

    case 2:
      Serial.println("estou no 2");
      pCharacteristic->setValue("bt_oni");
      pCharacteristic->notify(); // Envia o valor para o aplicativo!
      contador1 = 0;
      break;

    case 3:
      //se o valor lido for maior que 500, liga o led
      Serial.println("estou no 3");
      lightVal = analogRead(ldrPin);

      if (lightVal > 2500) {
        Serial.println("apagado");
        ledcWriteTone(channel_buzzerD, 2000);
        delay(200);
        ledcWriteTone(channel_buzzerD, 0);
        delay(200);
        ledcWriteTone(channel_buzzerD, 2000);
        delay(200);
        ledcWriteTone(channel_buzzerD, 0);
        delay(100);
        pCharacteristic->setValue("bt_lumi_0");
        pCharacteristic->notify(); // Envia o valor para o aplicativo!
        contador1 = 0;
      }
      else {
        Serial.println("Aceso");
        ledcWriteTone(channel_buzzerE, 2000);
        delay(200);
        ledcWriteTone(channel_buzzerE, 0);
        delay(200);
        ledcWriteTone(channel_buzzerE, 2000);
        delay(200);
        ledcWriteTone(channel_buzzerE, 0);
        delay(200);
        ledcWriteTone(channel_buzzerE, 2000);
        delay(200);
        ledcWriteTone(channel_buzzerE, 0);
        delay(200);
        pCharacteristic->setValue("bt_lumi_1");
        pCharacteristic->notify(); // Envia o valor para o aplicativo!
        contador1 = 0;
      }
      break;
  }
  contador1 = 0;
}

void setup() {
  Serial.begin(115200);

  // Create the BLE Device
  BLEDevice::init("Synesthesia2"); // Give it a name

  // Configura o dispositivo como Servidor BLE
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Cria o servico UART
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Cria uma Característica BLE para envio dos dados
  pCharacteristic = pService->createCharacteristic(
                      DHTDATA_CHAR_UUID,
                      BLECharacteristic::PROPERTY_NOTIFY
                    );

  pCharacteristic->addDescriptor(new BLE2902());

  // Inicia o serviço
  pService->start();

  // Inicia a descoberta do ESP32
  pServer->getAdvertising()->start();
  Serial.println("Esperando um cliente se conectar...");

  timer = timerBegin(0, 80, true);
  timerAttachInterrupt(timer, &onTimer, true);
  timerAlarmWrite(timer, 8000000, true);
  timerAlarmEnable(timer);

  pinMode(buttonPin1, INPUT_PULLUP);
  pinMode(pinPot, INPUT);
  pinMode(ldrPin, INPUT);

  //Sensor da Esquerda
  pinMode(trigPinE, OUTPUT);
  pinMode(echoPinE, INPUT);
  ledcSetup(channel_buzzerE, frequence_buzzerE, resolution_buzzerE);
  ledcAttachPin(pino_buzzerE, channel_buzzerE);
  ledcSetup(channel_MotorE, frequence_MotorE, resolution_MotorE);
  ledcAttachPin(pino_MotorE, channel_MotorE);

  //Sensor da Direita
  pinMode(trigPinD, OUTPUT);
  pinMode(echoPinD, INPUT);
  ledcSetup(channel_buzzerD, frequence_buzzerD, resolution_buzzerD);
  ledcAttachPin(pino_buzzerD, channel_buzzerD);
  ledcSetup(channel_MotorD, frequence_MotorD, resolution_MotorD);
  ledcAttachPin(pino_MotorD, channel_MotorD);

  //Sensor da Meio
  pinMode(trigPinM, OUTPUT);
  pinMode(echoPinM, INPUT);

}

void capturavalorE() {
  unsigned long duracaoE;

  digitalWrite(trigPinE, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinE, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinE, LOW);
  duracaoE = pulseIn(echoPinE, HIGH);
  distanciaE = (float)duracaoE / 29.2;
}

void capturavalorD() {
  unsigned long duracaoD;

  digitalWrite(trigPinD, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinD, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinD, LOW);
  duracaoD = pulseIn(echoPinD, HIGH);
  distanciaD = (float)duracaoD / 29.2;
}

void capturavalorM() {
  unsigned long duracaoM;

  digitalWrite(trigPinM, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPinM, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPinM, LOW);
  duracaoM = pulseIn(echoPinM, HIGH);
  distanciaM = (float)duracaoM / 29.2;
}
void loop() {

  capturavalorE();
  int potValue = analogRead(pinPot);
  if (distanciaE <= startSensorB)
    if (distanciaE >= 0) {
      valsensor_buzzerE = map(distanciaE, 0, startSensorB, potValue, 0);
      ledcWriteTone(channel_buzzerE, valsensor_buzzerE);
      if (distanciaE < 100) {
        ledcWrite(channel_MotorE, 700);
      }
      if (distanciaE < 35) {
        Bateu = 1;
      }
      Serial.println("DistanciaE: " + String(distanciaE));
      Serial.println("Obst esquerda");
    }

  if (distanciaE > startSensorB) { // PRENDE O CIRCUITO EM UM LAÇO ENQUANTO O VALOR MEDIDO FOR MENOR QUE 30 (CM)
    ledcWriteTone(channel_buzzerE, 0);
    ledcWrite(channel_MotorE, 0); //   Zera o valor do motor
    Serial.println("Sistema parado, distancia acima do ponto de ligamento");     // Emite um aviso no monitor serial para que se perceba que a coisa ta funcionando
    capturavalorE();
  }

  capturavalorD();
  potValue = analogRead(pinPot);
  if (distanciaD <= startSensorB)
    if (distanciaD > 0) {
      valsensor_buzzerD = map(distanciaD, 0, startSensorB, (potValue - 500), 0);
      ledcWriteTone(channel_buzzerD, valsensor_buzzerD);
      if (distanciaD < 100) {
        ledcWrite(channel_MotorD, 700);
      }
      if (distanciaD < 35) {
        Bateu = 1;
      }
      Serial.println("DistanciaD: " + String(distanciaD));
      Serial.println("Obst  direita");
    }

  if (distanciaD > startSensorB) { // PRENDE O CIRCUITO EM UM LAÇO ENQUANTO O VALOR MEDIDO FOR MENOR QUE 30 (CM)
    ledcWriteTone(channel_buzzerD, 0); //   Zera o valor do buzzer
    ledcWrite(channel_MotorD, 0); //   Zera o valor do motor
    Serial.println("Sistema parado, distancia acima do ponto de ligamento");     // Emite um aviso no monitor serial para que se perceba que a coisa ta funcionando
    capturavalorD();
  }

  capturavalorM();
  potValue = analogRead(pinPot);
  if (distanciaM <= startSensorB)
    if (distanciaM > 0) {
      valsensor_buzzerM = map(distanciaM, 0, startSensorB, (potValue + 500), 0);
      ledcWriteTone(channel_buzzerE, valsensor_buzzerM);
      ledcWriteTone(channel_buzzerD, valsensor_buzzerM);
      if (distanciaM < 100) {
        ledcWrite(channel_MotorE, 700);
        ledcWrite(channel_MotorD, 700);
      }
      if (distanciaM < 35) {
        Bateu = 1;
      }
      Serial.println("DistanciaM: " + String(distanciaM));
      Serial.println("Obst no  Meio");
    }

  lightVal = analogRead(ldrPin);
  Serial.println("ablabla");
  Serial.println(lightVal);

  estado1 = digitalRead(buttonPin1);

  while (!digitalRead(buttonPin1));


  // verifica se o botão (pushbutton) está pressionado
  if (estado1 == LOW) {

    // inverte valor da variável variable_buttonEstado
    guarda_estado1 = !guarda_estado1;
  }

  if (guarda_estado1 == HIGH  && !lastButtonState1 && contador1 < 3) {

    contador1++;
    delay(10);
    Serial.print("Valor1: ");            // mostra no serial monitor a contagem cada vez que pushbutton é
    Serial.println(contador1);        // pressionado
  }

  if (deviceConnected) {
    Serial.println("foi");

  }
  //Check if the button was pressed one time
  estado1 = LOW;
  guarda_estado1 = LOW;
  lastButtonState1 = 0;
}
