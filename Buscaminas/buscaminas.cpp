#include <iostream>
#include <vector>
#include <time.h>

//Funciones
void LimpiarPantalla();
void Configuracion();
void JugarPartida();
bool ComprobarCasillas();
void MostrarTablero(bool mostrarBombas);
int DescubrirCasilla();
void LlenarTablero();
void VaciarSector(int y, int x);

//Matriz
vector<vector<int>> tablero;

//Variables
//Eleccion del menu
char eleccion;
//Tamaño del tablero
vector<int> tamTablero(2);
//Posición en el tablero
vector<int> posCasilla(2);
//Cantidad de minas
int cantMinas = 0;
//Tablero con bombas
bool tableroConBombas = false;
//Vecinos bombas
vector<vector<int>> operaciones = {{1,0},{1,1},{0,1},{-1,1},{-1,0},{-1,-1},{0,-1},{1,-1}};

//Metodo principal
int main(){
    while(true){
        //Limpiar pantalla
        LimpiarPantalla();
        //Titulo
        cout<<"::::BUSCAMINAS::::"<<endl;
        //Opciones del menú
        cout<<"1) Jugar"<<endl;
        cout<<"2) Salir"<<endl;
        cout<<"Elección: ";
        //Guardar elección del menu
        cin>>eleccion;
        //Instrucciones de la opción
        switch(eleccion){
            //Partida
            case '1':
                //Funcion de configuración
                Configuracion();
                //Jugar partida
                JugarPartida();
                break;
            //Salir
            case '2':
                return 0;
                break;
        }
    }
    return 0;
}

//Funcion limpiar pantalla
void LimpiarPantalla(){
    //Limpiar pantalla para windows
    if(system("cls") == -1){
        cout<<"Error al borrar pantalla"<<endl;
    }
}

//Funcion Configuración
void Configuracion(){
    //Limpiar pantalla
    LimpiarPantalla();
    //Titulo
    cout<<"::::CONFIGURACION::::"<<endl;
    //Ingresa el tamaño del tablero
    cout<<"Ingrese el tamaño del tablero: "<<endl;
    //Guardar el tamaño del tablero
    cin>>tamTablero[0]>>tamTablero[1];
    //Ingresa la cantidad de minas
    cout<<"Ingrese la cantidad de minas: ";
    //Guardar cantidad de minas
    cin>>cantMinas;
    //Redimencionar tablero
    tablero.resize(tamTablero[0],(vector<int>(tamTablero[1])));
    for(int i = 0; i < tamTablero[0]; i++){
        for(int j = 0; j < tamTablero[1]; j++){
            tablero[i][j] = -1;
        }
    }
}

//Funcion jugar partida
void JugarPartida(){
    tableroConBombas = false;
    while(ComprobarCasillas()){
        //Mostrar tablero
        MostrarTablero(false);
        //Opciones del usuario
        cout<<"\n1) Descubrir Casilla"<<endl;
        cout<<"2) Marcar Casilla"<<endl;
        cout<<"3) Desmarcar Casilla"<<endl;
        cout<<"Eleccion: ";
        //Guardar elección
        cin>>eleccion;
        int retorno;
        switch (eleccion){
            case '1':
                //Perdir posición
                cout<<"Ingrese la posicion de la casilla a descubrir: ";
                break;
            case '2':
                break;
            case '3':
                break;
        }
    }
}
