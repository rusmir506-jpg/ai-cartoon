import { Config } from "@remotion/cli/config";
// Pre-installed headless Chromium in this environment; override with REMOTION_BROWSER if needed.
const browser = process.env.REMOTION_BROWSER ?? "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
import fs from "fs";
if (fs.existsSync(browser)) Config.setBrowserExecutable(browser);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
