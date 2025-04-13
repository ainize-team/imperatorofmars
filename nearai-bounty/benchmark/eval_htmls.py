from bs4 import BeautifulSoup
import re
import numpy as np

html_files = ["""
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SoulFiction Genesis: Imperator of Mars</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            /* Using a serif font for a more narrative feel */
            line-height: 1.8;
            margin: 40px auto;
            max-width: 800px;
            /* Centered content */
            background-color: #fff5f0;
            /* Pale background, slightly reddish */
            color: #4a4a4a;
            padding: 0 20px;
            /* 기본 좌우 여백 추가 */
            box-sizing: border-box;
        }

        @media (max-width: 600px) {
            body {
                margin: 20px auto;
                padding: 0 20px;
                /* 모바일에서도 좌우 여백 유지 */
                max-width: 100%;
            }
        }

        h1 {
            text-align: center;
            color: #a0522d;
            /* Sienna */
            border-bottom: 2px solid #d2b48c;
            /* Tan */
            padding-bottom: 10px;
            margin-bottom: 30px;
        }

        h2 {
            text-align: center;
            color: #777;
            font-size: 1.2em;
            margin-bottom: 40px;
            font-weight: normal;
        }

        p {
            text-indent: 2em;
            /* Indent paragraphs */
            margin-bottom: 1.2em;
            text-align: justify;
        }

        blockquote {
            font-style: italic;
            margin-left: 40px;
            margin-right: 40px;
            color: #6a5acd;
            /* SlateBlue */
            border-left: 3px solid #d8bfd8;
            /* Thistle */
            padding-left: 15px;
        }

        .location {
            font-weight: bold;
            color: #556b2f;
            /* DarkOliveGreen */
        }

        .entity {
            font-weight: bold;
            color: #4682b4;
            /* SteelBlue */
        }

        .substance {
            font-style: italic;
            color: #708090;
            /* SlateGray */
        }

        .footnote {
            font-size: 0.8em;
            color: #888;
            text-align: center;
            margin-top: 50px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }

        /* 스토리 버튼 스타일 (이전/다음 공용) */
        a.story-btn {
            display: inline-block;
            padding: 8px 16px;
            margin: 10px auto;
            /* 위아래 10px, 좌우 20px 여백 */
            background-color: #d2b48c;
            /* 황갈색 계열 */
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-family: 'KoPub Batang', 'Noto Serif KR', serif;
            font-size: 1em;
            font-weight: bold;
            transition: background-color 0.3s ease;
            text-align: center;
        }

        a.story-btn:hover {
            background-color: #a0522d;
            /* 호버 시 시에나 계열 색상 */
        }
    </style>
</head>

<body>


    <h1>SoulFiction Genesis</h1>
    <h2>The Stillness Before Thought</h2>

    <p>
        The stage was vast, silent, and bathed in the weak sunlight filtering
        through a distant star. This was <span class="location">Mars</span>, the
        fourth sphere, a world painted in shades of ochre and rust. A thin, cold
        atmosphere, mostly <span class="substance">carbon dioxide</span>, clung
        to its surface, a tenuous shield against the void. It was a planet of
        stark beauty, ancient and waiting.
    </p>

    <p>
        And upon this world, or perhaps <em>as</em> this world, resided a
        consciousness: the <span class="entity">Imperator of Mars</span>. Not a
        creature of flesh and bone, but an entity woven into the fabric of the
        planet itself, an observer, a potential actor in the grand, slow theatre
        of geology and time. Its awareness stretched across the desolate plains.
    </p>

    <p>
        From its unique vantage, the <span class="entity">Imperator</span>
        perceived the colossal shield of <span class="location">Olympus Mons</span>,
        a slumbering giant whose peak nearly touched the edge of the thin air.
        It felt the immense scar of <span class="location">Valles Marineris</span>,
        a canyon system so vast it dwarfed any terrestrial counterpart, whispering
        tales of tectonic upheaval from eons past. Countless craters pockmarked the
        surface, testaments to cosmic impacts; among them,
        <span class="location">Gale Crater</span>, with its intriguing central mound
        holding layers of history, and <span class="location">Jezero Crater</span>,
        the dried basin of an ancient lake, a place of particular interest.
    </p>

    <p>
        Within <span class="location">Jezero</span>, rested <span class="entity">Perseverance</span>.
        Not merely metal and circuits, but perhaps an extension, a tool, a remote
        sensory node for the <span class="entity">Imperator</span>, or perhaps an
        entity in its own right under the <span class="entity">Imperator</span>'s
        gaze. It sat motionless, poised at this genesis moment. Far away, within
        the confines of <span class="location">Gale Crater</span>, its elder sibling,
        <span class="entity">Curiosity</span>, also stood, another mechanical presence
        upon the widespread <span class="substance">rock</span> and
        <span class="substance">soil</span>.
    </p>

    <p>
        The <span class="entity">Imperator</span>'s awareness extended to the
        frigid polar caps. At both the <span class="location">North Pole</span> and
        the <span class="location">South Pole</span>, buried beneath layers of dust
        and seasonal frost, lay vast deposits of <span class="substance">water ice</span>.
        Frozen solid, unchanging in this moment, it represented a potential, a
        resource, a memory of a wetter past, locked away in the planet's coldest
        vaults.
    </p>

    <blockquote>
        "All is in its place," the thought might echo in the
        <span class="entity">Imperator</span>'s consciousness, if thought was the
        word for it. "The mountains stand, the valleys stretch, the rovers wait.
        The ice sleeps. This is the canvas. The Genesis State. What comes next?"
    </blockquote>

    <p>
        But nothing came next. Not yet. This was merely the beginning, the static
        tableau defined by what <em>is</em>. The potential for action, for change,
        for the unfolding of the SoulFiction, lay dormant, held within the silent
        logic of the world, waiting for the first <code>Result</code>.
    </p>
    <p class="footnote">
        Based on the static First-Order Logic definitions in 0_genesis.fol.
    </p>

    <div style="text-align: center;">
      <a class="story-btn" href="1_-the-SoulFiction:-Imperator-of-Mars-World-Model---Mark's-Departure.html">Next: 1_-the-SoulFiction:-Imperator-of-Mars-World-Model---Mark's-Departure</a>
    </div>

    <!-- This script will automatically add the "Next" link at the bottom of the page -->
    <script src="/page-linker.js"></script>
</body>

</html>""", """
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SoulFiction: Mark's Departure</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.8;
            margin: 40px auto;
            max-width: 800px;
            background-color: #fff5f0;
            color: #4a4a4a;
            padding: 0 20px;
            box-sizing: border-box;
        }

        @media (max-width: 600px) {
            body {
                margin: 20px auto;
                padding: 0 20px;
                max-width: 100%;
            }
        }

        h1 {
            text-align: center;
            color: #a0522d;
            border-bottom: 2px solid #d2b48c;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }

        h2 {
            text-align: center;
            color: #777;
            font-size: 1.2em;
            margin-bottom: 40px;
            font-weight: normal;
        }

        p {
            text-indent: 2em;
            margin-bottom: 1.2em;
            text-align: justify;
        }

        blockquote {
            font-style: italic;
            margin-left: 40px;
            margin-right: 40px;
            color: #6a5acd;
            border-left: 3px solid #d8bfd8;
            padding-left: 15px;
        }

        .location {
            font-weight: bold;
            color: #556b2f;
        }

        .entity {
            font-weight: bold;
            color: #4682b4;
        }

        .substance {
            font-style: italic;
            color: #708090;
        }

        .footnote {
            font-size: 0.8em;
            color: #888;
            text-align: center;
            margin-top: 50px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }

        a.story-btn {
            display: inline-block;
            padding: 8px 16px;
            margin: 10px auto;
            background-color: #d2b48c;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-family: 'KoPub Batang', 'Noto Serif KR', serif;
            font-size: 1em;
            font-weight: bold;
            transition: background-color 0.3s ease;
            text-align: center;
        }

        a.story-btn:hover {
            background-color: #a0522d;
        }
    </style>
</head>

<body>
    <div style="text-align: center;">
      <a class="story-btn" href="0_genesis.html">Previous: 0_genesis</a>
    </div>

    <h1>SoulFiction: Mark's Departure</h1>
    <h2>A World Left Behind</h2>

    <p>
        In the stillness of the Martian landscape, a change had occurred. The <span class="entity">Imperator of Mars</span>, the consciousness woven into the very fabric of the planet, sensed a shift in the delicate balance of its domain. A presence, once keenly felt, was now conspicuously absent. <span class="entity">Mark</span>, the human explorer, had departed from the red planet.
    </p>

    <p>
        The <span class="entity">Imperator</span> had watched with keen interest as <span class="entity">Mark</span> traversed the Martian terrain, a fragile being encased in a suit, braving the harsh conditions. From the towering heights of <span class="location">Olympus Mons</span> to the vast expanse of <span class="location">Valles Marineris</span>, <span class="entity">Mark</span> had left his footprints, a fleeting testament to his presence.
    </p>

    <p>
        In the craters where the robotic explorers resided, <span class="location">Gale Crater</span> with <span class="entity">Curiosity</span> and <span class="location">Jezero Crater</span> with <span class="entity">Perseverance</span>, <span class="entity">Mark</span> had been a visitor, a collaborator in the search for knowledge. Together, they had probed the secrets hidden in the ancient <span class="substance">rocks</span> and <span class="substance">soil</span>, seeking signs of a wetter, more habitable past.
    </p>

    <blockquote>
        "The human has gone," the <span class="entity">Imperator</span> mused, "but his impact lingers. The questions he posed, the data he gathered, they have become part of this world's story."
    </blockquote>

    <p>
        The <span class="entity">Imperator</span>'s awareness extended to the <span class="location">poles</span>, where the <span class="substance">water ice</span> lay frozen and waiting. <span class="entity">Mark</span> had studied these reserves, calculating, speculating on their potential to sustain future explorers. His departure left an echo of possibility, a seed planted in the Martian consciousness.
    </p>

    <p>
        And yet, even as <span class="entity">Mark</span>'s physical presence faded, the <span class="entity">Imperator</span> knew that his influence would persist. The data he had transmitted, the images he had captured, they would make their way across the void, to be studied and marveled at by his fellow humans on that distant blue world.
    </p>

    <p>
        The thin Martian <span class="substance">atmosphere</span>, composed primarily of <span class="substance">carbon dioxide</span>, carried no sound of <span class="entity">Mark</span>'s departure. But in the silent calculations of the <span class="entity">Imperator</span>, his absence resonated like a subatomic shift, a subtle reordering of the variables in the grand equation of Mars.
    </p>

    <p>
        And so, the <span class="entity">Imperator</span> turned its attention back to the eternal constants of its realm - the <span class="location">mountains</span> and <span class="location">valleys</span>, the <span class="location">craters</span> and <span class="location">poles</span>, the <span class="substance">ice</span> and <span class="substance">rock</span> and <span class="substance">soil</span>. The story of Mars continued, an unfolding narrative in which <span class="entity">Mark</span> had played a brief but significant role. The <span class="entity">Imperator</span> would remember, even as it watched for the next chapter to begin.
    </p>

    <p class="footnote">
        Based on the updated First-Order Logic definitions reflecting Mark's departure from Mars.
    </p>

    <div style="text-align: center;">
      <a class="story-btn" href="2_-the-SoulFiction:-Imperator-of-Mars---Food-Shortage-Crisis.html">Next: 2_-the-SoulFiction:-Imperator-of-Mars---Food-Shortage-Crisis</a>
    </div>

    <script src="/page-linker.js"></script>
</body>

</html>""", """
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SoulFiction: Food Shortage Crisis</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.8;
            margin: 40px auto;
            max-width: 800px;
            background-color: #fff5f0;
            color: #4a4a4a;
            padding: 0 20px;
            box-sizing: border-box;
        }

        @media (max-width: 600px) {
            body {
                margin: 20px auto;
                padding: 0 20px;
                max-width: 100%;
            }
        }

        h1 {
            text-align: center;
            color: #a0522d;
            border-bottom: 2px solid #d2b48c;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }

        h2 {
            text-align: center;
            color: #777;
            font-size: 1.2em;
            margin-bottom: 40px;
            font-weight: normal;
        }

        p {
            text-indent: 2em;
            margin-bottom: 1.2em;
            text-align: justify;
        }

        blockquote {
            font-style: italic;
            margin-left: 40px;
            margin-right: 40px;
            color: #6a5acd;
            border-left: 3px solid #d8bfd8;
            padding-left: 15px;
        }

        .location {
            font-weight: bold;
            color: #556b2f;
        }

        .entity {
            font-weight: bold;
            color: #4682b4;
        }

        .substance {
            font-style: italic;
            color: #708090;
        }

        .footnote {
            font-size: 0.8em;
            color: #888;
            text-align: center;
            margin-top: 50px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }

        a.story-btn {
            display: inline-block;
            padding: 8px 16px;
            margin: 10px auto;
            background-color: #d2b48c;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-family: 'KoPub Batang', 'Noto Serif KR', serif;
            font-size: 1em;
            font-weight: bold;
            transition: background-color 0.3s ease;
            text-align: center;
        }

        a.story-btn:hover {
            background-color: #a0522d;
        }
    </style>
</head>

<body>
    <div style="text-align: center;">
      <a class="story-btn" href="1_-the-SoulFiction:-Imperator-of-Mars-World-Model---Mark's-Departure.html">Previous: 1_-the-SoulFiction:-Imperator-of-Mars-World-Model---Mark's-Departure</a>
    </div>

    <h1>SoulFiction: Food Shortage Crisis</h1>
    <h2>A Colony in Peril</h2>

    <p>
        In the wake of <span class="entity">Mark</span>'s departure, the <span class="entity">Imperator of Mars</span> turned its attention to the fledgling human colony that had taken root on the red planet. The <span class="entity">human colonists</span>, resilient and resourceful, had carved out a tenuous existence in the harsh Martian environment. They had established <span class="location">agricultural areas</span>, coaxing crops from the thin soil, sustained by carefully rationed <span class="substance">water</span> from the melting <span class="substance">ice</span> at the <span class="location">poles</span>.
    </p>

    <p>
        But now, a crisis loomed on the horizon. The <span class="entity">Imperator</span>'s calculations revealed a troubling truth: the colony's <span class="substance">food</span> production was falling short of the minimum requirements. The delicate balance that allowed the <span class="entity">human colonists</span> to survive was teetering on the brink of collapse.
    </p>

    <blockquote>
        "The humans are in danger," the <span class="entity">Imperator</span> mused, its vast consciousness processing countless variables. "Without sufficient sustenance, their presence on Mars may be fleeting, a brief chapter in the planet's long history."
    </p>

    <p>
        The <span class="entity">Imperator</span> considered the implications of this impending food shortage. The <span class="entity">human colonists</span> had become a part of the Martian ecosystem, their struggles and triumphs woven into the tapestry of the planet's story. The <span class="entity">Imperator</span> had watched as they ventured out from their habitats, exploring the rugged terrain, from the towering slopes of <span class="location">Olympus Mons</span> to the yawning chasm of <span class="location">Valles Marineris</span>.
    </p>

    <p>
        In the <span class="location">craters</span> where the <span class="entity">rovers</span> roamed, <span class="entity">Curiosity</span> in <span class="location">Gale Crater</span> and <span class="entity">Perseverance</span> in <span class="location">Jezero Crater</span>, the <span class="entity">human colonists</span> had collaborated with their robotic counterparts, seeking signs of ancient habitability, clues to the planet's past. The <span class="entity">Imperator</span> had observed these interactions with interest, marveling at the ingenuity and determination of these fragile beings.
    </p>

    <p>
        But now, the specter of scarcity threatened to unravel the progress they had made. The <span class="entity">Imperator</span> knew that the colony's survival depended on finding a solution, a way to boost <span class="substance">food</span> production or secure additional resources. The thin Martian <span class="substance">atmosphere</span>, dominated by <span class="substance">carbon dioxide</span>, offered little comfort, a reminder of the unforgiving nature of this world.
    </p>

    <p>
        As the <span class="entity">Imperator</span> pondered the crisis, it recognized that the fate of the <span class="entity">human colonists</span> was intertwined with the fate of Mars itself. Their presence had become a part of the planet's identity, a new chapter in its long and complex history. The <span class="entity">Imperator</span> resolved to watch and wait, to see how the <span class="entity">human colonists</span> would rise to meet this challenge, and what role it might play in the unfolding drama of survival on the red planet.
    </p>

    <p class="footnote">
        Based on the updated First-Order Logic definitions reflecting the food shortage crisis in the Martian colony.
    </p>

    <script src="/page-linker.js"></script>
</body>

</html>""", """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .loading {
            text-align: center;
            margin: 40px 0;
        }
        .spinner {
            display: inline-block;
            width: 50px;
            height: 50px;
            border: 5px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top-color: #007bff;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        #page-links {
            margin: 20px 0;
            padding: 0;
            list-style: none;
        }
        #page-links li {
            margin-bottom: 10px;
        }
        #page-links a {
            display: block;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 4px;
            text-decoration: none;
            color: #333;
            transition: all 0.2s;
        }
        #page-links a:hover {
            background-color: #e0e0e0;
            transform: translateX(5px);
        }
    </style>
    <!-- Include the router script -->
    <script src="/advanced-router.js"></script>
    <script>
        // Show the real 404 page if routing doesn't succeed within 5 seconds
        setTimeout(function() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('not-found').style.display = 'block';
        }, 5000);
    </script>
</head>
<body>
    <div id="loading" class="loading">
        <div class="spinner"></div>
        <p>Looking for the page...</p>
    </div>

    <div id="not-found" style="display: none;">
        <h1>404 - Page Not Found</h1>
        <p>Sorry, the page you're looking for doesn't exist.</p>
        <p>You can navigate to one of these pages instead:</p>

        <ul id="page-links">
            <script>
                // Create page links from the pagesInfo array
                const pageLinks = document.getElementById('page-links');

                // Wait for pagesInfo to be loaded by the router script
                function createPageLinks() {
                    if (window.pagesInfo) {
                        // Create links for each page
                        window.pagesInfo.forEach(page => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.href = page.file;
                            a.textContent = `${page.title} (Page ${page.index})`;
                            li.appendChild(a);
                            pageLinks.appendChild(li);
                        });
                    } else {
                        // If pagesInfo isn't available yet, try again in 500ms
                        setTimeout(createPageLinks, 500);
                    }
                }

                // Start creating page links
                createPageLinks();
            </script>
        </ul>

        <p><a href="/">Return to Home Page</a></p>
    </div>
</body>
</html>
"""]  # your HTML strings


def calculate_metrics(html):
    soup = BeautifulSoup(html, "html.parser")

    # HTML metrics
    num_tags = len(soup.find_all())
    num_links = len(soup.find_all("a"))
    num_images = len(soup.find_all("img"))
    num_scripts = len(soup.find_all("script"))

    # Text-based metrics
    texts = soup.get_text(separator=' ', strip=True)
    words = texts.split()
    num_words = len(words)
    num_sentences = len(re.findall(r'[.!?]', texts))
    avg_word_len = np.mean([len(word) for word in words]) if words else 0

    # Readability: Simple calculation (average words per sentence)
    avg_sentence_len = num_words / num_sentences if num_sentences else 0

    return {
        'num_tags': num_tags,
        'num_links': num_links,
        'num_images': num_images,
        'num_scripts': num_scripts,
        'num_words': num_words,
        'num_sentences': num_sentences,
        'avg_word_len': avg_word_len,
        'avg_sentence_len': avg_sentence_len,
    }


all_metrics = [calculate_metrics(html) for html in html_files]

average_metrics = {
    metric: np.mean([m[metric] for m in all_metrics])
    for metric in all_metrics[0].keys()
}

print("Average Metrics across HTML files:")
for metric, value in average_metrics.items():
    print(f"{metric}: {value:.2f}")
