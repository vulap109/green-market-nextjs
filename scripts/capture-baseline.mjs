import { spawnSync } from "node:child_process";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const baselineDate = "2026-04-06";
const host = "127.0.0.1";
const port = 4173;
const baseUrl = `http://${host}:${port}`;

const publicRoot = path.join(repoRoot, "public");
const outputRoot = path.join(repoRoot, "docs", "migration-baseline", baselineDate);
const screenshotsDir = path.join(outputRoot, "screenshots");
const manifestPath = path.join(outputRoot, "capture-manifest.json");

const browserCandidates = [
    process.env.BASELINE_BROWSER_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean);

const textContentTypes = new Map([
    [".css", "text/css; charset=utf-8"],
    [".html", "text/html; charset=utf-8"],
    [".js", "application/javascript; charset=utf-8"],
    [".json", "application/json; charset=utf-8"],
    [".svg", "image/svg+xml; charset=utf-8"],
    [".txt", "text/plain; charset=utf-8"]
]);

const binaryContentTypes = new Map([
    [".avif", "image/avif"],
    [".gif", "image/gif"],
    [".ico", "image/x-icon"],
    [".jpeg", "image/jpeg"],
    [".jpg", "image/jpeg"],
    [".otf", "font/otf"],
    [".png", "image/png"],
    [".ttf", "font/ttf"],
    [".webp", "image/webp"],
    [".woff", "font/woff"],
    [".woff2", "font/woff2"]
]);

const cartSeed = [
    { id: "1", qty: 2, priceSnapshot: 500000 },
    { id: "66", qty: 1, priceSnapshot: 370000, size: "16cm" }
];

const orderSeed = {
    code: "GMBASELINE20260406001",
    createdAt: "2026-04-06T10:30:00.000Z",
    fullname: "Nguyen Van A",
    phone: "0973074063",
    email: "baseline@example.com",
    province: "Ho Chi Minh",
    district: "Quan 1",
    ward: "Ben Nghe",
    address: "12 Nguyen Hue",
    notes: "Giao gio hanh chinh",
    paymentMethod: "cod",
    items: [
        {
            id: "1",
            name: "Gio Trai Cay TK181",
            sku: "FB03120001",
            size: "",
            image: "/images/gio-trai-cay-tk181.jpg",
            qty: 2,
            unitPrice: 500000,
            lineTotal: 1000000
        },
        {
            id: "66",
            name: "Banh Kem LQ03",
            sku: "FB031200066",
            size: "16cm",
            image: "/images/cake/banh-kem-lq3.jpg",
            qty: 1,
            unitPrice: 370000,
            lineTotal: 370000
        }
    ],
    subtotal: 1370000,
    shippingFee: 0,
    total: 1370000
};

const successPath = `/order-success.html?code=${encodeURIComponent(orderSeed.code)}`;

const scenarios = [
    {
        fileName: "01-home.png",
        path: "/",
        width: 1440,
        height: 2600,
        description: "Home"
    },
    {
        fileName: "02-all-products-fruit-basket.png",
        path: "/all-products.html?q=gio-qua-trai-cay",
        width: 1440,
        height: 2600,
        description: "All products by category"
    },
    {
        fileName: "03-all-products-search-keyword.png",
        path: "/all-products.html?keyword=banh%20kem",
        width: 1440,
        height: 2600,
        description: "All products by keyword search"
    },
    {
        fileName: "04-product-detail-fruit-basket.png",
        path: "/product.html?slug=gio-trai-cay-tk181",
        width: 1440,
        height: 2300,
        description: "Product detail - fruit basket"
    },
    {
        fileName: "05-product-detail-cream-cake.png",
        path: "/product.html?slug=banh-kem-lq03",
        width: 1440,
        height: 2400,
        description: "Product detail - cream cake"
    },
    {
        fileName: "06-cart-with-items.png",
        path: `/__baseline__/seed-cart?next=${encodeURIComponent("/cart.html")}`,
        width: 1440,
        height: 2200,
        description: "Cart with seeded items"
    },
    {
        fileName: "07-checkout-with-items.png",
        path: `/__baseline__/seed-cart?next=${encodeURIComponent("/check-out.html")}`,
        width: 1440,
        height: 2600,
        description: "Checkout with seeded items"
    },
    {
        fileName: "08-news-detail.png",
        path: "/news.html?slug=gio-trai-cay-tu-200k-den-500k",
        width: 1440,
        height: 2600,
        description: "News detail"
    },
    {
        fileName: "09-order-success-cod.png",
        path: `/__baseline__/seed-order-success?next=${encodeURIComponent(successPath)}`,
        width: 1440,
        height: 2600,
        description: "Order success"
    }
];

function resolveBrowserPath() {
    for (const candidate of browserCandidates) {
        const result = spawnSync(candidate, ["--version"], { stdio: "ignore" });

        if (!result.error) {
            return candidate;
        }
    }

    throw new Error(
        "Could not find Chrome/Edge. Set BASELINE_BROWSER_PATH to a valid browser executable."
    );
}

function getCommitSha() {
    const result = spawnSync("git", ["rev-parse", "HEAD"], {
        cwd: repoRoot,
        encoding: "utf-8"
    });

    return result.status === 0 ? result.stdout.trim() : null;
}

function createSeedPage({ cart, order, nextPath }) {
    const next = nextPath || "/";

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Baseline Seed</title>
</head>
<body>
    <script>
        localStorage.removeItem("cart_v1");
        localStorage.removeItem("green_market_last_success_order_v1");
        ${cart ? `localStorage.setItem("cart_v1", ${JSON.stringify(JSON.stringify(cart))});` : ""}
        ${order ? `localStorage.setItem("green_market_last_success_order_v1", ${JSON.stringify(JSON.stringify(order))});` : ""}
        window.setTimeout(function () {
            window.location.replace(${JSON.stringify(next)});
        }, 50);
    </script>
</body>
</html>`;
}

function isInsideRepo(resolvedPath) {
    return resolvedPath === repoRoot || resolvedPath.startsWith(repoRoot + path.sep);
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    if (textContentTypes.has(ext)) {
        return textContentTypes.get(ext);
    }

    if (binaryContentTypes.has(ext)) {
        return binaryContentTypes.get(ext);
    }

    return "application/octet-stream";
}

async function serveStaticFile(filePath, response) {
    const contentType = getContentType(filePath);
    const data = await fs.readFile(filePath);

    response.writeHead(200, { "content-type": contentType });
    response.end(data);
}

async function resolveStaticFile(requestPath) {
    const normalizedPath = requestPath === "/" ? "/index.html" : decodeURIComponent(requestPath);
    const candidates = [
        path.resolve(publicRoot, "." + normalizedPath),
        path.resolve(repoRoot, "." + normalizedPath)
    ];

    for (const candidate of candidates) {
        if (!isInsideRepo(candidate)) {
            continue;
        }

        try {
            const stat = await fs.stat(candidate);
            if (stat.isFile()) {
                return candidate;
            }
        } catch (error) {
            if (!error || error.code !== "ENOENT") {
                throw error;
            }
        }
    }

    return null;
}

async function startServer() {
    const server = createServer(async (request, response) => {
        try {
            const requestUrl = new URL(request.url || "/", baseUrl);

            if (requestUrl.pathname === "/__baseline__/seed-cart") {
                response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                response.end(createSeedPage({
                    cart: cartSeed,
                    nextPath: requestUrl.searchParams.get("next") || "/cart.html"
                }));
                return;
            }

            if (requestUrl.pathname === "/__baseline__/seed-order-success") {
                response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
                response.end(createSeedPage({
                    order: orderSeed,
                    nextPath: requestUrl.searchParams.get("next") || successPath
                }));
                return;
            }

            const filePath = await resolveStaticFile(requestUrl.pathname);
            if (!filePath) {
                response.writeHead(404);
                response.end("Not Found");
                return;
            }

            await serveStaticFile(filePath, response);
        } catch (error) {
            if (error && error.code === "ENOENT") {
                response.writeHead(404);
                response.end("Not Found");
                return;
            }

            response.writeHead(500);
            response.end(String(error));
        }
    });

    await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, host, resolve);
    });

    return server;
}

async function captureScreenshot(browserPath, scenario, profileDir) {
    const outputPath = path.join(screenshotsDir, scenario.fileName);
    const url = `${baseUrl}${scenario.path}`;

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    const args = [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        "--run-all-compositor-stages-before-draw",
        "--force-device-scale-factor=1",
        `--user-data-dir=${profileDir}`,
        `--window-size=${scenario.width},${scenario.height}`,
        `--screenshot=${outputPath}`,
        "--virtual-time-budget=12000",
        url
    ];

    await new Promise((resolve, reject) => {
        const child = spawn(browserPath, args, { stdio: ["ignore", "pipe", "pipe"] });
        let stderr = "";

        child.stderr.on("data", (chunk) => {
            stderr += String(chunk);
        });

        child.on("error", reject);
        child.on("close", (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(`Browser exited with code ${code}: ${stderr.trim()}`));
        });
    });

    return {
        fileName: scenario.fileName,
        path: outputPath,
        url,
        description: scenario.description,
        viewport: {
            width: scenario.width,
            height: scenario.height
        }
    };
}

async function main() {
    const browserPath = resolveBrowserPath();
    const profileDir = path.join(outputRoot, ".tmp", "browser-profile");
    const commitSha = getCommitSha();

    await fs.mkdir(profileDir, { recursive: true });
    await fs.mkdir(screenshotsDir, { recursive: true });

    const server = await startServer();
    const results = [];

    try {
        for (const scenario of scenarios) {
            // Reuse the same seeded profile so redirects can populate localStorage per scenario.
            results.push(await captureScreenshot(browserPath, scenario, profileDir));
        }
    } finally {
        await new Promise((resolve) => server.close(resolve));
    }

    const manifest = {
        baselineDate,
        capturedAt: new Date().toISOString(),
        commitSha,
        browserPath,
        baseUrl,
        screenshots: results.map((item) => ({
            fileName: item.fileName,
            relativePath: path.relative(repoRoot, item.path).replaceAll("\\", "/"),
            url: item.url,
            description: item.description,
            viewport: item.viewport
        }))
    };

    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

    console.log(`Captured ${results.length} baseline screenshots.`);
    console.log(`Manifest: ${path.relative(repoRoot, manifestPath)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
