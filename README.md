# Hadi · Helen L'Heureux — website prototype

A demo of Hadi's personal website, built from her brief ("Website Plan.md"), her photos and the *Threads of Connection* presentation.

**Status:** prototype for review. Pages carry `noindex` so search engines skip them, and anything still to be written is marked with a gold dashed **draft** label.

## Pages

| Page | File |
| --- | --- |
| Landing: Hadi at the centre, five planets orbiting, joined by gold threads | `index.html` |
| Education: Montessori consultancy (her favourite photo, IMG_4867, under the title) | `education.html` |
| Wellbeing: yoga, meditation, sound baths, retreats | `wellbeing.html` |
| Dance: Dances of Universal Peace, and the dances she has birthed | `dance.html` |
| Community: support for organisations | `community.html` |
| Sufi Inner Life: blog and paintings | `inner-life.html` |
| The Soul of the Child: her hand-drawn tree, made explorable | `soul-of-the-child.html` |

## How it's built

Plain HTML, CSS and JavaScript, with no build step, so it can be hosted anywhere (GitHub Pages now; Cloudflare Pages or Netlify later).

- `assets/css/site.css` holds the design tokens (colours, fonts) at the top.
- `assets/js/orbit.js` runs the landing-page orbit. The planet titles, invitations and links are in the `PLANETS` list at the top.
- `assets/js/site.js` runs the starfield, scroll reveals and photo lightbox.
- Images were resized and had their metadata stripped (including iPhone GPS location). Photos showing children's faces were left out on purpose.
- Motion stops for visitors whose device asks for reduced motion.

## Preview locally

```bash
python3 -m http.server 8642
```

Then open http://localhost:8642.

## Still needed from Hadi

- Which name to lead with (Hadi / Helen L'Heureux), and whether the site should also be in French
- A portrait photo for the centre of the orbit (natural light, outdoors)
- Contact email, and the link to her Dances of Universal Peace profile
- Stories and recordings of the dances she has written
- Testimonials from retreat participants
- Event dates, blog posts, and her own words for the draft sections
- Permission to use the Dances of Universal Peace logo, if wanted
