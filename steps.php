<?php
declare(strict_types=1);

$dataDir = __DIR__ . '/data'; // use root data folder so both DQ and DR subfolders work
$defaultFile = 'DQ/DQ_5.json';
$allowedLangs = ['pt', 'en', 'es', 'fr'];

// Recebe parâmetros
$rawFile = isset($_GET['file']) ? $_GET['file'] : $defaultFile;
$lang = isset($_GET['lang']) && in_array($_GET['lang'], $allowedLangs) ? $_GET['lang'] : 'pt';

// Normalize file parameter: prevent backslashes, strip leading slashes
$rawFile = str_replace('\\', '/', (string) $rawFile);
$rawFile = ltrim($rawFile, '/');

// Reject any directory traversal attempts explicitly
if (strpos($rawFile, '..') !== false) {
  http_response_code(404);
  echo "Conteúdo inválido.";
  exit;
}

$file = $rawFile;

// Extract just the basename and validate it to ensure it looks like 'NAME.json'
$base = basename($file);
if (!preg_match('/^[A-Za-z0-9._-]+\.json$/', $base)) {
  http_response_code(404);
  echo "Conteúdo inválido.";
  exit;
}

// Caminho seguro para o ficheiro: calcular realpath do dataDir primeiro
$dataDirReal = realpath($dataDir);
if ($dataDirReal === false) {
  http_response_code(500);
  echo "Configuração inválida: dataDir não existe.";
  exit;
}

$jsonPath = realpath($dataDirReal . DIRECTORY_SEPARATOR . $file);

// Segurança: garantir que o ficheiro fica dentro de dataDir
if ($jsonPath === false || strpos($jsonPath, $dataDirReal . DIRECTORY_SEPARATOR) !== 0 || !is_readable($jsonPath)) {
  http_response_code(404);
  echo "Conteúdo não encontrado.";
  exit;
}

// Ler e decodificar JSON
$jsonRaw = file_get_contents($jsonPath);
$content = json_decode($jsonRaw, true);
if (!is_array($content)) {
  http_response_code(500);
  echo "Erro a ler ficheiro JSON.";
  exit;
}

// Helper para obter texto com fallback (retorna já escapado)
function t($node, $lang, $fallback = '')
{
  if (!is_array($node))
    return htmlspecialchars($fallback, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  if (isset($node[$lang]) && $node[$lang] !== '')
    return htmlspecialchars($node[$lang], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  if (isset($node['pt']) && $node['pt'] !== '')
    return htmlspecialchars($node['pt'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  foreach ($node as $v) {
    if ($v !== '')
      return htmlspecialchars((string) $v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  }
  return htmlspecialchars($fallback, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Sanitiza src de imagens
function sanitize_image_src($src, $jsonPath = null, $jsonFilename = null)
{
  $src = trim((string) $src);
  $src = str_replace("\0", '', $src);
  if ($src === '')
    return '';
  if (preg_match('#^[a-zA-Z][a-zA-Z0-9+.-]*:#', $src) || strpos($src, '//') === 0) {
    return '';
  }
  if (strpos($src, '/') === 0) {
    return htmlspecialchars($src, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  }
  if ($jsonPath) {
    $candidate = realpath(dirname($jsonPath) . DIRECTORY_SEPARATOR . $src);
    $projectRoot = realpath(__DIR__);
    if ($candidate && $projectRoot && strpos($candidate, $projectRoot) === 0 && is_file($candidate)) {
      $relative = str_replace('\\', '/', substr($candidate, strlen($projectRoot)));
      if ($relative === '' || $relative[0] !== '/')
        $relative = '/' . $relative;
      $webBase = dirname($_SERVER['SCRIPT_NAME']);
      if ($webBase === '/' || $webBase === '\\')
        $webBase = '';
      $webPath = $webBase . $relative;
      return htmlspecialchars($webPath, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
    $projectRoot = realpath(__DIR__);
    if ($projectRoot && $jsonFilename) {
      $prefix = strtoupper(substr($jsonFilename, 0, 3));
      $altDir = null;
      if (strpos($prefix, 'DQ_') === 0 || strpos($jsonFilename, 'DQ_') === 0) {
        $altDir = $projectRoot . DIRECTORY_SEPARATOR . 'repairs' . DIRECTORY_SEPARATOR . 'DQ';
      } elseif (strpos($prefix, 'DR_') === 0 || strpos($jsonFilename, 'DR_') === 0) {
        $altDir = $projectRoot . DIRECTORY_SEPARATOR . 'repairs' . DIRECTORY_SEPARATOR . 'DR';
      } else {
        $altDir = $projectRoot . DIRECTORY_SEPARATOR . 'repairs';
      }
      if ($altDir) {
        $candidate2 = realpath($altDir . DIRECTORY_SEPARATOR . $src);
        if ($candidate2 && strpos($candidate2, $projectRoot) === 0 && is_file($candidate2)) {
          $relative = str_replace('\\', '/', substr($candidate2, strlen($projectRoot)));
          if ($relative === '' || $relative[0] !== '/')
            $relative = '/' . $relative;
          $webBase = dirname($_SERVER['SCRIPT_NAME']);
          if ($webBase === '/' || $webBase === '\\')
            $webBase = '';
          $webPath = $webBase . $relative;
          return htmlspecialchars($webPath, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        }
      }
    }
  }
  return htmlspecialchars($src, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

// Preparar itens
$pageTitle = t($content['meta']['title_tag'] ?? $content['idconteudo'] ?? null, $lang, 'Untitled');
$mainTitle = t($content['idconteudo'] ?? null, $lang, '');
$timeText = t($content['meta']['tempo_estimado'] ?? null, $lang, '');
$parts = $content['parts'] ?? [];
$steps = $content['steps'] ?? [];
$footer = $content['footer'] ?? [];
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <title><?= $pageTitle ?> — Suporte Nexled</title>

  <!-- 1. Load Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap"
    rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css" rel="stylesheet">

  <!-- 2. Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- 3. Design System CSS -->
  <link rel="stylesheet" href="src/styles/main.css">

  <!-- 4. Configure Tailwind with NexLed tokens -->
  <script src="src/config-cdn.js"></script>

  <style type="text/tailwindcss">
    @layer components {
            .custom-scrollbar { @apply overflow-y-auto; }
            .custom-scrollbar::-webkit-scrollbar { @apply w-8; }
            .custom-scrollbar::-webkit-scrollbar-button { @apply hidden; }
            .custom-scrollbar::-webkit-scrollbar-track { @apply bg-transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-grey-secondary rounded-full border-thin border-white bg-clip-padding transition-colors duration-default ease-premium; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover,
            .custom-scrollbar.is-scrolling::-webkit-scrollbar-thumb { @apply bg-green-primary; }
            .custom-scrollbar::-webkit-scrollbar-thumb:active { @apply bg-green-secondary; }
        }
    </style>
</head>

<body class="text-black selection:bg-green-primary/10 flex min-h-screen flex-col">

  <!-- TOP NAVIGATION -->
  <header class="fixed top-0 left-0 w-full z-sticky px-32 py-24 pointer-events-none">
    <div
      class="max-w-wide mx-auto bg-white/80 backdrop-blur-xl border border-white/40 shadow-btn-default rounded-2xl flex items-center justify-between px-32 py-24 pointer-events-auto transition-all duration-default ease-premium hover:shadow-btn-hover">

      <!-- Logo -->
      <a href="index.php" class="flex items-center gap-12 group">
        <div
          class="w-40 h-40 bg-white border border-grey-tertiary rounded-xs flex items-center justify-center shadow-sm group-hover:scale-hover transition-transform overflow-hidden">
          <img src="favicon.svg" alt="Nexled" class="w-24 h-24">
        </div>
        <div class="flex flex-col">
          <span class="font-semibold text-body-lg leading-none tracking-tight text-black">Nexled</span>
          <span class="text-body-xs font-mono text-grey-primary uppercase tracking-wider">Suport Page</span>
        </div>
      </a>

      <!-- Center Navigation -->
      <nav class="hidden lg:flex items-center gap-24">
        <div class="flex items-center gap-8 cursor-pointer group">
          <span class="text-body-sm font-medium text-grey-primary group-hover:text-black transition-colors">Repairs
            Guides</span>
          <i class="ri-arrow-down-s-line text-icon-sm text-grey-primary group-hover:text-black"></i>
        </div>
        <div class="flex items-center gap-8 cursor-pointer group">
          <span class="text-body-sm font-medium text-grey-primary group-hover:text-black transition-colors">Download
            Files</span>
          <i class="ri-arrow-down-s-line text-icon-sm text-grey-primary group-hover:text-black"></i>
        </div>
      </nav>

      <!-- Right Actions -->
      <div class="flex items-center gap-16">
        <a href="contact.html"
          class="px-16 py-8 border border-grey-tertiary rounded-full text-body-xs font-medium text-grey-primary hover:text-black hover:bg-grey-tertiary/20 transition-all">
          Contact Us
        </a>
        <a href="#"
          class="px-16 py-8 bg-green-primary rounded-lg text-white text-body-xs font-medium flex items-center gap-8 hover:bg-green-secondary transition-all shadow-btn-default">
          <i class="ri-shopping-bag-line text-icon-sm"></i>
          Shop
        </a>

        <!-- Language Selector -->
        <div class="flex items-center gap-8 px-8 py-4 border border-grey-tertiary rounded-lg bg-grey-tertiary/10">
          <span class="text-body-lg">🇬🇧</span>
          <i class="ri-arrow-down-s-line text-icon-sm text-grey-primary"></i>
        </div>
      </div>

    </div>
  </header>

  <!-- CONTENT -->
  <main class="flex-1 mt-[160px] px-32 pb-64 max-w-wide mx-auto w-full">

    <!-- BREADCRUMBS -->
    <nav class="flex items-center gap-8 text-body-xs text-grey-primary mb-32 uppercase tracking-widest"
      aria-label="Breadcrumb">
      <a href="#" class="hover:text-black">Lorum</a>
      <span>></span>
      <a href="#" class="hover:text-black">Lorum</a>
      <span>></span>
      <a href="#" class="hover:text-black">Lorum</a>
      <span>></span>
      <span class="font-bold text-black border-b border-black">Lorum</span>
    </nav>

    <!-- HERO SECTION -->
    <header class="text-center mb-64 max-w-readable mx-auto">
      <h1 class="text-display font-medium text-black mb-24"><?= $mainTitle ?: 'Power Supply Replacement' ?></h1>
      <p class="text-body-sm text-grey-primary leading-relaxed">
        Here you will find a complete collection of support materials, including procedural guides, product datasheets,
        and relevant warnings. These resources are designed to assist in understanding system features, ensuring proper
        handling of product information, and maintaining compliance with required standards.
      </p>
    </header>

    <!-- SUMMARY CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-24 mb-64">

      <!-- Estimated Time -->
      <div class="bg-white border border-grey-tertiary rounded-xl p-24 shadow-sm">
        <h3 class="text-body-sm font-semibold text-black mb-12">Estimated Time & Difficulty</h3>
        <p class="text-body-xs text-black leading-relaxed">
          <strong class="font-bold">Approximately 5 to 10 minutes and the repair can be done by anybody.</strong><br>
          <span class="text-grey-primary mt-8 block">The direction may vary depending on the user's familiarity with the
            process and whether all steps proceed smoothly as planned.</span>
        </p>
      </div>

      <!-- Required Parts -->
      <div class="bg-white border border-grey-tertiary rounded-xl p-24 shadow-sm">
        <h3 class="text-body-sm font-semibold text-black mb-12">Required Parts and Tools</h3>
        <p class="text-body-xs text-grey-primary mb-12">Some of these items might also be purchased directly from our
          online store.</p>
        <ul class="space-y-4">
          <?php if (!empty($parts)): ?>
            <?php foreach ($parts as $p):
              $name = t($p['name'] ?? null, $lang, '');
              ?>
              <li class="flex items-center justify-between group cursor-pointer">
                <span class="text-body-xs text-black font-medium underline underline-offset-2"><?= $name ?></span>
                <i
                  class="ri-arrow-right-up-line text-icon-xs text-black opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </li>
            <?php endforeach; ?>
          <?php else: ?>
            <li class="flex items-center justify-between group cursor-pointer">
              <span class="text-body-xs text-black font-medium underline underline-offset-2">24v Power Supply</span>
              <i class="ri-arrow-right-up-line text-icon-xs text-black"></i>
            </li>
            <li class="flex items-center justify-between group cursor-pointer">
              <span class="text-body-xs text-black font-medium underline underline-offset-2">Connector</span>
              <i class="ri-arrow-right-up-line text-icon-xs text-black"></i>
            </li>
            <li class="flex items-center justify-between">
              <span class="text-body-xs text-black font-medium">Screwdriver</span>
            </li>
          <?php endif; ?>
        </ul>
      </div>

      <!-- Print Card -->
      <div class="bg-white border border-grey-tertiary rounded-xl p-24 shadow-sm">
        <h3 class="text-body-sm font-semibold text-black mb-12">Print Step In This Page</h3>
        <p class="text-body-xs text-grey-primary mb-24">
          You can use the button below to print all the steps directly onto paper for easier reference during the
          process.
        </p>
        <div class="flex justify-end">
          <button onclick="window.print()"
            class="px-20 py-8 bg-green-primary text-white text-body-xs font-semibold rounded-lg hover:bg-green-secondary transition-all shadow-btn-default">
            Print Page
          </button>
        </div>
      </div>

    </div>


    <!-- STEPS -->
    <section id="steps" class="mt-32">
      <h2 class="text-h3 font-semibold text-black mb-24">Steps</h2>

      <div class="space-y-24">
        <?php foreach ($steps as $i => $step):
          $stepTitle = t($step['title'] ?? null, $lang, 'Switch off the power');
          $stepImg = sanitize_image_src($step['image'] ?? 'img/power_switch.webp', $jsonPath, $file);
          $stepImgAlt = t($step['image_alt'] ?? null, $lang, '');
          $stepDesc = t($step['description'] ?? null, $lang, 'Switch off the power at the electrical panel before starting the intervention');
          $stepNum = $i + 1;
          ?>
          <div
            class="bg-white border border-grey-tertiary rounded-xl overflow-hidden hover:shadow-hover transition-all duration-default ease-premium p-16">
            <div class="flex flex-col md:flex-row gap-32">

              <!-- Step image -->
              <div class="md:w-[48%] aspect-[16/10] rounded-lg overflow-hidden flex-shrink-0">
                <img src="<?= $stepImg ?>" alt="<?= $stepImgAlt ?>" class="w-full h-full object-cover">
              </div>

              <!-- Step content -->
              <div class="flex flex-col justify-center py-24 px-16">
                <h3 class="text-body-lg font-semibold text-black mb-12">
                  <span class="mr-4"><?= $stepNum ?>.</span><?= $stepTitle ?>
                </h3>
                <p class="text-body-xs text-grey-primary leading-relaxed max-w-sm">
                  <?= $stepDesc ?>
                </p>
              </div>

            </div>
          </div>
        <?php endforeach; ?>

        <!-- Example static steps if $steps is empty for testing UI alignment -->
        <?php if (empty($steps)): ?>
          <?php for ($k = 1; $k <= 3; $k++): ?>
            <div
              class="bg-white border border-grey-tertiary rounded-xl overflow-hidden hover:shadow-hover transition-all duration-default ease-premium p-16">
              <div class="flex flex-col md:flex-row gap-32">
                <div class="md:w-[48%] aspect-[16/10] rounded-lg overflow-hidden flex-shrink-0">
                  <img src="img/repair_step_placeholder.webp" alt="Step" class="w-full h-full object-cover">
                </div>
                <div class="flex flex-col justify-center py-24 px-16">
                  <h3 class="text-body-lg font-semibold text-black mb-12">
                    <span class="mr-4"><?= $k ?>.</span>Switch off the power
                  </h3>
                  <p class="text-body-xs text-grey-primary leading-relaxed max-w-sm">
                    Switch off the power at the electrical panel before starting the intervention
                  </p>
                </div>
              </div>
            </div>
          <?php endfor; ?>
        <?php endif; ?>
      </div>
    </section>

    </div>
  </main>

  <!-- FOOTER -->
  <footer class="mt-64 px-32 pb-32">
    <div class="max-w-wide mx-auto bg-white border border-grey-tertiary rounded-3xl overflow-hidden shadow-sm">
      <div class="p-48 grid grid-cols-2 md:grid-cols-6 gap-32">

        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-center gap-12 mb-24">
            <div
              class="w-48 h-48 border-2 border-green-primary rounded-xl flex items-center justify-center overflow-hidden p-4">
              <img src="favicon.svg" alt="Nexled" class="w-full h-full object-contain">
            </div>
          </div>
          <div class="flex flex-col gap-8">
            <a href="#" class="flex items-center gap-8 text-grey-primary hover:text-black transition-colors">
              <i class="ri-linkedin-fill text-icon-sm"></i>
              <span class="text-body-xs font-medium">Nunc</span>
            </a>
            <a href="#" class="flex items-center gap-8 text-grey-primary hover:text-black transition-colors">
              <i class="ri-linkedin-fill text-icon-sm"></i>
              <span class="text-body-xs font-medium">Ornare</span>
            </a>
            <a href="#" class="flex items-center gap-8 text-grey-primary hover:text-black transition-colors">
              <i class="ri-linkedin-fill text-icon-sm"></i>
              <span class="text-body-xs font-medium">Condimentum</span>
            </a>
            <a href="#" class="flex items-center gap-8 text-grey-primary hover:text-black transition-colors">
              <i class="ri-linkedin-fill text-icon-sm"></i>
              <span class="text-body-xs font-medium">Neque</span>
            </a>
            <a href="#" class="flex items-center gap-8 text-grey-primary hover:text-black transition-colors">
              <i class="ri-linkedin-fill text-icon-sm"></i>
              <span class="text-body-xs font-medium">Neque</span>
            </a>
          </div>
        </div>

        <!-- Links Columns -->
        <?php
        $footerCols = [
          'Lobortis' => ['Nunc', 'Ornare', 'Condimentum', 'Neque', 'Neque'],
          'Consectetur 1' => ['Nunc', 'Ornare', 'Condimentum', 'Neque'],
          'Consectetur 2' => ['Nunc', 'Ornare', 'Condimentum', 'Neque'],
          'Consectetur 3' => ['Nunc', 'Ornare', 'Condimentum', 'Neque'],
          'Consectetur 4' => ['Nunc', 'Ornare', 'Condimentum', 'Neque']
        ];
        foreach ($footerCols as $title => $links): ?>
          <div class="flex flex-col gap-16">
            <h4 class="text-body-sm font-bold text-black"><?= trim(preg_replace('/\d+/', '', $title)) ?></h4>
            <ul class="space-y-12">
              <?php foreach ($links as $link): ?>
                <li><a href="#" class="text-body-xs text-grey-primary hover:text-black transition-colors"><?= $link ?></a>
                </li>
              <?php endforeach; ?>
            </ul>
          </div>
        <?php endforeach; ?>

      </div>

      <!-- Green Bottom Bar -->
      <div class="bg-green-primary px-48 py-16 flex flex-wrap justify-between items-center gap-16">
        <p class="text-body-xs font-medium text-white/80">Follon losque</p>
        <p class="text-body-xs font-medium text-white/80">Follon losque</p>
        <p class="text-body-xs font-medium text-white/80">Follon losque</p>
        <p class="text-body-xs font-medium text-white/80">Follon losque</p>
        <p class="text-body-xs font-medium text-white/80">Follon losque</p>
      </div>
    </div>
  </footer>

  <script>
    // Language persistence
    (function () {
      var select = document.getElementById('lang-select');
      if (!select) return;
      var params = new URLSearchParams(location.search);
      var currentLang = params.get('lang') || select.value || 'pt';
      try {
        var saved = localStorage.getItem('nexled.lang');
        if (saved && saved !== currentLang) {
          params.set('lang', saved);
          location.search = params.toString();
          return;
        }
      } catch (e) { }
      select.value = currentLang;
      select.addEventListener('change', function () {
        var v = select.value;
        try { localStorage.setItem('nexled.lang', v); } catch (e) { }
        var p = new URLSearchParams(location.search);
        p.set('lang', v);
        location.search = p.toString();
      });
    })();

    // Custom scrollbar scroll detection
    const scrollContainers = document.querySelectorAll('.custom-scrollbar');
    scrollContainers.forEach(container => {
      let scrollTimeout;
      container.addEventListener('scroll', () => {
        container.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => container.classList.remove('is-scrolling'), 1000);
      });
    });
  </script>
</body>

</html>