import os
import subprocess

voice = "en-US-BrianNeural"
scripts = {
    3: "What would it sound like if we were to rotate regular polygons on the circle of fifths and every time a vertex of the rotating polygon crosses over a note that note gets played. The simplest regular polygon is an equilateral triangle and on the circle of fifths an equilateral triangle forms an augmented Triad that is the root the major third and the sharp fifth or augmented fifth. So when we rotate this triangle we'll just get a series of augmented chords. If we rotate the triangle clockwise instead we get the same chords just played in the opposite order which is true for all of the polygons will be rotating.",
    4: "With a square we get another symmetrical chord. A diminished seventh chord which is just minor thirds stacked on top of each other.",
    5: "The Pentagon is the first shape where the vertices don't all land on notes at the same time. Before rotating this shape and listening to the results take a guess as to what you think it will play. Pause the video if you want. When I first ran this I was a bit surprised by the result. It's playing a chromatic scale all 12 notes in ascending order. Add this to your list of useless but interesting facts.",
    6: "A hexagon plays all the notes of the two whole tone scales as alternating chords.",
    7: "A heptagon does the same thing as the Pentagon but in the opposite order and a bit faster relative to the rotation speed.",
    8: "An octagon plays the same diminished chords as the square but twice as fast relative to the rotation speed and in the opposite direction.",
    9: "A nonagon or nine-sided polygon plays augmented chords but three times as fast as the triangle and in the opposite direction.",
    10: "The decagon plays the chromatic scale at the same speed as the Pentagon except that it plays two chromatic scales simultaneously a tritone apart.",
    11: "The hendecagon or 11-sided polygon plays either the circle of fourths or fifths whichever one is in the opposite direction of the rotation.",
    12: "And finally I'll leave you with arguably the worst sounding polygon, a dodecagon. As you might have already figured out this will just play all 12 notes simultaneously."
}

os.makedirs("public/audio", exist_ok=True)

for i in range(3, 13):
    text = scripts[i]
    print(f"Generating audio for Polygon {i}...")
    subprocess.run([
        "edge-tts", 
        "--voice", voice, 
        "--text", text, 
        "--write-media", f"public/audio/poly_{i}.mp3", 
        "--write-subtitles", f"public/audio/poly_{i}.vtt"
    ], check=True)

print("Audio generation complete!")
