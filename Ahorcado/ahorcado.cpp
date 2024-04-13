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
        //Limpiar pantalla
        LimpiarPantalla();

        //Titulo
        cout<<"\t::: A H O R C A D O :::"<<endl;

        //Cuerpo
        Dibujar();

        //Letras falladas
        cout<<"Fallos: "<<letrasFalladas;

        //Progreso de juego
        cout<<"    Progreso: "<<palabra<<endl;

        //Ingresa letra
        cout<<"Ingrese una letra(minuscula): ";

        //Guardar letra
        cin>>eleccion;

        //Letra no es correcta
        correcta = false;

        //Encontrar si la letra forma parte de la palabra
        for(int i = 0; i < (int)palabras[nA].size(); i++){
            if(palabras[nA][i] == eleccion){
                //Letra de la palabra es igual a la letra dada
                palabra[i] = eleccion;
                //Letra es correcta
                correcta = true;
            }
        }

        //Letra no es correcta
        if(!correcta){
            //Pierde una vida
            vida--;
            //Letras falladas
            letrasFalladas += eleccion;
        }

        //Palabra se completo
        completa = true;
        for(int i = 0; i < (int)palabra.size(); i++){
            //Palabra no se completo
            if(palabra[i] == '-'){
                completa = false;
            }
        }
        if(completa){
            //Limpiar la pantalla
            LimpiarPantalla();

            //Titulo
            cout<<"\t::: A H O R C A D O :::"<<endl;

            //Cuerpo
            Dibujar();

            //Palabra completada
            cout<<"Palabra: "<<palabras[nA]<<endl;

            //Mensaje ganador e ingese un caracter para continuar
            cout<<"Ganaste. Ingresa un caracter para continuar: ";

            //Guardar caracter
            cin>>eleccion;

            //Salir de la funcion
            return;
        }
    }

    //Limpia la pantalla
    LimpiarPantalla();

    //Titulo
    cout<<"\t::: A H O R C A D O :::"<<endl;

    //Cuerpo
    Dibujar();

    //Palabra completa
    cout<<"Palabra: "<<palabras[nA]<<endl;

    //Mensaje perdedor e ingese un caracter para continuar
    cout<<"Perdiste. Ingresa un caracter para continuar: ";

    //Guardar caracter
    cin>>eleccion;

    //Salir de la funcion
    return;
}

//Funcion del cuerpo
void Dibujar(){
    switch(vida){
        //Sin cuerpo
        case 6:
            cout<<"  ........"<<endl;
            cout<<"  |      |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<" ---"<<endl;
            break;
        //Cabeza del cuerpo
        case 5:
            cout<<"  ........"<<endl;
            cout<<"  |      |"<<endl;
            cout<<"  |      O"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<" ---"<<endl;
            break;
        //Cabeza y torzo del cuerpo
        case 4:
            cout<<"  ........"<<endl;
            cout<<"  |      |"<<endl;
            cout<<"  |      O"<<endl;
            cout<<"  |      |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<" ---"<<endl;
            break;
        //cabeza, torzo y brazo derecho
        case 3:
            cout<<"  ........"<<endl;
            cout<<"  |      |"<<endl;
            cout<<"  |      O"<<endl;
            cout<<"  |     /|"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<"  |"<<endl;
            cout<<" ---"<<endl;
            break;
        
    }
}
