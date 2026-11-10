# Adding your photos

The site supports a personal portrait and any number of photos per project, hackathon, or community album. Photos are detected automatically; you do not need to edit the HTML or JavaScript.

## Personal portrait

Put your preferred photo in `public/images/profile/` and name it `portrait.jpg`, `portrait.png`, or `portrait.webp`. A file named `portrait.*` takes priority over the fallback portrait. Use a reasonably sharp image with your face near the center.

## Project and event albums

Create the relevant folder and add your photos:

| Album | Folder under `public/images/` |
| --- | --- |
| LLM serving platform | `projects/llm/` |
| Kubernetes platform | `projects/kubernetes/` |
| Vegetable classification | `projects/vision/` |
| Crop recommendation | `projects/crop/` |
| Student mental health analysis (PDA) | `projects/student-mental-health/` |
| Technova 1.0 | `hackathons/technova/` |
| Fit-Tech 1.0 | `hackathons/fit-tech/` |
| MasterFaster 2.0 | `hackathons/masterfaster/` |
| CPC FSS | `community/cpc/` |
| Hello World 6.0 | `competitions/hello-world-6/` |
| TechResolve Challenge 2.0 | `hackathons/techresolve-2/` |

For example:

```text
public/images/hackathons/technova/
  01-team.jpg
  02-demo.jpg
  03-award.jpg
  captions.json
```

JPG, JPEG, PNG, WebP, and AVIF are supported. Numeric filenames control display order. The first image becomes the card cover. Every image is available in the detail gallery using arrows, thumbnails, or the left/right keyboard keys.

## Captions and accessible descriptions

Optionally add a `captions.json` in the same folder:

```json
{
  "01-team.jpg": "Our team at Technova 1.0",
  "02-demo.jpg": "Presenting our project",
  "03-award.jpg": "The first-place award"
}
```

Use captions that accurately describe the real photos. Captions also supply alternative text; files without captions receive an album-based description.

## Preview and publish

Run `npm run dev` and reload the page after adding photos. The local server discovers them on each load. `npm run build` creates the image manifest for hosting. Redeploy the built site to update the hosted portfolio.

Albums without photos keep their designed covers. The event albums contain the photos supplied for the portfolio. Keep images around 1600–2000 pixels on the longest side and compressed for fast loading. Adding or removing files updates album counts automatically.

New album folder definitions live in `content/albums.json`; add matching card and detail content when introducing a new project or event.

## Curated project galleries

The PDA and vegetable-classification galleries each publish five selected images. The complete uploaded slide sets remain in the parent workspace; only selected copies live under `public/images/projects/`.

- **Student Mental Health Analysis:** source slides **7, 18, 25, 30, 36**. They show the survey cohort, PCA explained variance, correspondence analysis, K-means projection, and balanced model evaluation.
- **Vegetable Image Classification:** source slides **1, 3, 9, 11, 15**. They show the overview, model approaches, test results, prediction examples, and accuracy-versus-efficiency trade-offs.

The PDA album folder is `public/images/projects/student-mental-health/`. Keep five images in each curated folder when updating these selections.

### Crop recommendation selection

The crop-recommendation gallery publishes **three images**, from source slides **3, 13, and 15**: the prediction objective, tuned model comparisons, and the web application. They are stored under `public/images/projects/crop/`. Keep three selected images in this gallery.
