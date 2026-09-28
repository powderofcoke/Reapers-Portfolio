# Reaper | Roblox World Builder

A responsive portfolio for Roblox builds, powered by plain HTML, CSS, and JavaScript. Project images and video clips are discovered automatically from `Images/` and `Videos/`. Game UI media is discovered separately from `GUI Images/` and `GUI Videos/`; the Game UI section shows `None` while those folders are empty.

## Add a project

1. Add image files to `Images/` and video files to `Videos/`. Add interface screenshots or clips to `GUI Images/` and `GUI Videos/`. Subfolders are supported.
2. Optionally add a title and description for a file under `projectDetails` in `site-config.json`, using its path relative to the repository root:

```json
"projectDetails": {
	"Images/Example.png": {
		"title": "The Overlook",
		"description": "A quiet mountain outpost built above the clouds."
	}
}
```

3. Commit and push to `main`. The GitHub Actions workflow indexes the media and publishes the updated site automatically.

Supported images: AVIF, GIF, JPEG, JPG, PNG, and WebP. Supported video: M4V, MOV, MP4, OGV, and WebM. Browser video playback depends on the codec used.

## Customize your details

Edit `site-config.json` to change the name, bio, description, contact email, or social links. Social links use this format:

```json
"socials": [
	{ "label": "Roblox", "url": "https://www.roblox.com/users/your-user-id/profile" }
]
```

To preview locally, run `node scripts/generate-media.mjs`, then start a static server from the repository root, for example `python3 -m http.server 8000`, and open `http://localhost:8000`.

## Publish with GitHub Pages

Push to the `main` branch. In the repository's **Settings → Pages**, select **GitHub Actions** as the deployment source. The included workflow indexes the media and deploys the site on each subsequent push to `main`. You can also run the workflow manually from the repository's **Actions** tab.