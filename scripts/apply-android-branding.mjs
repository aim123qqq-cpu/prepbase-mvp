import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const resDir = path.join(root, "android", "app", "src", "main", "res");

if (!fs.existsSync(resDir)) {
  console.log("Android res directory is missing; run `npx cap add android` first.");
  process.exit(0);
}

write("values/strings.xml", `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">AnalystKit</string>
    <string name="title_activity_main">AnalystKit</string>
    <string name="package_name">ru.sahalper.app</string>
    <string name="custom_url_scheme">ru.sahalper.app</string>
</resources>
`);

write("values/ic_launcher_background.xml", `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <color name="ic_launcher_background">#05070F</color>
</resources>
`);

write("drawable/ic_launcher_foreground.xml", `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#2DEBFF"
        android:pathData="M19,78 L43,26 C45,21 49,18 54,18 C59,18 63,21 65,26 L89,78 L74,78 L68,65 L40,65 L34,78 Z M46,52 L62,52 L54,33 Z" />
    <path
        android:fillColor="#A757FF"
        android:pathData="M66,54 L88,31 L72,31 L50,54 L73,78 L91,78 Z" />
    <path
        android:fillColor="#071022"
        android:fillAlpha="0.78"
        android:pathData="M41,59 L67,59 L72,72 L36,72 Z" />
</vector>
`);

write("mipmap-anydpi-v26/ic_launcher.xml", `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`);

write("mipmap-anydpi-v26/ic_launcher_round.xml", `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`);

console.log("Applied AnalystKit Android branding.");

function write(relativePath, content) {
  const target = path.join(resDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
}
