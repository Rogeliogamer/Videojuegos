import pygame

pygame.init()
screen = pygame.display.set_mode((450,450))
pygame.display.set_caption("Tic Tac Toe")

fondo = pygame.image.load('static/tictactoe_background.png')
circulo = pygame.image.load('static/circle.png')
equis = pygame.image.load('static/x.png')

fondo = pygame.transform.scale(fondo, (450,450))
circulo = pygame.transform.scale(circulo, (125,125))
equis = pygame.transform.scale(equis, (125,125))

coor = [[(40,50),(165,50),(290,50)],
        [(40,175),(165,175),(290,175)],
        [(40,300),(165,300),(290,300)]]

tablero = [['','',''],
           ['','',''],
           ['','','']]

turno = 'X'
game_over = False
clock = pygame.time.Clock()

def graficar_board():
    screen.blit(fondo, (0,0))
    for fila in range(3):
        for col in range(3):
            if tablero[fila][col] == 'X':
                dibujar_X(fila,col)
            elif tablero[fila][col] == 'O':
                dibujar_o(fila,col)

def dibujar_X(fila,col):
    screen.blit(equis, coor[fila][col])

def dibujar_o(fila,col):
    screen.blit(circulo, coor[fila][col])
