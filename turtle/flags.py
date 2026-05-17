import turtle

t = turtle.Turtle()
t.speed(0)

# 1. USER INPUTS
bg_choice = input("Choose background (Black or White): ").lower()
group_choice = input("Choose Group 1 (Vertical) or Group 2 (Horizontal): ")
country = input("Choose a country from that group: ").lower()

# 2. THE BACKGROUND (Outer Selection)
t.penup()
t.goto(-300, 300)
if bg_choice == "black":
    t.color("black")
else:
    t.color("white")

t.begin_fill()
for i in range(4):
    t.forward(600)
    t.right(90)
t.end_fill()

# 3. THE NESTED LOGIC (Branching)
# We move the turtle to the flag starting position
t.goto(-150, 100)

if group_choice == "1":
    # --- NESTED IF: VERTICAL FLAGS ---
    if country == "france":
        c1, c2, c3 = "blue", "white", "red"
    elif country == "ireland":
        c1, c2, c3 = "green", "white", "orange"
    else: # Default to Italy
        c1, c2, c3 = "green", "white", "red"
    
    # Draw 3 vertical stripes
    for col in [c1, c2, c3]:
        t.color(col)
        t.begin_fill()
        for _ in range(2):
            t.forward(100)
            t.right(90)
            t.forward(200)
            t.right(90)
        t.end_fill()
        t.forward(100)

elif group_choice == "2":
    # --- NESTED IF: HORIZONTAL FLAGS ---
    if country == "poland":
        top, bottom = "white", "red"
    elif country == "ukraine":
        top, bottom = "blue", "yellow"
    else: # Default to Indonesia
        top, bottom = "red", "white"

    # Draw 2 horizontal stripes
    for col in [top, bottom]:
        t.color(col)
        t.begin_fill()
        for _ in range(2):
            t.forward(300)
            t.right(90)
            t.forward(100)
            t.right(90)
        t.end_fill()
        # Move down for the next stripe
        t.penup()
        t.right(90)
        t.forward(100)
        t.left(90)
        t.pendown()

t.hideturtle()
turtle.done()
