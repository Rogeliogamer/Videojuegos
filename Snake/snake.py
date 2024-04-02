import turtle
import time
import random

posponer = 0.1

#Marcador
score = 0
high_score = 0

#Configuracion de la ventana
screen = turtle.Screen()
screen.title("Juego de Snake")
screen.bgcolor("black")
screen.setup(width = 600, height = 600)
screen.tracer(0)
