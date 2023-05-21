# file-convert
Web app to convert between media formats (e.g. images, audio, video) using FFMpeg

## Running locally
### Dependencies
- [ffmpeg](https://ffmpeg.org/)
- [bun](https://bun.sh) (not required but the build scripts use it)

### Steps
1. Install dependencies in both web and api packages — `bun i` / `npm i` / etc
2. Run `run_api.sh` (api will live at port 8000)
3. In a separate terminal window/tab `bun run dev` (or, `npm run dev` or whatever)
4. Visit `localhost:3000` in a web browser

*Important Note!: Both original and converted files are stored and do not expire yet. Make sure to delete files you don't need in the `/api/converted` folder*

---

by [PineappleRind](https://github.com/pineapplerind) — version 0 <small>(initial development)</small> — 2023