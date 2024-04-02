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

#Cabeza serpientea
cabeza = turtle.Turtle()
cabeza.speed(0)
cabeza.shape("square")
cabeza.color("white")
cabeza.penup()
cabeza.goto(0,0)
cabeza.direction = "stop"

#Comida
comida = turtle.Turtle()
comida.speed(0)
comida.shape("circle")
comida.color("orange")
comida.penup()
comida.goto(100,0)

#Segmentos / cuerpo de la serpiente
segmentos = []

#Texto
texto = turtle.Turtle()
texto.speed(0)
texto.color("white")
texto.penup()
texto.hideturtle()
texto.goto(0,260)
texto.write("Score: 0        High Score: 0", align = "center", font = ("Courier", 24, "normal"))

#Funciones
def arriba():
    if cabeza.direction != "down":
        cabeza.direction = "up"
def abajo():
    if cabeza.direction != "up":
        cabeza.direction = "down"
def derecha():
    if cabeza.direction != "left": 
        cabeza.direction = "right"
def izquierda():
    if cabeza.direction != "rigth":
        cabeza.direction = "left"

def mov():
    if cabeza.direction == "up":
        y = cabeza.ycor()
        cabeza.sety(y + 20)
    
    if cabeza.direction == "down":
        y = cabeza.ycor()
        cabeza.sety(y - 20)

    if cabeza.direction == "right":
        x = cabeza.xcor()
        cabeza.setx(x + 20)

    if cabeza.direction == "left":
        x = cabeza.xcor()
        cabeza.setx(x - 20)

#Teclado
screen.listen()
screen.onkeypress(arriba, "Up")
screen.onkeypress(abajo, "Down")
screen.onkeypress(izquierda, "Left")
screen.onkeypress(derecha, "Right")

while True:
    screen.update()
