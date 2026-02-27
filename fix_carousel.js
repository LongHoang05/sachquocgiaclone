/**
 * Fix Owl Carousel: Inject jQuery + owl.carousel + inline init vào tất cả HTML
 *
 * Problem: clone_website.js xóa tất cả <script> tags → carousel JS không chạy
 * Solution: inject jQuery + owl.carousel.min.js + inline init script vào trước </body>
 */

const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "clone-project");

// Inline init script — extracted from main_1.js typicalSilder + homeSilder + collectionSlider
const CAROUSEL_INIT_SCRIPT = `
<script>
$(document).ready(function() {
  // typicalSilder - book carousels
  function initTypicalSlider(elm, number, auto, margin) {
    if ($(elm).length === 0) return;
    var $owl = $(elm).owlCarousel({
      loop: false,
      margin: margin,
      lazyLoad: true,
      autoplay: auto,
      autoplayTimeout: 6000,
      autoplayHoverPause: false,
      smartSpeed: 300,
      nav: true,
      dots: false,
      autoWidth: false,
      responsive: {
        0: { items: 2 },
        600: { items: 2 },
        768: { items: 3 },
        769: { items: 3 },
        1000: { items: number },
        1024: { items: number },
        1200: { items: number }
      },
      navText: [
        '<i class="fas fa-angle-left text-secondary fa-2xl"></i>',
        '<i class="fas fa-angle-right text-secondary fa-2xl"></i>'
      ]
    });
    $owl.trigger("refresh.owl.carousel");
  }

  // Init all book carousels
  initTypicalSlider(".book-carousel-5", 5, true, 0);
  initTypicalSlider(".sach_noi_bat_home", 6, true, 0);
  initTypicalSlider(".book_care", 6, false, 15);
  initTypicalSlider(".book_same_author", 6, false, 15);
  initTypicalSlider(".book_same_category", 6, false, 15);
  initTypicalSlider(".book_sl_home", 6, false, 0);
  initTypicalSlider(".book_sl_home_mb", 6, false, 15);
  initTypicalSlider(".book_slide_left", 5, false, 15);

  // Home banner slider
  if ($(".home-slider .owl-carousel").length) {
    var $owl = $(".home-slider .owl-carousel").owlCarousel({
      items: 1,
      responsive: {
        1024: { item: 1 },
        991: { items: 1 },
        768: { items: 1 },
        320: { items: 1 },
        0: { items: 1 }
      },
      loop: false,
      rewind: false,
      autoplay: true,
      autoplayTimeout: 6000,
      autoplayHoverPause: true,
      smartSpeed: 600,
      mouseDrag: true,
      nav: true,
      navText: ['<i class="fas fa-angle-left text-secondary fa-2xl"></i>', '<i class="fas fa-angle-right text-secondary fa-2xl"></i>'],
      autoWidth: false,
      margin: 10
    });
    $owl.trigger('refresh.owl.carousel');
  }

  // Home slider mobile
  if ($(".home-sliderMb_inner .owl-carousel").length) {
    var $owlMb = $(".home-sliderMb_inner .owl-carousel").owlCarousel({
      items: 1,
      loop: false,
      lazyLoad: true,
      rewind: false,
      autoplay: true,
      autoplayTimeout: 6000,
      autoplayHoverPause: true,
      smartSpeed: 500,
      mouseDrag: true,
      nav: false,
      autoWidth: false,
      margin: 0
    });
    $owlMb.trigger('refresh.owl.carousel');
  }

  // Latest news slider
  if ($(".latest-news_body-box").length) {
    $(".latest-news_body-box").owlCarousel({
      items: 1,
      loop: false,
      rewind: false,
      autoplay: true,
      autoplayTimeout: 6000,
      autoplayHoverPause: true,
      smartSpeed: 300,
      dots: false,
      nav: true,
      navText: ['<i class="fas fa-angle-left text-secondary fa-2xl"></i>', '<i class="fas fa-angle-right text-secondary fa-2xl"></i>'],
      autoWidth: false,
      margin: 20
    });
  }

  // Collection slider
  if ($(".collection-slider .owl-carousel").length) {
    var $owlCol = $(".collection-slider .owl-carousel").owlCarousel({
      items: 6,
      responsive: {
        0: { items: 2 },
        600: { items: 3 },
        768: { items: 4 },
        1024: { items: 5 },
        1200: { items: 6 }
      },
      loop: false,
      autoplay: true,
      autoplayTimeout: 6000,
      smartSpeed: 300,
      nav: true,
      dots: false,
      navText: [
        '<i class="fas fa-angle-left text-secondary fa-2xl"></i>',
        '<i class="fas fa-angle-right text-secondary fa-2xl"></i>'
      ],
      margin: 15
    });
    $owlCol.trigger("refresh.owl.carousel");
  }

  // Book detail carousel
  if ($("#BookDetailSection-carousel").length) {
    var $owlDetail = $("#BookDetailSection-carousel").owlCarousel({
      responsive: {
        0: { items: 1, nav: true, mouseDrag: true, touchDrag: true },
        991: { items: 1, mouseDrag: false, touchDrag: false }
      },
      loop: false,
      autoplay: false,
      smartSpeed: 300,
      lazyLoad: true,
      dots: false,
      nav: true,
      margin: 0
    });
  }

  // Topic box mobile
  if ($(".topic-box-mb").length) {
    $(".topic-box-mb").owlCarousel({
      items: 3,
      responsive: {
        0: { items: 2 },
        480: { items: 3 },
        768: { items: 4 }
      },
      loop: false,
      autoplay: false,
      dots: false,
      nav: false,
      margin: 10
    });
  }
});
</script>`;

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "assets")
      results.push(...findHtmlFiles(full));
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

function main() {
  const htmlFiles = findHtmlFiles(OUTPUT_DIR);
  console.log(`📄 Found ${htmlFiles.length} HTML files\n`);

  let count = 0;

  for (const htmlPath of htmlFiles) {
    const relPath = path.relative(OUTPUT_DIR, htmlPath);
    let html = fs.readFileSync(htmlPath, "utf8");

    // Step 1: Remove any previously injected scripts (from earlier fix attempts)
    html = html.replace(
      /<script[^>]*src="[^"]*jquery\.min\.js"[^>]*><\/script>\s*/gi,
      "",
    );
    html = html.replace(
      /<script[^>]*src="[^"]*owl\.carousel\.min\.js"[^>]*><\/script>\s*/gi,
      "",
    );
    html = html.replace(
      /<script[^>]*src="[^"]*main\.js"[^>]*><\/script>\s*/gi,
      "",
    );
    // Remove old inline init if any
    html = html.replace(
      /<script>\s*\$\(document\)\.ready\(function\(\)\s*\{[\s\S]*?initTypicalSlider[\s\S]*?\}\);\s*<\/script>\s*/g,
      "",
    );

    // Step 2: Calculate asset prefix based on depth
    const depth = relPath.split(path.sep).length - 1;
    const prefix = depth > 0 ? "../".repeat(depth) : "";

    // Step 3: Build injection block
    const scriptBlock = `
<script src="${prefix}assets/js/jquery.min.js"></script>
<script src="${prefix}assets/js/owl.carousel.min.js"></script>
${CAROUSEL_INIT_SCRIPT}
</body>`;

    // Step 4: Replace </body>
    if (html.includes("</body>")) {
      html = html.replace("</body>", scriptBlock);
    } else {
      html += scriptBlock;
    }

    fs.writeFileSync(htmlPath, html, "utf8");
    console.log(`  ✓ ${relPath} (prefix: "${prefix}")`);
    count++;
  }

  console.log(
    `\n✅ Done! ${count}/${htmlFiles.length} files updated with carousel scripts`,
  );
}

main();
