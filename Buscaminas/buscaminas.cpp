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
    }
}
