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
                //Guardar posición
                cin>>posCasilla[0]>>posCasilla[1];
                retorno = DescubrirCasilla();
                //Perdio al descubrir casilla
                if(retorno == -1){
                    return;
                }else if(retorno == 2 && tableroConBombas){
                    //Vaciar sector
                    VaciarSector(posCasilla[0],posCasilla[1]);
                }
                if(!tableroConBombas){
                    //Llenar el tablero con bombas
                    LlenarTablero();
                    tablero[posCasilla[0]][posCasilla[1]] = -1;
                    tableroConBombas = true;
                    retorno = DescubrirCasilla();
                    if(retorno == -1){
                        return;
                    }else if(retorno == 2 && tableroConBombas){
                        //Vaciar sector
                        VaciarSector(posCasilla[0],posCasilla[1]);
                    }
                }
                break;
            case '2':
                //Pedir posición
                cout<<"Ingrese la posicion de la casilla a marcar: ";
                //Guardar posición
                cin>>posCasilla[0]>>posCasilla[1];
                if(tablero[posCasilla[0]][posCasilla[1]] == 10){
                    tablero[posCasilla[0]][posCasilla[1]] = 1011;
                }else if(tablero[posCasilla[0]][posCasilla[1]] == -1){
                    tablero[posCasilla[0]][posCasilla[1]] = 11;
                }
                break;
            case '3':
                //Pedir posición
                cout<<"Ingrese la posicion de la casilla a desmarcar: ";
                //Guardar posición
                cin>>posCasilla[0]>>posCasilla[1];
                if(tablero[posCasilla[0]][posCasilla[1]] == 11){
                    tablero[posCasilla[0]][posCasilla[1]] = -1;
                }else if(tablero[posCasilla[0]][posCasilla[1]] == 1011){
                    tablero[posCasilla[0]][posCasilla[1]] = 10;
                }
                break;
        }
    }
    //Mensaje ganador
    cout<<"\n 🍾🥳 FELICITACIONES HAS GANADO 🥳🍾 Ingrese ok para continuar: ";
    //Guardar OK
    cin>>eleccion;
}

//Funcion comprobar casillas
bool ComprobarCasillas(){
    for(int i = 0; i < tamTablero[0]; i++){
        for(int j = 0; j < tamTablero[1]; j++){
            cout<<tablero[i][j]<<endl;
            if(tablero[i][j] == -1){
                return true;
            }
        }
    }
    return false;
}

//Funcion mostrar tablero
void MostrarTablero(bool mostrarBombas){
    //Limpiar pantalla
    LimpiarPantalla();
    for(int i = 0; i < tamTablero[1]; i++){
        cout<<" "<<i;
    }
    cout<<endl;
    for(int i = 0; i < tamTablero[0]; i++){
        for(int j = 0; j < tamTablero[1]; j++){
            switch(tablero[i][j]){
                //Casilla no descubierta
                case -1:
                    cout<<"⬜";
                    break;
                case 0:
                    cout<<"⬛";
                    break;
                case 1:
                    cout<<"1️⃣";
                    break;
                case 2:
                    cout<<"2️⃣";
                    break;
                case 3:
                    cout<<"3️⃣";
                    break;
                case 4:
                    cout<<"4️⃣";
                    break;
                case 5:
                    cout<<"5️⃣";
                    break;
                case 6:
                    cout<<"6️⃣";
                    break;
                case 7:
                    cout<<"7️⃣";
                    break;
                case 8:
                    cout<<"8️⃣";
                    break;
                //Casilla con bomba
                case 10:
                    if(mostrarBombas){
                        //Mostrar bomba
                        cout<<"💣";
                    }
                    else{
                        //No mostrar nada
                        cout<<"⬜";
                    }
                    break;
                case 1011:
                    if(mostrarBombas){
                        cout<<"💣";
                    }else{
                        cout<<"🚩";
                    }
                case 11:
                    cout<<"🚩";
                    break;
            }
        }
        cout<<" "<<i;
        cout<<endl;
    }
}

//Función descubrir casilla
int DescubrirCasilla(){
    //Contador
    int cont = 0;
    switch(tablero[posCasilla[0]][posCasilla[1]]){
        case 11:
        case 1011:
            //Mensaje de casilla marcada
            cout<<"Casilla marcada, no es posible descubrirla. Ingrese OK: ";
            //Guadar OK
            cin>>eleccion;
            break;
        case 10:
            //Mostrar tablero
            MostrarTablero(true);
            //Mensaje perdedor
            cout<<"\n😱 Perdiste 😱 Ingrese OK: ";
            return -1;
            break;
        case -1:
            for(int i = 0; i < 8; i++){
                if(posCasilla[0]+ operaciones[i][0] >= 0 && posCasilla[0]+ operaciones[i][0] < tamTablero[0]){
                    if(posCasilla[1]+ operaciones[i][1] >= 0 && posCasilla[1]+ operaciones[i][1] < tamTablero[1]){
                        if(tablero[posCasilla[0]+operaciones[i][0]][posCasilla[1]+operaciones[i][1]] == 10 || tablero[posCasilla[0]+operaciones[i][0]][posCasilla[1]+operaciones[i][1]] == 1011){
                            cont++;
                        }
                    }
                }
            }
            tablero[posCasilla[0]][posCasilla[1]] = cont;
            return 2;
            break;
        default:
            break;
    }
    return 0;
}
