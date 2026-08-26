# Freedom Factory POC V3

V3 changes the motion system rather than simply zooming photographs.

## Main changes
- Drift is now a layered CSS motion study:
  - road/background
  - separate car layer
  - car translation and rotation
  - tire marks
  - multiple smoke layers
- Burnout is a different interaction:
  - car stays planted
  - subtle body rotation
  - smoke grows outward from the rear
  - smoke becomes a transition/wipe
- Placeholder image cards no longer contain website typography.
- Event preview is built from clean CSS layers so the page's typography is not fighting embedded image text.
- Existing external ticket destination remains TheFOAT.
- Navigation uses smooth scroll and active section state.
- No framework, no API calls, no embedded video.
- Scroll work is driven by requestAnimationFrame and CSS transforms/opacity.

## Important
The current image files are still temporary concept assets from the previous prototype. The animation sections intentionally do NOT depend on them. Replace hero/track/final with clean approved photography when available.

## Production direction
For the final build, replace the CSS motion study with:
- 8–16 optimized AVIF/WebP frames for drift if a real car sequence is available.
- A lightweight burnout frame sequence or transparent smoke sprites.
- IntersectionObserver-based loading for sequence assets.
- Real event data/CMS.
- Real SVG track map.
