#include <iostream>
#include <cstdlib> // Para la función system
#include <ctime>   // Para la función time

// La siguiente línea indica que se utilizarán todos los elementos del espacio de nombres std
using namespace std;

//Funciones
void LimpiarPantalla();
void JugarPartida();
void Dibujar();

//Variables
//Variable para elegir opcion del menu
char eleccion;
//Palabras del juego
string palabras[] = {"monitor","microfono","televisor","telefono","caja","fibron","teclado","pc","collar","manzana"};
//Palabra a jugar
string palabra;
//Letras falladas
string letrasFalladas;
//Numero aleatorio
int nA;
//Vida del jugador
int vida;
//Letra correcta
bool correcta;
//Palabra se completo
bool completa;

//Metodo principal
int main(){
    //Menu
    while(true){
        //vida del juego
        vida = 6;

        //Sin palabra de juego
        palabra = "";

        //Sin letras falladas
        letrasFalladas = "";

        //Limpiar la pantalla
        LimpiarPantalla();

        //Menu del juego
        cout<<"\t::::MENU::::"<<endl;
        cout<<"1) JugarPartida."<<endl;
        cout<<"2) Salir."<<endl;
        cout<<"Eleccion: ";

        //Guarda eleccion
        cin>>eleccion;

        //Eleccion del menu
        switch(eleccion){
            //Juego
            case '1':
                //Partida de juego
                JugarPartida();
                break;
            //Salir
            case '2':
                //Salir
                return 0;
                break;
        }
    }
}

//Funcion para jugar partida
void JugarPartida(){
    //Generar semilla
    srand((int)time(NULL));

    //Generar numero a partir de la cantidad de palabras
    nA = rand()%10;

    //Tamaño de la palabra
    for(int i = 0; i < (int)palabras[nA].size(); i++){
        palabra += "-";
    }

    //Partida en curso
    while(vida > 0){
    }
}
