import pygame

pygame.init()
screen = pygame.display.set_mode((450,450))
pygame.display.set_caption("Tic Tac Toe")

fondo = pygame.image.load('static/tictactoe_background.png')
circulo = pygame.image.load('static/circle.png')
equis = pygame.image.load('static/x.png')
